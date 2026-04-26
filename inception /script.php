<?php
echo "Number: ";
$input = trim(fgets(STDIN));

$number = (int)$input; 

if ($number % 2 === 0) 
{
    echo "The number $input is a even number\n";
} 

else 
{
    echo "The number $input is a odd number\n";
}

//The script is now cut into the new one to not waste time and space
//It will be representative as = C


echo "Enter your age: ";
$input = trim(fgets(STDIN));

echo "Enter your name: ";
$name = trim(fgets(STDIN));

if (!is_numeric($input)) 
{
    echo "Invalid input\n";
    exit;
}

$age = (int)$input;

if ($age >= 18) 
{
    echo "\n$name is an adult\n";
} 
else 
{
    echo "\n$name is a minor\n";
}

// = C

<?php

$num1 = 10;
$num2 = 5;

$operator = "*";


switch ($operator) 
{
    case "+":
        $result = $num1 + $num2;
        break;
    case "-":
        $result = $num1 - $num2;
        break;
    case "*":
        $result = $num1 * $num2;
        break;
    case "/":
        if ($num2 != 0) 
        {
            $result = $num1 / $num2;
        } 
        
        else 
        {
            $result = "Error: Division by zero!";
        }
        break;
    default:
        $result = "Invalid operator!";
}

echo "Calculation: $num1 $operator $num2 = $result\n";
?>
