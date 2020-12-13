let keys, ball, fix, platforms;
let rot, drot;
let dim = 800;
let r, rr, MAX_SPEED, JUMP;
const FRICTION = 0.5;

function preload(){
	loadLevel("Intro");
}

function setup(){
	createCanvas(dim, dim);
	smooth();
	keys = [];
	fix = [];
	ball = new Player(1, 40, color(50, 150, 250));
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

class Platform{
	constructor(radius, a, b) {
		this.r = radius;
		this.a = a;
		this.b = b;
	}

	draw(){
		noFill()
		stroke(0);
		strokeWeight(1);
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
		var rv = rr*this.p.mag(); // the speed of the ground
		if(this.l != -1){
			if(keys[UP_ARROW]){
				this.v.add(p5.Vector.mult(this.p, -1*JUMP/this.p.mag()));
				this.l = -1;
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
		if(this.u){
			this.move();
		}
		var rv = rr*(this.p.mag()); // the speed of the ground
		if(this.l != -1){
			// friction: tries to match ground velocity
			if(this.vt < rv){
				this.vt = min(rv, this.vt+FRICTION);
			}
			if(this.vt > rv){
				this.vt = max(rv, this.vt-FRICTION);
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
				console.log(collision);
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
	let f = loadStrings('./levels/' + filename + '.txt');
	let fi = 0, n;
	let t = splitTokens(f[fi++]);
	r = int(t[0]), rr = float(t[1]), MAX_SPEED = float(t[2]), JUMP = float(t[3]);
	// platforms
	n = int(f[fi++]);
	platforms = [];
	while(n--){
		t = splitTokens(f[fi++]);
		platforms.push(new Platform(int(t[0]), float(t[1]), float(t[2])));
	}
	platforms.push(new Platform(r, 0, TWO_PI));
	// keys
	n = int(f[fi++]);
	while(n--){
		t = splitTokens(f[fi++]);
	}
	// spikes
	n = int(f[fi++]);
	while(n--){
		t = splitTokens(f[fi++]);
	}
	// enemies

	n = int(f[fi++]);
	while(n--){
		t = splitTokens(f[fi++]);
	}
}

function drawLevel(){
  // spaceship
	ball.update();
	for(let i = 0; i < 30; i ++){fix[i].update();}
	translate(dim/2,dim/2);
	rotate(-rot+HALF_PI);
	scale(0.3,0.3);
	// translate(-ball.p.x,-ball.p.y);
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
