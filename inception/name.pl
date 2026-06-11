#!/usr/bin/perl
use strict;
use warnings;

sub showError {
    my ($message) = @_;
    print "\nError: $message\n";
    exit(1);
}


print "Enter your age: ";
chomp(my $ageInput = <STDIN>);

if ($ageInput eq '') 
{
    showError("Age cannot be empty.");
}

if ($ageInput !~ /^\d+$/) 
{
    showError("Invalid Input.");
}

my $age = int($ageInput);

if ($age < 0) 
{
    showError("Age cannot be negative.");
}
if ($age > 120) 
{
    showError("That seems like an unrealistic age.");
}

# Get and validate Name
print "Enter your name: ";
chomp(my $name = <STDIN>);

if ($name eq '') 
{
    showError("Name cannot be empty.");
}

my $status = ($age >= 18) ? "an adult" : "a minor";

# Output
print "\nHello, $name! You are $age years old, so you are $status.\n";
