<?php

function showError($message) 
{
    echo "\nError: " . $message . "\n";
    exit(1);
}

// 1. Get and validate Age
echo "Enter your age: ";
$ageInput = trim(fgets(STDIN));

if ($ageInput === '') 
{
    showError("Age cannot be empty.");
}

if (!is_numeric($ageInput)) 
{
    showError("Invalid Input.");
}

$age = (int)$ageInput;


if ($age < 0) 
{
    showError("Age cannot be negative.");
}
if ($age > 120) 
{
    showError("That seems like an unrealistic age.");
}

//Get and validate Name
echo "Enter your name: ";
$name = trim(fgets(STDIN));

if ($name === '') 
{
    showError("Name cannot be empty.");
}


$status = ($age >= 18) ? "an adult" : "a minor";

//Output 
echo "\nHello, " . $name . "! You are " . $age . " years old, so you are " . $status . ".\n";
