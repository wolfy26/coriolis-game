class Entity{
	constructor(size, angle=0){
		this.s = size;
		this.p = createVector(0, r-this.s/2);
		this.v = createVector(rr, 0);
		this.p.rotate(angle);
		this.v.rotate(angle);
		this.l = platforms.length-1;
		this.collisions = false;
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
		if(this.collisions){
			for(let i=0; i<entities.length; i++){
				if(entities[i] != this && this.p.dist(entities[i].p)<=this.s+entities[i].s) {
					this.onCollideEntity(entities[i]);
				}
			}
		}
		for(let i = 0; i<features.length; i++){
			features[i].checkCollision(this);
		}
	}

	onPlatform() {}

	onCollide(collision) {}

	onCollideEntity(entity){}

	onFall(){}

	draw(){}

	inflict(damage){}
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
		this.collisions = true;
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

	onCollideEntity(entity){
		console.log(entity);
	}

	inflict(damage) {
		if(damage>=10){
			console.log("YOU LOSE!");
		}
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
