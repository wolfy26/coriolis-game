class Particle {
    constructor(p, duration) {
        this.r = p.mag();
        this.a = p.heading() - gameticks*rr;
        this.end = gameticks + duration;
        this.duration = duration
    }

    drawParticle() {
        if(gameticks <= this.end) {
            let real_a = this.a + gameticks*rr;
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
        let real_s = this.s*(this.end-gameticks)/this.duration
        ellipse(x, y, real_s, real_s);
    }
}