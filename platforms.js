class Platform{
	constructor(radius, a, b, c=color(0,0,0), f=0.5) {
		this.r = radius;
		this.a = a;
		this.b = b;
		this.c = c;
		this.friction=f;
	}

	checkCollision(r, a, nr, s){
		return (angleCheck(a, this.a, this.b) && this.r >= r+s/2 && this.r <= nr+s/2);
	}

	draw(){
		noFill();
		stroke(this.c);
		strokeWeight(2);
		arc(0,0,this.r*2,this.r*2,this.a+rotation(),this.b+rotation());
	}
}
