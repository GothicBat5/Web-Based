

class Vec3 {

    constructor(x, y, z) 
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v)
    { 
        return new Vec3(this.x+v.x,this.y+v.y,this.z+v.z); 
    }

    subtract(v)
    { 
        return new Vec3(this.x-v.x,this.y-v.y,this.z-v.z); 
    }

    multiply(s)
    { 
        return new Vec3(this.x*s,this.y*s,this.z*s); 
    }

    dot(v)
    {
        return this.x*v.x + this.y*v.y + this.z*v.z; 
    }

    cross(v)
    {

        return new Vec3(
            this.y*v.z - this.z*v.y,
            this.z*v.x - this.x*v.z,
            this.x*v.y - this.y*v.x
        );
    }
}


function rotateY(v, angle)
{

    const c = Math.cos(angle), s = Math.sin(angle);
    return new Vec3(
        v.x*c + v.z*s,
        v.y,
        -v.x*s + v.z*c
    );
}

function rotateX(v, angle)
{

    const c = Math.cos(angle), s = Math.sin(angle);
    return new Vec3(
        v.x,
        v.y*c - v.z*s,
        v.y*s + v.z*c
    );
}


function project(v, camera, canvas)
{

    const z = v.z - camera.z;

    const scale = 300;
    const f = scale / z;

    return {
        x: v.x * f + canvas.width/2,
        y: v.y * f + canvas.height/2,
        z: z
    };
}
