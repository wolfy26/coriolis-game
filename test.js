let page = "Home", tpage = "Home";

let keys, ball, fix, platforms, features, goal, entities, particles;
let clicked = false;
let tCollected = 0;
let tGoal;
let rot, drot;
let dim = 800;
let file;
let r, rr, MAX_SPEED, JUMP;
let kx, ky;
let gameticks = 0;

let stars;

let lnum = 1;
let lvlfiles = [];
let lvlb = [];
const levels = ["Level 1", "Level 2", "Level 3", "Level 4"];

let hbut, abut, ibut;
let donea = 0;
let trana = 0;

function preload(){
	for(let i = 0; i < levels.length; i ++){
		lvlfiles[i] = loadLevel(levels[i]);
		// lvlfiles[i] = splitTokens(txts[i], "\n");
	}
}

function setup(){
	createCanvas(dim, dim);
	smooth();
	keys = [];
	particles = [];
	stars = [];
	let nstars = dim*dim/400;
	for(let i = 0; i < nstars; i ++){
		stars.push([(Math.random()-0.5)*dim*sqrt(2), (Math.random()-0.5)*dim*sqrt(2), Math.random()*3+1]);
	}
	for(let i = 0; i < levels.length; i += 4){
		let w = min(4, levels.length-i);
		for(let j = i; j < i+w; j ++){
			lvlb[j] = new LevelButton(j, dim/2 + (j-w/2+0.5)*150, dim/2 - 50 + i*150)
		}
	}
	ibut = new LevelButton(0, dim-100, dim-100, "?", "About");
	hbut = new LevelButton(0, 100, dim-100, "Home", "Home");
	rot = 0;
}

function keyPressed(){
	keys[keyCode] = true;
}

function keyReleased(){
	keys[keyCode] = false;
}

function mouseClicked(){
	clicked = true;
}

// is angle a between b->c
function angleCheck(a, b, c){
  if(b+TWO_PI == c) return true;
  a = (a%TWO_PI+TWO_PI)%TWO_PI
  b = (b%TWO_PI+TWO_PI)%TWO_PI
  c = (c%TWO_PI+TWO_PI)%TWO_PI
  return (b <= c ? b <= a && a <= c : b <= a || a <= c);
}

function rotation() {
	return ((gameticks * rr)%TWO_PI+TWO_PI)%TWO_PI;
}

function loadLevel(filename){
	return loadStrings('https://wolfy26.github.io/coriolis-game/levels/' + filename + '.txt');
	// return ["800 0.01 10 10", "4", "300 0 1.57 0.5", "300 3.14 4.71 0.5", "600 0 1.57 0.5", "600 3.14 4.71 0.5", "2", "200 -0.2", "250 2", "0", "2", "0 290 6", "0 290 2.5"];
}

class LevelButton {
	constructor(n, x, y, txt = "", dir = ""){
		this.n = n;
		this.x = x;
		this.y = y;
		this.txt = txt;
		this.dir = dir;
		this.a = 50;
		this.s = !n; // 0 = locked, 1 = unlocked, anything else = beaten
		if(this.txt == ""){
			this.txt += n+1;
		}
	}

	click(){
		if(dist(mouseX, mouseY, this.x, this.y) <= 63 && this.s){
			this.a = 100;
			if(clicked){
				if(this.dir == ""){
					gameticks = 0;
					lnum = this.n;
					readLevel(lvlfiles[lnum]);
					tpage = "Game";
					hbut.x = 100;
					hbut.y = dim - 100;
					tCollected = 0;
				}else{
					tpage = this.dir;
				}
			}
		}else{
			this.a = 50;
		}
	}

	draw(){
		this.click();
		strokeWeight(4);
		if(this.s == 0){
			stroke(90);
			fill(100, this.a);
		}else if(this.s == 1){
			stroke(200);
			fill(225, this.a);
		}else{
			stroke(15, 150, 50);
			fill(75, 255, 75, this.a);
		}
		ellipse(this.x, this.y, 125, 125);
		if(this.s == 0){
			fill(90);
		}else if(this.s == 1){
			fill(200);
		}else{
			fill(15, 150, 50);
		}
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(50/Math.pow(this.txt.length, 1/3));
		text(this.txt, this.x, this.y);
	}
}

function readLevel(f){
	platforms = [];
	goal = new Goal(false, true, 60);
	features = [goal];
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
	ball = new Player(40, color(50, 150, 250), r, 0, platforms.length-1);
	entities = [ball];
	n = int(f[fi++]);
	while(n--){
		t = splitTokens(f[fi++]);
		console.log(t[0]);
		switch(int(t[0])){
			case 0:
				// Goomba
				entities.push(new Goomba(float(t[1]), float(t[2])));
				console.log(entities);
		}
	}
	// level display
	kx = levels[lnum].length*24+65;
	ky = 45;
	// player initialization
	fix = [];
	for(let i = 0; i < 12; i ++){
		entities.push(new Marker(20, color(255, 0, 0), r, i*PI/6+PI/12, platforms.length-1));
	}
	drot = 0;
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
	if(frameCount%10 === 0){
		particles = particles.filter(x => (x.end >= gameticks));
		entities = entities.filter(x => !x.dead);
	}
}

function drawHome(){
	fill(255);
	noStroke();
	textAlign(CENTER, CENTER);
	textFont('Courier New', 60);
	text("Coriolis", dim/2, dim/4);
	textSize(20);
	textAlign(LEFT, BOTTOM);
	text("By Daniel and Daniel", 30, dim-30);
	for(let i = 0; i < levels.length; i ++){
		lvlb[i].draw();
	}
	ibut.draw();
	// background rotation
	rot += 0.001;
}

function drawLevel(){
	updateLevel();
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
	hbut.draw();
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
	// check if done
	if(goal.f){
		abut = new LevelButton(lnum, dim/2 + 75, dim/2 + 100, "Again");
		abut.s = 1;
		hbut.x = dim/2 - 75;
		hbut.y = dim/2 + 100;
		donea = 0;
		page = tpage = "Done";
	}
	// check if dead
	if(ball.dead){
		abut = new LevelButton(lnum, dim/2 + 75, dim/2 + 100, "Again");
		abut.s = 1;
		hbut.x = dim/2 - 75;
		hbut.y = dim/2 + 100;
		donea = 0;
		page = tpage = "Lose";
	}
}

function drawDone(){
	push();
	translate(dim/2,dim/2);
	rotate(-rot+HALF_PI);
	translate(-ball.p.x,-ball.p.y);
	fill(250);
	display();
	pop();
	noStroke();
	fill(0, donea);
	rect(0, 0, dim, dim);
	fill(255);
	textSize(50);
	textAlign(CENTER, CENTER);
	text("Level complete", dim/2, dim/3);
	hbut.draw();
	abut.draw();
	// update level data
	lvlb[lnum].s = 2;
	if(lnum+1 < levels.length){
		lvlb[lnum+1].s |= 1;
	}
	// fade out
	donea += (200-donea)/10;
}

function drawFail(){
	push();
	translate(dim/2,dim/2);
	rotate(-rot+HALF_PI);
	translate(-ball.p.x,-ball.p.y);
	fill(250);
	display();
	pop();
	noStroke();
	fill(0, donea);
	rect(0, 0, dim, dim);
	fill(255);
	textSize(50);
	textAlign(CENTER, CENTER);
	text("You fail", dim/2, dim/3);
	hbut.draw();
	abut.draw();
	// fade out
	donea += (200-donea)/10;
}

function drawAbout(){
	fill(255);
	noStroke();
	textAlign(CENTER, CENTER);
	textFont('Courier New', 60);
	text("About", dim/2, dim/4);
	textSize(20);
	textAlign(LEFT, TOP);
	text("This is a platformer game with a twist: there's no gravity. Instead, you're on a circular map that spins, generating rotational gravity. You'll find that you move differently, and we encourage you to explore the mechanics of jumping.\n\nPS: arrow keys to move.", 100, dim/3, dim-200, dim);
	hbut.x = 100;
	hbut.y = dim-100;
	hbut.draw();
	// background rotation
	rot += 0.001;
}

function draw(){
	background(0);
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
	if(page === "Home"){
		drawHome();
	}
	if(page === "Game"){
		drawLevel();
		gameticks ++;
	}
	if(page === "Done"){
		drawDone();
	}
	if(page === "Lose"){
		drawFail();
	}
	if(page === "About"){
		drawAbout();
	}
	// general scene-change animation, except for 'Done'
	if(page != tpage){
		trana += (255-trana)/5;
		if(trana >= 250){
			page = tpage;
			// align camera to player
			if(tpage === "Game"){
				rot = ball.p.heading();
			}
		}
	}else{
		trana -= trana / 5;
	}
	noStroke();
	fill(0, trana);
	rect(0, 0, dim, dim);
	clicked = false;
}
