const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin, output: process.stdout});

function evaluateExpression(expression)
{
    try {
            expression = expression.trim();

        if (!expression)
        {
            throw new Error("Input cannot be empty.");
        }

        if (!/^[0-9+\-*/().\s]+$/.test(expression))
        {
            throw new Error("Invalid characters detected.");
        }

        const result = Function(`"use strict"; return (${expression})`)();

        if (!Number.isFinite(result))
        {
            throw new Error("Division by zero.");
        }

        return result;
    }
    catch (error)
    {
        return `Error: ${error.message}`;
    }
}

function ask()
{
    rl.question("Input: ", (input) => {
        if (input.toLowerCase() === "exit")
        {
            console.log("\nProgram Ended");
            rl.close();
            return;
        }

        console.log(`Result: ${evaluateExpression(input)}`);

        ask();
    });
}
console.log("< JS Calculator >");
console.log("Input 'exit' to close.\n");

ask();
