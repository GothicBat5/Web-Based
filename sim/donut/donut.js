const CHARS = ".,-~:;=!*#$@";
const WIDTH = 80;
const HEIGHT = 40;
const SCREEN_SIZE = WIDTH * HEIGHT;

let A = 1;
let B = 1;

function render(screenEl)
{

    const buffer = new Array(SCREEN_SIZE).fill(" ");
    const zBuffer = new Array(SCREEN_SIZE).fill(0);

    const sinA = Math.sin(A), cosA = Math.cos(A);
    const sinB = Math.sin(B), cosB = Math.cos(B);

    for (let theta = 0; theta < 2 * Math.PI; theta += 0.07)
    {

        const sinTheta = Math.sin(theta);

        const cosTheta = Math.cos(theta);

        for (let phi = 0; phi < 2 * Math.PI; phi += 0.02)
        {
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const circleX = 2 + cosTheta;
            const circleY = sinTheta;

            const x = circleX * (cosB * cosPhi + sinA * sinB * sinPhi) - circleY * cosA * sinB;
            const y = circleX * (sinB * cosPhi - sinA * cosB * sinPhi) + circleY * cosA * cosB;
            const z = 5 + cosA * circleX * sinPhi + circleY * sinA;
            const invZ = 1 / z;

            const xp = Math.floor(WIDTH / 2 + 30 * invZ * x);
            const yp = Math.floor(HEIGHT / 2 - 15 * invZ * y);

            const index = xp + WIDTH * yp;

            if (yp >= 0 && yp < HEIGHT && xp >= 0 && xp < WIDTH)
            {

                if (invZ > zBuffer[index])
                {

                    zBuffer[index] = invZ;

                    const L =
                        cosPhi * cosTheta * sinB
                        - cosA * cosTheta * sinPhi
                        - sinA * sinTheta
                        + cosB * (cosA * sinTheta - cosTheta * sinA * sinPhi);

                    const charIndex = L > 0 ? Math.floor(L * (CHARS.length - 1)) : 0;
                    buffer[index] = CHARS[Math.min(charIndex, CHARS.length - 1)];
                }
            }
        }
    }

    let output = "";
    for (let row = 0; row < HEIGHT; row++)
    {

        output += buffer.slice(row * WIDTH, (row + 1) * WIDTH).join("") + "\n";
    }

    screenEl.textContent = output;

    A += 0.07;
    B += 0.03;
}

function start()
{
    
    const screenEl = document.getElementById("screen");
    setInterval(() => render(screenEl), 50);
}