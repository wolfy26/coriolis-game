let keys, ball, platforms, features, goal, entities, particles;
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
	particles = [];
	goal = new Goal(false, true, 50);
	features = [goal];
	readLevel(file);
	ball = new Player(40, color(50, 150, 250), r, 0, platforms.length-1);
	entities = [ball, new Goomba(100, 2), new Goomba(800, 0)];
	for(let i = 0; i < 12; i ++){
		entities.push(new Marker(20, color(255, 0, 0), r, i*PI/6, platforms.length-1));
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


function collide(r, a, yv, s) {
	for(let i = 0; i<platforms.length; i++){
		if(angleCheck(a, platforms[i].a, platforms[i].b) && platforms[i].r>=r+s/2 && platforms[i].r<=r+s/2+yv && platforms[i].solid) {
			return i;
		}
	}
}

function rotation() {
	return ((frameCount * rr)%TWO_PI+TWO_PI)%TWO_PI;
}

function loadLevel(filename){
	return loadStrings('https://wolfy26.github.io/coriolis-game/levels/' + filename + '.txt'); // remember to change it to dot
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
	for(let i = 0; i < platforms.length; i++){platforms[i].draw();}
	for(let i = 0; i < particles.length; i ++){particles[i].drawParticle();}
	for(let i = 0; i < features.length; i ++){features[i].draw();}
	for(let i = 0; i < entities.length; i ++){
		if(!entities[i].dead){
			entities[i].draw();
		}
	}
}

function updateLevel(){
	for(let i = 0; i < entities.length; i ++){
		if(!entities[i].dead){
			entities[i].update();
		}
	}
	for(let i = 0; i < features.length; i++){features[i].update();}
	if(frameCount%10 === 0){ //TODO: replace with gameTicks
		particles = particles.filter(x => (x.end >= frameCount));
		entities = entities.filter(x => !x.dead);
	}
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
	text(tCollected + '/' + tGoal, kx+25, 50);
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
