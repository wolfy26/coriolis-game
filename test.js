let keys, ball, fix, platforms, features, goal;
let tCollected = 0;
let tGoal;
let rot, drot;
let dim = 800;
let file;
let r, rr, MAX_SPEED, JUMP;
let kx, ky;

let stars;

let lnum = 0;
const levels = ["Intro"];

function preload(){
	file = loadLevel("Intro");
}

function setup(){
	createCanvas(dim, dim);
	smooth();
	platforms = [];
	keys = [];
	fix = [];
	goal = new Goal(false, true, 40);
	features = [goal];
	readLevel(file);
	ball = new Player(40, color(50, 150, 250));
	for(let i = 0; i < 30; i ++){
		fix[i] = new Marker(20, color(255, 0, 0), i*PI/6);
	}
	stars = [];
	let nstars = dim*dim/400;
	for(let i = 0; i < nstars; i ++){
		stars.push([(Math.random()-0.5)*dim*sqrt(2), (Math.random()-0.5)*dim*sqrt(2), Math.random()*3+1]);
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

// is angle a between b->c
function angleCheck(a, b, c){
  if(b+TWO_PI == c) return true;
  a = (a%TWO_PI+TWO_PI)%TWO_PI
  b = (b%TWO_PI+TWO_PI)%TWO_PI
  c = (c%TWO_PI+TWO_PI)%TWO_PI
  return (b <= c ? b <= a && a <= c : b <= a || a <= c);
}

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

class StaticFeature {
	constructor(radius,a,s) {
		this.p = createVector(0, radius);
		this.p.rotate(a);
		this.s = s;
	}

	checkCollision(that){
		if(this.p.dist(that.p) <= this.s){
			this.collide(that);
		}
	}

	update(){
		this.p.rotate(rr);
	}

	collide(entity){}

	draw(){}
}

class Goal extends StaticFeature{
	constructor(active, assembled, s){
		super(0,0,s);
		this.active = active;
		this.assembled = assembled;
		this.t = 0;
		this.particles_r = [];
		this.particles_a = [];
		for(let i = 0; i<300; i++){
			this.particles_r.push(Math.random());
			this.particles_a.push(Math.random()*TWO_PI);
		}
	}

	checkCollision(that){
		if(that instanceof Player) {
			super.checkCollision(that);
		}
	}

	collide(entity){
		if(this.active && this.assembled) {
			console.log("WIN!");
		}
	}

	draw(){
		fill(color(50));
		stroke(color(0,0,0));
		if(this.assembled) {
			strokeWeight(5);
			ellipse(this.p.x,this.p.y,this.s*2+10,this.s*2+10);
			if(this.active) {
				stroke(color(0,0,255));
				fill(color(0,155,255))
				ellipse(this.p.x,this.p.y,this.s*2,this.s*2);
				noFill();
				for(let i = 0; i<this.particles_a.length; i++) {
					let r = this.s-(this.s*this.particles_r[i]+frameCount*1)%this.s;
					let a = (this.particles_a[i]+frameCount*0.03)%TWO_PI;
					strokeWeight(2*sqrt(r/this.s));
					point(r*Math.cos(a), r*Math.sin(a));
				}
			}
		}
	}
}

class Key extends StaticFeature{
	constructor(radius, a){
		super(radius, a, 60);
		this.collected = false;
	}

	checkCollision(that){
		if(that instanceof Player) {
			super.checkCollision(that);
		}
	}

	collide(entity){
		if(!this.collected) {
			this.collected = true;
			tCollected += 1;
			if(tCollected >= tGoal){
				goal.active = true;
			}
		}
	}

	draw(){
		let x = this.p.x, y = this.p.y;
		noFill();
		strokeWeight(6);
		if(!this.collected){
			stroke(250, 220, 50);
		}else{
			stroke(200);
		}
		ellipse(x-15,y+15,24,24);
		line(x-6,y+6,x+15,y-15);
		line(x+15,y-15,x+22,y-8);
	}
}

function rotation() {
	return ((frameCount * rr)%TWO_PI+TWO_PI)%TWO_PI;
}

class Entity{
	constructor(size, angle=0){
		this.s = size;
		this.p = createVector(0, r-this.s/2);
		this.v = createVector(rr, 0);
		this.p.rotate(angle);
		this.v.rotate(angle);
		this.l = platforms.length-1;
	}

	update(){
		var rv = rr*(this.p.mag()); // the speed of the ground
		if(this.l != -1){
			this.onPlatform();
		}
		let current_r = this.p.mag();
		let current_a = (this.p.heading() - rotation()+2*TWO_PI)%TWO_PI;
		let yv = this.v.dot(this.p)/this.p.mag();
		if(this.l == -1){
			this.p.add(this.v);
			let collision = -1;
			for(let i = 0; i < platforms.length; i ++){
				if(platforms[i].checkCollision(current_r, current_a, this.p.mag(), this.s)){
					collision = i;
					break;
				}
			}
			if(collision != -1){
				this.onCollide(collision);
			}
		}
		if(this.l != -1){
			// have we walked off a platform
			if(!angleCheck(current_a, platforms[this.l].a, platforms[this.l].b)){
				this.onFall();
			}
		}
		for(let i = 0; i<features.length; i++){
			features[i].checkCollision(this);
		}
	}

	onPlatform() {}

	onCollide(collision) {}

	onFall(){}

	draw(){}
}

class SolidEntity extends Entity{
	constructor(size, angle=0){
		super(size, angle);
		this.vt = rr*this.p.mag(); // Velocity tangential, used when landed
	}

	onPlatform() {
		var rv = rr*this.p.mag(); // the speed of the ground
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

	onCollide(collision) {
		// don't leave the spaceship!
		this.l = collision;
		this.p.setMag(platforms[collision].r-this.s/2);
		this.vt = -1*Math.sin(this.v.angleBetween(this.p))*this.v.mag();
		this.v.rotate(this.p.heading()+HALF_PI-this.v.heading());
		this.v.setMag(this.vt);
	}

	onFall(){
		this.l = -1;
	}

}

class Player extends SolidEntity{
	constructor(size, color, angle=0){
		super(size, angle);
		this.c = color;
	}

	update() {
		if(this.l != -1) {
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
		super.update();
	}

	draw(){
		noStroke();
		fill(this.c);
		ellipse(this.p.x, this.p.y, this.s, this.s);
	}
}

class Marker extends SolidEntity{
	constructor(size, color, angle=0){
		super(size, angle);
		this.c = color;
	}

	draw(){
		noStroke();
		fill(this.c);
		ellipse(this.p.x, this.p.y, this.s, this.s);
	}
}

function loadLevel(filename){
	return loadStrings('./levels/' + filename + '.txt');
}

function readLevel(f){
	let fi = 0, n;
	let t = splitTokens(f[fi++]);
	r = int(t[0]), rr = float(t[1]), MAX_SPEED = float(t[2]), JUMP = float(t[3]);
	// platforms
	n = int(f[fi++]);
	while(n--){
		t = splitTokens(f[fi++]);
		platforms.push(new Platform(int(t[0]), float(t[1]), float(t[2]), color(0), float(t[3])));
	}
	platforms.push(new Platform(r, 0, TWO_PI));
	// keys
	n = int(f[fi++]);
	tGoal = n;
	while(n--){
		t = splitTokens(f[fi++]);
		features.push(new Key(int(t[0]), float(t[1])))
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
	// level display
	kx = levels[lnum].length*24+65;
	ky = 45;
}

function display(){
	noStroke();
	ellipse(0, 0, r*2, r*2);
	goal.draw();
	ball.draw();
	for(let i = 0; i < 30; i ++){fix[i].draw();}
	for(let i = 0; i < platforms.length; i++){platforms[i].draw();}
	for(let i = 0; i < features.length; i ++){features[i].draw();}
}

function updateLevel(){
	ball.update();
	for(let i = 0; i < 30; i ++){fix[i].update();}
	for(let i = 0; i < features.length; i++){features[i].update();}
}

function drawLevel(){
	background(0);
	updateLevel();
	// stars
	push();
	translate(dim/2, dim/2);
	rotate(-rot+HALF_PI);
	noStroke();
	fill(255, 255, 220);
	for(let i = 0; i < stars.length; i ++){
		ellipse(stars[i][0], stars[i][1], stars[i][2], stars[i][2]);
	}
	pop();
	// level
	push();
	translate(dim/2,dim/2);
	rotate(-rot+HALF_PI);
	translate(-ball.p.x,-ball.p.y);
	fill(250);
  display();
	pop();
	// minimap
	push();
	noStroke();
	translate(dim-dim/8-10, dim-dim/8-10);
	rotate(-rot+HALF_PI);
	scale(0.1,0.1);
	fill(255,200);
  display();
	pop();
	// level info
	noStroke();
	fill(0);
	textAlign(LEFT, CENTER);
	textFont('Courier New', 40);
	text(levels[lnum], 30, 50);
	text('0/' + (tGoal), kx+25, 50);
	stroke(250, 220, 50);
	strokeWeight(4);
	noFill();
	ellipse(kx-10, ky+10, 16, 16);
	line(kx-4, ky+4, kx+10, ky-10);
	line(kx+10, ky-10, kx+15, ky-5);
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
	background(0);
	drawLevel();
  // console.log(mv, drot);
}
