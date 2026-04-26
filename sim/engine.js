const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


class Vector {

    constructor(x = 0, y = 0) 
    {
        this.x = x;
        this.y = y;
    }

    add(v) 
    {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    multiply(s) 
    {
        this.x *= s;
        this.y *= s;
        return this;
    }

    clone() 
    {
        return new Vector(this.x, this.y);
    }
}


class Ball {
    constructor(x, y) 
    {
        this.position = new Vector(x, y);
        this.velocity = new Vector(
            (Math.random() - 0.5) * 200,
            Math.random() * -200
        );

        this.radius = 10 + Math.random() * 10;
        this.gravity = new Vector(0, 500);
        this.friction = 0.7;
    }

    update(dt) 
    {
        //gravity
        this.velocity.add(this.gravity.clone().multiply(dt));
        this.position.add(this.velocity.clone().multiply(dt));

        //collision
        if (this.position.y + this.radius > canvas.height) 
        {
            this.position.y = canvas.height - this.radius;
            this.velocity.y *= -this.friction;
        }

        if (this.position.x + this.radius > canvas.width || this.position.x - this.radius < 0) 
        {
            this.velocity.x *= -1;
        }
    }

    draw() 
    {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
    }
}

const balls = [];

let lastTime = 0;

let mouseDown = false;
let startPos = null;

canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    startPos = new Vector(e.clientX, e.clientY);
});

canvas.addEventListener("mouseup", (e) => {

    if (!mouseDown) 
    {
        return; 
    }

    const endPos = new Vector(e.clientX, e.clientY);

    const velocity = new Vector( (endPos.x - startPos.x) * 5,(endPos.y - startPos.y) * 5);

    const ball = new Ball(startPos.x, startPos.y);
    ball.velocity = velocity;

    balls.push(ball);

    mouseDown = false;
});

function animate(time) 
{

    const dt = (time - lastTime) / 1000; 
    lastTime = time;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let ball of balls) 
    {
        ball.update(dt);
        ball.draw();
    }

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);