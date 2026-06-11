#!/usr/bin/perl
use strict;
use warnings;

print "Number: ";
chomp(my $input = <STDIN>);

my $number = int($input);

if ($number % 2 == 0) 
{
    print "The number $number is an even number\n";
} 
else {
    print "The number $number is an odd number\n";
}
