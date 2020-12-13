class Particle {
    constructor(p, duration) {
        this.r = p.mag();
        this.a = p.heading() - frameCount*rr;
        this.end = frameCount + duration; //TODO: replace with gameTicks
        this.duration = duration
    }

    drawParticle() {
        if(frameCount <= this.end) { //TODO: replace with gameTicks
            let real_a = this.a + frameCount*rr;
            this.draw(this.r*Math.cos(real_a), this.r*Math.sin(real_a));
        }
    }

    draw(x, y) {}
}

class CircleParticle extends Particle {
    constructor(p, duration, s, color) {
        super(p, duration);
        this.s = s;
        this.color = color;
    }

    draw(x, y) {
        noStroke();
        fill(this.color);
        let real_s = this.s*(this.end-frameCount)/this.duration //TODO: replace with gameTicks
        ellipse(x, y, real_s, real_s);
    }
}