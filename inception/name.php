
<?php
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
