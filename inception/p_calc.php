
<?php

echo "PHP Calculator Script\nX to Exit\n";

while (true) 
{
    echo "\nNum 1: ";
    $input1 = trim(fgets(STDIN));

    if (strtolower($input1) === 'x') 
    {
        echo "\nProgram Ended!\n";
        break;
    }

    if (!is_numeric($input1)) 
    {
        echo "Invalid number.\n";
        continue;
    }

    echo "\v(+, -, *, /)\nEnter operator: ";
    $operator = trim(fgets(STDIN));

    if (!in_array($operator, ['+', '-', '*', '/'])) 
    {
        echo "Invalid operator. Try again.\n";
        continue;
    }

    echo "\nNum 2: ";
    $input2 = trim(fgets(STDIN));

    if (!is_numeric($input2)) 
    {
        echo "Invalid number. Try again.\n";
        continue;
    }

    $num1 = (float)$input1;
    $num2 = (float)$input2;

    if ($operator === '/' && $num2 == 0) 
    {
        echo "Cannot divide by zero.\n";
        continue;
    }

    switch ($operator) 
    {
        case '+':
            $result = $num1 + $num2;
            break;
        case '-':
            $result = $num1 - $num2;
            break;
        case '*':
            $result = $num1 * $num2;
            break;
        case '/':
            $result = $num1 / $num2;
            break;
    }

    echo "\nResult: $result\n";
}
