#!/usr/bin/perl
use strict;
use warnings;

print "Perl Calculator Script\nX to Exit\n";

while (1) {
    print "\nNum 1: ";
    my $input1 = <STDIN>;
    chomp $input1;

    # Check for exit condition
    if (lc($input1) eq 'x') 
    {
        print "\nProgram Ended!\n";
        last;
    }

    # Validate input is numeric
    unless ($input1 =~ /^-?\d*\.?\d+$/) {
        print "Invalid number.\n";
        next;
    }

    print "\n(+, -, *, /)\nEnter operator: ";
    my $operator = <STDIN>;
    chomp $operator;

    # Validate operator
    unless ($operator =~ /^[+\-\*\/]$/) {
        print "Invalid operator. Try again.\n";
        next;
    }

    print "\nNum 2: ";
    my $input2 = <STDIN>;
    chomp $input2;

    # Validate second number
    unless ($input2 =~ /^-?\d*\.?\d+$/) 
    {
        print "Invalid number. Try again.\n";
        next;
    }

    my $num1 = $input1 + 0;
    my $num2 = $input2 + 0;

    # Check for division by zero
    if ($operator eq '/' && $num2 == 0) {
        print "Cannot divide by zero.\n";
        next;
    }

    my $result;
    # Perform calculation
    if ($operator eq '+') {
        $result = $num1 + $num2;
    } 
    elsif ($operator eq '-') {
        $result = $num1 - $num2;
    } 
    elsif ($operator eq '*') {
        $result = $num1 * $num2;
    } 
    elsif ($operator eq '/') {
        $result = $num1 / $num2;
    }

    print "\nResult: $result\n";
}
