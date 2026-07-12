const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

//vertices
let vertices = [
  [-1, -1, -1],
  [ 1, -1, -1],
  [ 1,  1, -1],
  [-1,  1, -1],
  [-1, -1,  1],
  [ 1, -1,  1],
  [ 1,  1,  1],
  [-1,  1,  1]
];


const edges = [
  [0,1], [1,2], [2,3], [3,0], // back face
  [4,5], [5,6], [6,7], [7,4], // front face
  [0,4], [1,5], [2,6], [3,7]  // connecting edges
];

let angleX = 0;
let angleY = 0;
let angleZ = 0;

function project(x, y, z) 
{
  const scale = 150;  // zoom
  const distance = 4; // camera distance
  
  // Simple perspective projection
  const factor = scale / (distance + z);
  const px = x * factor + CENTER_X;
  const py = y * factor + CENTER_Y;
  
  return { x: px, y: py };
}

function rotateX(x, y, z) 
{
  const cos = Math.cos(angleX);
  const sin = Math.sin(angleX);
  return [
    x,
    y * cos - z * sin,
    y * sin + z * cos
  ];
}

function rotateY(x, y, z) 
{
  const cos = Math.cos(angleY);
  const sin = Math.sin(angleY);
  return [
    x * cos + z * sin,
    y,
    -x * sin + z * cos
  ];
}

function rotateZ(x, y, z) 
{
  const cos = Math.cos(angleZ);
  const sin = Math.sin(angleZ);
  return [
    x * cos - y * sin,
    x * sin + y * cos,
    z
  ];
}

function draw() 
{
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  //Rotate
  const rotatedVertices = vertices.map(v => {
    let [x, y, z] = v;
    [x, y, z] = rotateX(x, y, z);
    [x, y, z] = rotateY(x, y, z);
    [x, y, z] = rotateZ(x, y, z);
    return { x, y, z };
  });

  const projected = rotatedVertices.map(v => project(v.x, v.y, v.z));

  //edges
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  for (let [i, j] of edges) 
  {
    ctx.beginPath();
    ctx.moveTo(projected[i].x, projected[i].y);
    ctx.lineTo(projected[j].x, projected[j].y);
    ctx.stroke();
  }

  ctx.fillStyle = '#ffffff';
  
  for (let p of projected) 
  {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  //Update
  angleX += 0.015;
  angleY += 0.022;
  angleZ += 0.008;

  requestAnimationFrame(draw);
}

draw();
