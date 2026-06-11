#!/usr/bin/perl
use strict;
use warnings;

my $a = 7;

# Define the Human class
package Human {
    use base 'Exporter';
    our @EXPORT_OK = qw/new/;

    sub new {
        my ($class, %args) = @_;
        my $self = {
            name => $args{name} // '',
            age => $args{age}  // 0,
            sex => $args{sex}  // '',
        };
        bless $self, $class;
        return $self;
    }

    sub display {
        my $self = shift;
        print "\nName: $self->{name}";
        print "\nAge: $self->{age}";
        print "\nSex: $self->{sex}";
        print "\n";
    }
}

# Define the Hardware class
package Hardware {
    sub new {
        my ($class, %args) = @_;
        my $self = {
            year => $args{year}     // 0,
            type => $args{type}     // '',
            material => $args{material} // '',
        };
        bless $self, $class;
        return $self;
    }

    sub show {
        my $self = shift;
        print "\n\nType: $self->{type}";
        print "\nYear: $self->{year}";
        print "\nMaterial: $self->{material}";
        print "\n";
    }
}

# Main script execution
package main;

# Create instances
my $person = Human->new(name => "Yeji", age => 26, sex => "Female");
my $com = Hardware->new(type => "Desktop", year => 1978, material => "Silicon");

if ($a > 10) {
    $person->display();
} 
else {
    $com->show();
}
