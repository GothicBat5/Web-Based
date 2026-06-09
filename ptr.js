const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Height: ", (input) => {

    const height = parseInt(input);

    if (isNaN(height) || height <= 0) 
    {
        console.log("Invalid number.");
        rl.close();
        return;
    }

    for (let row = 1; row <= height; row++) 
    {

        let spaces = " ".repeat(height - row);
        let stars = "*".repeat(row * 2 - 1);

        console.log(spaces + stars);
    }

    rl.close();
});
