/*
Improved:
Spacing, they need to have some space:
    So Hello World, not HelloWorld

Dark mode, at least we can do dark mode switches hehe

Final for now, more choices of words? that would be fun
*/

const inputBox = document.getElementById("inputBox");
const display = document.getElementById("display");

inputBox.addEventListener("input", updateText);

function updateText() 
{

    display.innerHTML = "";

    const text = inputBox.value;

    for (let i = 0; i < text.length; i++) 
    {

        const span = document.createElement("span");

        span.textContent = text[i];

        span.style.display = "inline-block";
        span.style.fontSize = "40px";

        display.appendChild(span);

        animateLetter(span, i);
    }
}

function animateLetter(letter, offset) 
{

    function frame() 
    {

        const y = Math.sin(Date.now() / 200 + offset * 0.5) * 15;

        letter.style.transform = `translateY(${y}px)`;

        requestAnimationFrame(frame);
    }

    frame();
}
