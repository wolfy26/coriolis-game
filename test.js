let keys, ball, fix, platforms;
let rot, drot;
const dim = 800;
const r = 1000; //  Station radius in pixels
const rr = -0.02; // rotation rate in radians per frame
const MAX_SPEED = 10;
const FRICTION = 0.5;
const JUMP = 10;

function preload(){
	loadLevel("Intro");
}

function setup(){
	createCanvas(dim, dim);
	smooth();
	keys = [];
	fix = [];
	platforms = [
		new Platform(r-800, -2.75, -1.75),
    new Platform(r-600, -1.75, -0.75),
		new Platform(r-400, -0.75, 0.25),
		new Platform(r-200, 0.25, 1.25),
		new Platform(r, 0, TWO_PI)
	];
	ball = new Player(1, 40, color(50, 150, 250));
	goal = new Goal(true, true, 150);
	for(let i = 0; i < 30; i ++){
		fix[i] = new Player(0, 20, color(255, 0, 0), i*PI/6);
	}
	rot = ball.p.heading();
	drot = 0;
}

function keyPressed(){
	keys[keyCode] = true;
}

function keyReleased(){
	keys[keyCode] = false;
}

class Goal{
	constructor(active, assembled, r){
		this.active = active;
		this.assembled = assembled;
		this.r=r;
		this.t = 0;
		this.particles_r = [];
		this.particles_a = [];
		for(let i = 0; i<300; i++){
			this.particles_r.push(Math.random());
			this.particles_a.push(Math.random()*TWO_PI);
		}
	}

	draw(){
		fill(color(50));
		stroke(color(0,0,0));
		if(this.assembled) {
			strokeWeight(10);
			ellipse(0,0,this.r*2+20,this.r*2+20);
			if(this.active) {
				// strokeWeight(1);
				// noFill();
				// stroke(color(0,155,255));
				// ellipse(0,0,this.r*2+20,this.r*2+20);
				strokeWeight(10);
				stroke(color(0,0,255));
				fill(color(0,155,255))
				ellipse(0,0,this.r*2,this.r*2);
				noFill();
				for(let i = 0; i<this.particles_a.length; i++) {
					let r = this.r-(this.r*this.particles_r[i]+frameCount*1)%this.r;
					let a = (this.particles_a[i]+frameCount*0.03)%TWO_PI;
					strokeWeight(5*sqrt(r/this.r));
					point(r*Math.cos(a), r*Math.sin(a));
				}
			}
		}
	}
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
		noFill();
		stroke(this.c);
		strokeWeight(2);
		arc(0,0,this.r*2,this.r*2,this.a+rotation(),this.b+rotation());
	}
}

// is angle a between b->c
function angleCheck(a, b, c){
  if(b+TWO_PI == c) return true;
  a = (a%TWO_PI+TWO_PI)%TWO_PI
  b = (b%TWO_PI+TWO_PI)%TWO_PI
  c = (c%TWO_PI+TWO_PI)%TWO_PI
  return (b <= c ? b <= a && a <= c : b <= a || a <= c);
}

function collide(r, a, yv, s) {
	for(let i = 0; i<platforms.length; i++){
		if(angleCheck(a, platforms[i].a, platforms[i].b) && platforms[i].r>=r+s/2 && platforms[i].r<=r+s/2+yv) {
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
			if(!angleCheck(current_a, platforms[this.l].a, platforms[this.l].b)){
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

function loadLevel(filename){
	f = loadStrings('../levels/' + filename + '.lvl');
}

function drawLevel(){
  // spaceship
	ball.update();
	for(let i = 0; i < 30; i ++){fix[i].update();}
	translate(dim/2,dim/2);
	// rotate(-ball.p.heading()+HALF_PI);
	// scale(0.5,0.5);
	// translate(-ball.p.x,-ball.p.y);
	// noFill();
	// stroke(0);
	// strokeWeight(1);
	// ellipse(0, 0, r*2, r*2);
	rotate(-rot+HALF_PI);
	scale(0.3,0.3);
	// translate(-ball.p.x,-ball.p.y);
	goal.draw();
	ball.draw();
	for(let i = 0; i < 30; i ++){fix[i].draw();}
	for(let i=0; i<platforms.length; i++){platforms[i].draw();}
  // smooth rotation
	rot = (rot+TWO_PI)%TWO_PI;
	let targ = (ball.p.heading()+TWO_PI)%TWO_PI;
	let mv = targ-TWO_PI;
	for(let i = 0; i < 2; i ++){
		if(abs(targ-rot) < abs(mv-rot)){
			mv = targ;
		}
		targ += TWO_PI;
	}
	mv -= rot;
	mv = constrain(mv/3, -50/r, 50/r);
	if(drot < mv) drot = min(mv, drot+0.005);
	if(drot > mv) drot = max(mv, drot-0.005);
	rot += drot;
}

function draw(){
	background(250);
  drawLevel();
  // console.log(mv, drot);
}
