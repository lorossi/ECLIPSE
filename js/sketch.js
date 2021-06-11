class Sketch extends Engine {
  preload() {
    this._max_particles = 500;
    this._r = this.width / 6;
    this._max_life = this.width / 2 - this._r;
    this._duration = 900;
    this._recording = true;
  }

  setup() {
    // setup capturer
    this._capturer_started = false;
    if (this._recording) {
      this._capturer = new CCapture({ format: "png" });
    }
    // setup noise
    this._noise = new SimplexNoise();
    // create particles
    this._particles = [];
    // angle increments
    const d_theta = Math.PI * 2 / this._max_particles;
    for (let i = 0; i < this._max_particles; i++) {
      // particle angular coordinate
      const theta = Math.random() * Math.PI * 2;
      // convert to x-y coordinates
      const x = Math.cos(theta) * this._r;
      const y = Math.sin(theta) * this._r;
      // create particle
      this._particles.push(new Particle(x, y, theta, this._max_life, this._noise))
    }
  }

  draw() {
    // start capturer
    if (!this._capturer_started && this._recording) {
      this._capturer_started = true;
      this._capturer.start();
      console.log("%c Recording started", "color: green; font-size: 2rem");
    }

    // time calculation
    const percent = (this.frameCount % this._duration) / this._duration;

    this.ctx.save();

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "rgb(15, 15, 15)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(this.width / 2, this.height / 2);

    // draw central ring
    this.ctx.save();
    this.ctx.strokeStyle = "rgb(235, 235, 235)";
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this._r, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();

    // draw each particle
    this._particles.forEach(p => {
      p.move(percent);
      p.show(this.ctx);
    })

    this.ctx.restore();

    // handle recording
    if (this._recording) {
      if (this.frameCount % 60 == 0) {
        const update = `Record: ${parseInt(percent * 100)}%`;
        console.log(`%c ${update}`, "color: yellow; font-size: 0.75rem");
      }
      if (this.frameCount < this._duration) {
        this._capturer.capture(this._canvas);
      } else {
        this._recording = false;
        this._capturer.stop();
        this._capturer.save();
        console.log("%c Recording ended", "color: red; font-size: 2rem");
      }
    }

    //this.noLoop();
  }

  mousedown() {
    this.setup();
    this.loop();
  }
}

const ease = (x) => 1 - (1 - x) * (1 - x);