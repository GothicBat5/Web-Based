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

    subtract(v) 
    {
        this.x -= v.x;
        this.y -= v.y;

        return this;
    }

    multiply(s) 
    {
        this.x *= s;
        this.y *= s;

        return this;
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


class Ball 
{
    constructor(x, y) 
    {

        this.position = new Vector(x, y);

        this.velocity = new Vector((Math.random() - 0.5) * 200, Math.random() * -200 );

        this.radius = 10 + Math.random() * 10;

        this.gravity = new Vector(0, 500);

        this.friction = 0.7;

        //Random color
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    }

    update(dt) 
    {
        this.velocity.add(this.gravity.clone().multiply(dt));

        this.position.add(this.velocity.clone().multiply(dt));

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

    draw() {
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

        //separate overlapping balls
        const overlap = minDist - dist;
        b1.position.add(n.clone().multiply(-overlap / 2));
        b2.position.add(n.clone().multiply(overlap / 2));

        //velocity
        const relativeVelocity = b2.velocity.clone().subtract(b1.velocity);

        const speed = relativeVelocity.dot(n);

        if (speed > 0)
        {
            return;
        }

        const impulse = -2 * speed / 2;

        const impulseVector = n.clone().multiply(impulse);

        b1.velocity.subtract(impulseVector);
        b2.velocity.add(impulseVector);
    }
}


const balls = [];

let lastTime = 0;

//mouse
let mouseDown = false;
let startPos = null;
let currentMouse = null;

canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    startPos = new Vector(e.clientX, e.clientY);
});

canvas.addEventListener("mousemove", (e) => {
    currentMouse = new Vector(e.clientX, e.clientY);
});

canvas.addEventListener("mouseup", (e) => {

    if (!mouseDown) 
    {
        return;
    }

    const endPos = new Vector(e.clientX, e.clientY);

    const velocity = new Vector((endPos.x - startPos.x) * 5,
        (endPos.y - startPos.y) * 5 );

    const ball = new Ball(startPos.x, startPos.y);
    ball.velocity = velocity;

    balls.push(ball);

    mouseDown = false;
});

//animation

function animate(time) 
{

    const dt = (time - lastTime) / 1000;
    lastTime = time;

    ctx.fillStyle = "black";
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

    for (let ball of balls) 
    {
        ball.draw();
    }

    // Draw preview line
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
