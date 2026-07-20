use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::collections::HashMap;
use tokio::net::TcpListener;

//Data Models

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Task {
    id: u64,
    title: String,
    completed: bool,
}

#[derive(Debug, Deserialize)]
struct CreateTaskRequest {
    title: String,
}

// We use a Mutex to allow safe concurrent access to our in-memory store.
// In a real app, you would use a database connection pool here.
type TaskStore = Mutex<HashMap<u64, Task>>;

// Handlers

async fn list_tasks(State(store): State<axum::extract::State<TaskStore>>) -> Json<Vec<Task>> {
    let tasks = store.lock().unwrap().values().cloned().collect();
    Json(tasks)
}

async fn create_task(
    State(store): State<axum::extract::State<TaskStore>>,
    Json(payload): Json<CreateTaskRequest>,
) -> Result<Json<Task>, StatusCode> {
    let mut store = store.lock().unwrap();

    let id = store.len() as u64 + 1;
    
    let task = Task {
        id,
        title: payload.title,
        completed: false,
    };
    
    store.insert(id, task.clone());
    
    Ok(Json(task))
}

async fn health_check() -> &'static str {
    "OK"
}


#[tokio::main]
async fn main() {
    // Initialize our shared state
    let store = TaskStore::default();
    let app_state = axum::extract::State(store);

    // Build our router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/tasks", get(list_tasks).post(create_task))
        .with_state(app_state);

    // Bind to a TCP listener
    let listener = TcpListener::bind("127.0.0.1:3000").await.unwrap();
    
    println!("Server running on http://127.0.0.1:3000");

    // Run the server
    axum::serve(listener, app).await.unwrap();
}
