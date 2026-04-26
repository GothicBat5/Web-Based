
const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertices = [
    new Vec3(-1,-1,-1), new Vec3(1,-1,-1),
    new Vec3(1,1,-1), new Vec3(-1,1,-1),
    new Vec3(-1,-1,1), new Vec3(1,-1,1),
    new Vec3(1,1,1), new Vec3(-1,1,1)
];

const faces = [
    [0,1,2,3],
    [4,5,6,7],
    [0,1,5,4],
    [2,3,7,6],
    [1,2,6,5],
    [0,3,7,4]
];

const colors = ["red","blue","green","yellow","purple","orange"];

const camera = {
    x: 0,
    y: 0,
    z: -5
};

let rotX = 0;
let rotY = 0;


const keys = {};

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

let dragging = false, lastX = 0, lastY = 0;

canvas.addEventListener("mousedown", e=>{
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener("mouseup", ()=> dragging = false);

canvas.addEventListener("mousemove", e=>{

    if(!dragging)
    {
        return;
    }

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    rotY += dx * 0.01;
    rotX += dy * 0.01;

    lastX=e.clientX;
    lastY=e.clientY;
});


function updateCamera(dt) 
{

    const speed = 5;

    if(keys["w"])
    {
        camera.z += speed*dt;
    } 

    if(keys["s"]) 
    {
        camera.z -= speed*dt;
    }

    if(keys["a"])
    {
        camera.x -= speed*dt;
    } 

    if(keys["d"]) 
    {
        camera.x += speed*dt;
    }
}

let lastTime=0;

function loop(time) {

    const dt = (time - lastTime) / 1000;
    lastTime = time;

    updateCamera(dt);

    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width, canvas.height);

    let transformed=[];

    for(let v of vertices)
    {

        let r = rotateX(v,rotX);
        r = rotateY(r,rotY);
        r = r.add(new Vec3(camera.x,camera.y,0));
        transformed.push(r);
    }

    let facesToDraw=[];

    for(let i = 0; i < faces.length; i++)
    {

        const face = faces[i];
        const v0 = transformed[face[0]];
        const v1 = transformed[face[1]];
        const v2 = transformed[face[2]];

        // Normal
        const normal = v1.subtract(v0).cross(v2.subtract(v0));

        // Backface culling
        if(normal.z > 0) continue;

        const projected = face.map(idx => project(transformed[idx], camera, canvas));

        const avgZ = projected.reduce((sum,p)=>sum+p.z,0)/4;

        facesToDraw.push({
            points: projected,
            depth: avgZ,
            color: colors[i]
        });
    }

    // Depth sort
    facesToDraw.sort((a,b)=> b.depth - a.depth);

    // Draw
    for(let f of facesToDraw)
    {

        ctx.beginPath();
        ctx.moveTo(f.points[0].x, f.points[0].y);

        for(let p of f.points)
        {
            ctx.lineTo(p.x,p.y);
        }

        ctx.closePath();
        ctx.fillStyle=f.color;
        ctx.fill();
        ctx.strokeStyle="black";
        ctx.stroke();
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
