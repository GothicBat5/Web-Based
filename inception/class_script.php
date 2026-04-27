
<?php

$a = 7;

class Human
{
    
    public string $name;
    public int $age;
    public string $sex; 
    
    public function display()
    {
        echo "\nName: $this->name"; 
        echo "\nAge: $this->age";
        echo "\nSex: $this->sex";
    }
}

class Hardware
{
    public int $year;
    public string $type;
    public string $material; 
    
    public function show()
    {
        echo "\n\nType: $this->type";
        echo "\nYear: $this->year";
        echo "\nMaterial: $this->material";
    }
}

$person = new Human();

$person->name = "Yeji";
$person->age = 26;
$person->sex = "Female";

$com = new Hardware();

$com->type = "Desktop";
$com->year = 1978;
$com->material = "Silicon";

if($a > 10)
{
    $person->display();
}

else
{
    $com->show();
}


?>
