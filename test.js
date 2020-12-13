let keys, ball, fix, platforms;
const dim = 800;
const r = 1000; //  Station radius in pixels
const rr = -0.01; // rotation rate in radians per frame
const MAX_SPEED = 10;
const JUMP = 6;

function setup(){
	createCanvas(dim, dim);
	smooth();
	keys = [];
	fix = [];
	platforms = [
		new Platform(r-300, -HALF_PI, QUARTER_PI),
		new Platform(r-250, -0.5, HALF_PI),
		new Platform(r-150, -0.5, 0.5),
		new Platform(r-100, HALF_PI-0.2, HALF_PI+0.2),
		new Platform(r-50, HALF_PI+0.1, QUARTER_PI+HALF_PI+0.1),
		new Platform(r-50, QUARTER_PI, HALF_PI, color(0, 255, 255), 0.05),
		new Platform(r, 0, TWO_PI)
	];
	ball = new Player(1, 40, color(50, 150, 250));
	for(let i = 0; i < 30; i ++){
		fix[i] = new Player(0, 20, color(255, 0, 0), i*PI/6);
	}
	}

function keyPressed(){
	keys[keyCode] = true;
}

function keyReleased(){
	keys[keyCode] = false;
}

class Platform{
	constructor(radius, a, b, c=color(0,0,0), f=0.5) {
		this.r = radius;
		this.a = a;
		this.b = b;
		this.c = c;
		this.friction=f;
	}

	draw(){
		noFill()
		stroke(this.c);
		strokeWeight(2);
		arc(0,0,this.r*2,this.r*2,this.a+rotation(),this.b+rotation());
	}
}

function collide(r, a, yv, s) {
	for(let i = 0; i<platforms.length; i++){
		if(platforms[i].a<a && (platforms[i].b>a || (platforms[i].a < 0 && platforms[i].a+TWO_PI<a)) && platforms[i].r>=r+s/2 && platforms[i].r<=r+s/2+yv) {
			return i;
		}
	}
	return -1;
}

function rotation() {
	return ((frameCount * rr)%TWO_PI+TWO_PI)%TWO_PI;
}

class Player{
	constructor(user, size, color, angle=0){
		this.u = user;
		this.c = color;
		this.s = size;
		this.p = createVector(0, r-this.s/2);
		this.v = createVector(rr, 0);
		this.p.rotate(angle);
		this.v.rotate(angle);
		this.vt = rr*this.p.mag(); // Velocity tangential, used when landed
		this.l = platforms.length-1;
	}

	move(){
		var platform = platforms[this.l];
		var rv = rr*this.p.mag(); // the speed of the ground
		if(keys[RIGHT_ARROW] && this.vt > rv-MAX_SPEED){
			this.vt = max(rv-MAX_SPEED, this.vt-platform.friction*2);
		}
		if(keys[LEFT_ARROW] && this.vt < rv+MAX_SPEED){
			this.vt = min(rv+MAX_SPEED, this.vt+platform.friction*2);
		}
		if(keys[UP_ARROW]){
			this.v.add(p5.Vector.mult(this.p, -1*JUMP/this.p.mag()));
			this.l = -1;
		}
	}

	update(){
		if(this.u && this.l != -1){
			this.move();
		}
		var rv = rr*(this.p.mag()); // the speed of the ground
		if(this.l != -1){
			var platform = platforms[this.l];
			// friction: tries to match ground velocity
			if(this.vt < rv){
				this.vt = min(rv, this.vt+platform.friction);
			}
			if(this.vt > rv){
				this.vt = max(rv, this.vt-platform.friction);
			}
			this.p.rotate(this.vt/this.p.mag())
			this.v.rotate(this.p.heading()+HALF_PI-this.v.heading());
			this.v.setMag(this.vt);
		}
		let current_r = this.p.mag();
		let current_a = (this.p.heading() - rotation()+2*TWO_PI)%TWO_PI;
		let yv = this.v.dot(this.p)/this.p.mag();
		if(this.l == -1){
			this.p.add(this.v);
			let collision = collide(current_r, current_a, yv, this.s);
			if(collision != -1){
				// don't leave the spaceship!
				console.log(platforms[collision].friction);
				this.l = collision;
				this.p.setMag(platforms[collision].r-this.s/2);
				this.v.rotate(this.p.heading()+HALF_PI-this.v.heading());
				this.v.setMag(this.vt);
			}
		}
		if(this.l != -1){
			// have we walked off a platform
			if((current_a > platforms[this.l].b && (platforms[this.l].a >=0 || platforms[this.l].a+TWO_PI>current_a)) ||current_a < platforms[this.l].a){
				this.l = -1;
				console.log(current_a);
				// this.v.add(p5.Vector.mult(this.p, -1*JUMP/this.p.mag()));
			}
		}
	}

	draw(){
		noStroke();
		fill(this.c);
		ellipse(this.p.x, this.p.y, this.s, this.s);
	}
}

function draw(){
	background(250);
	// spaceship
	ball.update();
	for(let i = 0; i < 30; i ++){fix[i].update();}
	translate(dim/2,dim/2);
	// rotate(-ball.p.heading()+HALF_PI);
	// scale(0.5,0.5);
	translate(-ball.p.x,-ball.p.y);
	// noFill();
	// stroke(0);
	// strokeWeight(1);
	// ellipse(0, 0, r*2, r*2);
	ball.draw();
	for(let i = 0; i < 30; i ++){fix[i].draw();}
	for(let i=0; i<platforms.length; i++){platforms[i].draw();}
}
