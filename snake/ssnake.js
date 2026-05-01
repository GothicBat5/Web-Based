/*
1 Things to address:
2 The UI is shit! hahaha it's terrible looking
3 The Canva is so small like a small square in the middle
4 No boundary collision, that's boring
5 Bug! sometimes it did not pick the food! it just went thru it
6 The food just went all over the place in the beginning! 
There should be a start button to let the player prepared before it start the game! 
*/

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const snakeColorPicker = document.getElementById("snakeColor");
const foodColorPicker = document.getElementById("foodColor");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [ { x: 10, y: 10 } ];

let velocity = { x: 0, y: 0 };

let food = randomFood();

let gameSpeed = 100;

//Game loop
function gameLoop() 
{

    update();

    draw();
}

setInterval(gameLoop, gameSpeed);

//update ->

function update() 
{

    const head = 
    {
        x: snake[0].x + velocity.x,
        y: snake[0].y + velocity.y
    };

    //wrap arounds
    if (head.x < 0) 
    {
        head.x = tileCount - 1;
    }

    if (head.x >= tileCount) 
    {
        head.x = 0;
    }

    if (head.y < 0) 
    {
        head.y = tileCount - 1;
    }

    if (head.y >= tileCount) 
    {
        head.y = 0;
    }

    //collision
    for (let segment of snake) 
    {

        if (segment.x === head.x && segment.y === head.y) 
        {
            resetGame();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) 
    {
        food = randomFood();
    }

    else 
    {
        snake.pop();
    }
}

//draw
function draw() 
{

    ctx.fillStyle = "black";

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = snakeColorPicker.value;

    for (let segment of snake) 
    {
        ctx.fillRect( segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2 );
    }

    ctx.fillStyle = foodColorPicker.value;

    ctx.fillRect(food.x * gridSize,food.y * gridSize, gridSize - 2, gridSize - 2
    );
}

function randomFood() 
{
    return {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

window.addEventListener("keydown", (e) => {

    switch (e.key) 
    {

        case "ArrowUp":
            if (velocity.y === 1) break;  
            velocity = { x: 0, y: -1 };
            break;

        case "ArrowDown":
            if (velocity.y === -1) break;
            velocity = { x: 0, y: 1 };
            break;

        case "ArrowLeft":
            if (velocity.x === 1) break;
            velocity = { x: -1, y: 0 };
            break;

        case "ArrowRight":
            if (velocity.x === -1) break;
            velocity = { x: 1, y: 0 };
            break;
    }
});

function resetGame() 
{
    snake = [{ x: 10, y: 10 }];

    velocity = { x: 0, y: 0 };

    food = randomFood();
}