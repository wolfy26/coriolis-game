let keys, ball, fix;
const dim = 800;
const r = 2500; //  Station radius in meters
const rr = -0.02; // rotation rate in radians per second
const MAX_SPEED = 10;
const FRICTION = 0.5;
const JUMP = 20;

function setup(){
	createCanvas(dim, dim);
	smooth();
	keys = [];
	fix = [];
	ball = new Player(1, 40, color(50, 150, 250));
	for(let i = 0; i < 30; i ++){
		fix[i] = new Player(0, 20, color(255, 0, 0), i*Math.PI/6);
	}
}

function keyPressed(){
	keys[keyCode] = true;
}

function keyReleased(){
	keys[keyCode] = false;
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
		this.l = false;
	}

	move(){
		var rv = rr*this.p.mag(); // the speed of the ground
		if(this.l){
			if(keys[UP_ARROW]){
				this.v.add(p5.Vector.mult(this.p, -1*JUMP/this.p.mag()));
				this.l = false;
			}
			if(keys[RIGHT_ARROW] && this.vt > rv-MAX_SPEED){
				this.vt = max(rv-MAX_SPEED, this.vt-FRICTION*2);
			}
			if(keys[LEFT_ARROW] && this.vt < rv+MAX_SPEED){
				this.vt = min(rv+MAX_SPEED, this.vt+FRICTION*2);
			}
		}
	}

	update(){
		var rv = rr*(this.p.mag()); // the speed of the ground
		if(this.u){
			this.move();
		}
		if(this.l) {
			// friction: tries to match ground velocity
			if(this.vt < rv){
				this.vt = min(rv, this.vt+FRICTION);
			}
			if(this.vt > rv){
				this.vt = max(rv, this.vt-FRICTION);
			}
			this.v.rotate(this.p.heading()+Math.PI/2-this.v.heading());
			this.v.setMag(this.vt); // Can this be negative? Does it work then?
			this.p.rotate(this.vt/this.p.mag())
		}
		else {
			this.p.add(this.v);
			if(this.p.mag() >= r-this.s/2){
				// don't leave the spaceship!
				this.l = true;
				this.p.setMag(r-this.s/2);
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
	rotate(-ball.p.heading()+Math.PI/2);
	translate(-ball.p.x,-ball.p.y);
	noFill();
	stroke(0);
	strokeWeight(1);
	ellipse(0, 0, r*2, r*2);
	ball.draw();
	for(let i = 0; i < 30; i ++){fix[i].draw();}
}
