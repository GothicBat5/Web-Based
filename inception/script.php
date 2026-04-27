
<?php
echo "Number: ";
$input = trim(fgets(STDIN));

$number = (int)$input;

if($number % 2 === 0) 
{
    echo "The number $number is an even number\n";
} 
  
else 
{
    echo "The number $number is an odd number\n";
}

//end
