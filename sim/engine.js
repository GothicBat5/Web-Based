const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Vector 
{

    constructor(x = 0, y = 0) 
    {

        this.x = x;
        this.y = y;
    }

    add(v) 
    { 

        this.x += v.x; this.y += v.y; return this; 
    }

    subtract(v) 
    { 

        this.x -= v.x; this.y -= v.y; return this; 
    }

    multiply(s) 
    { 

        this.x *= s; this.y *= s; return this; 
    }

    length() 
    { 

        return Math.sqrt(this.x * this.x + this.y * this.y); 
    }

    normalize() 
    {
        const len = this.length();

        if (len !== 0) 
        {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    dot(v) 
    { 

        return this.x * v.x + this.y * v.y; 
    }

    clone() 
    { 

        return new Vector(this.x, this.y); 
    }
}

class Ball {

    constructor(x, y, radius = 15) 
    {
        this.position = new Vector(x, y);
        this.velocity = new Vector(0, 0);

        this.radius = radius;
        this.mass = this.radius * 0.1;

        this.gravity = new Vector(0, 500);
        this.friction = 0.7;
        this.airDrag = 0.999;

        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;

    }

    update(dt) 
    {

        if (gravityEnabled) 
        {
            this.velocity.add(this.gravity.clone().multiply(dt));
        }

        //air resistance
        this.velocity.multiply(this.airDrag);

        this.position.add(this.velocity.clone().multiply(dt));

        if (this.position.y + this.radius > canvas.height) 
        {
            this.position.y = canvas.height - this.radius;
            this.velocity.y *= -this.friction;
        }

        if (this.position.x + this.radius > canvas.width) 
        {
            this.position.x = canvas.width - this.radius;
            this.velocity.x *= -1;
        }

        if (this.position.x - this.radius < 0) 
        {
            this.position.x = this.radius;
            this.velocity.x *= -1;
        }

        const speed = this.velocity.length();
        this.color = `hsl(${speed * 2}, 70%, 60%)`;
    }

    draw() 
    {
        ctx.beginPath();

        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);

        ctx.fillStyle = this.color;

        ctx.fill();
    }
}

function resolveCollision(b1, b2) 
{

    const normal = b2.position.clone().subtract(b1.position);
    const dist = normal.length();
    const minDist = b1.radius + b2.radius;

    if (dist < minDist) 
    {
        const n = normal.clone().normalize();
        const overlap = minDist - dist;
        b1.position.add(n.clone().multiply(-overlap / 2));
        b2.position.add(n.clone().multiply(overlap / 2));

        const relativeVelocity = b2.velocity.clone().subtract(b1.velocity);
        const speed = relativeVelocity.dot(n);

        if (speed > 0)
        {
            return;
        }

        const restitution = 0.9;

        const impulse = (-(1 + restitution) * speed) /(1 / b1.mass + 1 / b2.mass);

        const impulseVector = n.clone().multiply(impulse);

        b1.velocity.subtract(impulseVector.clone().multiply(1 / b1.mass));
        b2.velocity.add(impulseVector.clone().multiply(1 / b2.mass));
    }
}

const balls = [];

let lastTime = 0;

//controls
let gravityEnabled = true;
let currentRadius = 15;

//mouse 
let mouseDown = false;
let startPos = null;
let currentMouse = null;
let selectedBall = null;

//size control
canvas.addEventListener("wheel", (e) => {
    currentRadius += e.deltaY * -0.01;
    currentRadius = Math.max(5, Math.min(60, currentRadius));
});

canvas.addEventListener("mousedown", (e) => {
    const mouse = new Vector(e.clientX, e.clientY);

    //clicking existing ball
    for (let ball of balls) 
    {
        const dist = ball.position.clone().subtract(mouse).length();

        if (dist < ball.radius) 
        {

            selectedBall = ball;
            return;
        }
    }

    mouseDown = true;
    startPos = mouse;
});


canvas.addEventListener("mousemove", (e) => {
    currentMouse = new Vector(e.clientX, e.clientY);

    if (selectedBall) 
    {
        selectedBall.position = currentMouse.clone();
        selectedBall.velocity = new Vector(0, 0);
    }
});


canvas.addEventListener("mouseup", (e) => {
    if (selectedBall) {
        selectedBall = null;
        return;
    }

    if (!mouseDown)
    {
        return;
    }

    const endPos = new Vector(e.clientX, e.clientY);

    const dragVector = endPos.clone().subtract(startPos);

    const radius = Math.min(60, dragVector.length() * 0.1);

    const ball = new Ball(startPos.x, startPos.y, radius);

    ball.velocity = dragVector.clone().multiply(5);

    balls.push(ball);

    mouseDown = false;
});

//keyboard
window.addEventListener("keydown", (e) => {
    if (e.key === "c") 
    {
        balls.length = 0;
    }

    if (e.key === "g") 
    {
        gravityEnabled = !gravityEnabled;
    }

});

//animation
function animate(time) 
{

    const dt = (time - lastTime) / 1000;
    lastTime = time;

    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //update
    for (let ball of balls) 
    {
        ball.update(dt);
    }

    //collisions
    for (let i = 0; i < balls.length; i++) 
    {

        for (let j = i + 1; j < balls.length; j++) 
        {
            resolveCollision(balls[i], balls[j]);
        }
    }

    //draw
    for (let ball of balls) 
    {
        ball.draw();
    }

    // preview line
    if (mouseDown && startPos && currentMouse) 
    {
        ctx.beginPath();

        ctx.moveTo(startPos.x, startPos.y);

        ctx.lineTo(currentMouse.x, currentMouse.y);

        ctx.strokeStyle = "white";

        ctx.lineWidth = 2;
        
        ctx.stroke();
    }

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
