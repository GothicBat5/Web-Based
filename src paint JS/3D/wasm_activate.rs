use wasm_bindgen::prelude::*;

// Import the JS console for debugging
#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub struct MeshStats {
    pub vertex_count: usize,
    pub face_count: usize,
    pub min_x: f64,
    pub max_x: f64,
    pub min_y: f64,
    pub max_y: f64,
    pub min_z: f64,
    pub max_z: f64,
}

#[wasm_bindgen]
impl MeshStats {
    #[wasm_bindgen(constructor)]
    pub fn new() -> MeshStats {
        MeshStats {
            vertex_count: 0,
            face_count: 0,
            min_x: f64::MAX,
            max_x: f64::MIN,
            min_y: f64::MAX,
            max_y: f64::MIN,
            min_z: f64::MAX,
            max_z: f64::MIN,
        }
    }

    /// Calculates bounding box and counts based on raw vertex data.
    /// Expected input: A flat Vec<f64> of [x, y, z, x, y, z, ...]
    pub fn analyze_vertices(&mut self, vertices: &[f64]) -> String {
        let count = vertices.len() / 3;
        self.vertex_count = count;

        if count == 0 {
            return "No vertices found".to_string();
        }

        let mut min_x = f64::MAX;
        let mut max_x = f64::MIN;
        let mut min_y = f64::MAX;
        let mut max_y = f64::MIN;
        let mut min_z = f64::MAX;
        let mut max_z = f64::MIN;

        // Fast iteration in Rust
        for i in 0..count {
            let x = vertices[i * 3];
            let y = vertices[i * 3 + 1];
            let z = vertices[i * 3 + 2];

            if x < min_x { min_x = x; }
            if x > max_x { max_x = x; }
            if y < min_y { min_y = y; }
            if y > max_y { max_y = y; }
            if z < min_z { min_z = z; }
            if z > max_z { max_z = z; }
        }

        self.min_x = min_x;
        self.max_x = max_x;
        self.min_y = min_y;
        self.max_y = max_y;
        self.min_z = min_z;
        self.max_z = max_z;

        format!(
            "Vertices: {} | Bounds: X({:.2} to {:.2}), Y({:.2} to {:.2}), Z({:.2} to {:.2})",
            count, min_x, max_x, min_y, max_y, min_z, max_z
        )
    }
}

#[wasm_bindgen]
pub fn simple_add(a: i32, b: i32) -> i32 {
    a + b
}
