const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


class Vec3 
{
    constructor(x, y, z) 
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}


const vertices = [
    new Vec3(-1, -1, -1),
    new Vec3(1, -1, -1),
    new Vec3(1, 1, -1),
    new Vec3(-1, 1, -1),
    new Vec3(-1, -1, 1),
    new Vec3(1, -1, 1),
    new Vec3(1, 1, 1),
    new Vec3(-1, 1, 1),
];

const faces = [
    [0,1,2,3],
    [4,5,6,7],
    [0,1,5,4],
    [2,3,7,6],
    [1,2,6,5],
    [0,3,7,4],
];

const colors = ["red","blue","green","yellow","purple","orange"];


function rotateX(v, angle) 
{

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec3(
        v.x,
        v.y * cos - v.z * sin,
        v.y * sin + v.z * cos
    );
}

function rotateY(v, angle) 
{

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec3(
        v.x * cos + v.z * sin,
        v.y,
        -v.x * sin + v.z * cos
    );
}


function project(v) 
{
    const distance = 4;
    const scale = 200;

    const z = 1 / (distance - v.z);

    return { x: v.x * z * scale + canvas.width / 2, y: v.y * z * scale + canvas.height / 2};
}


let angle = 0;

function draw() 
{

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const transformed = [];

    for (let v of vertices) 
    {
        let r = rotateX(v, angle);
        r = rotateY(r, angle * 0.7);
        transformed.push(r);
    }

    //draw faces
    for (let i = 0; i < faces.length; i++) 
    {

        const face = faces[i];

        const points = face.map(index => project(transformed[index]));

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let p of points) 
        {
            ctx.lineTo(p.x, p.y);
        }

        ctx.closePath();

        ctx.fillStyle = colors[i];
        ctx.fill();

        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    angle += 0.01;

    requestAnimationFrame(draw);
}

draw();