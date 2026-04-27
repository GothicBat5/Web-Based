const readline = require("readline");

const RL = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function evaluateExpression(expression)
{
    try
    {
        if(!/^[0-9+\-*/().\s]+$/.test(expression))
        {
            throw new Error("\nInvalid Characters Detected\n");
        }
        
        const result = Function(`"use strict"; return (${expression})`)();
        
        if(typeof result !== "number" || !isFinite (result))
        {
            throw new Error("\nInvalid Calculations.\n");
        } 
        return result;
    }
    catch(error)
    {
        return `Error: $(error.message)`;
    }
}
function ask()
{
    RL.question("Input: ", (input) => {
        if(input.toLowerCase() === "exit")
        {
            console.log("\nProgram Ended");
            RL.close();
            return;
        }
        
        const result = evaluateExpression(input);
        console.log("Result: ", result);
        ask();
    });
}
console.log("< JS Calculator >\nInput Exit to close. \n"); ask();