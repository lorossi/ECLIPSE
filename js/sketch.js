class Sketch extends Engine {
  preload() {
    this._max_particles = 1500;
    this._r = this.width / 5;
    this._max_life = this.width / 2;
    this._color_mode = 0; // 0 - white on black, 1 - black on white, 2 - colors on black, 3 - colors on white
    this._time_scl = 0.25;
    this._duration = 900;
    this._recording = false;
    this._animated = false;
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
      const theta = Math.random() * Math.PI * 100;
      // convert to x-y coordinates
      const x = Math.floor(Math.cos(theta) * this._r);
      const y = Math.floor(Math.sin(theta) * this._r);
      // create particle
      this._particles.push(new Particle(x, y, theta, this._max_life, this._noise, this._color_mode));
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
    // calculate time coordinates
    const time_theta = Math.PI * 2 * percent;
    const tx = this._time_scl * (Math.cos(time_theta) + 1);
    const ty = this._time_scl * (Math.sin(time_theta) + 1);

    this.ctx.save();

    this.ctx.clearRect(0, 0, this.width, this.height);

    switch (this._color_mode) {
      case 0:
      case 2:
        this.ctx.fillStyle = "rgb(15, 15, 15)";
        break;

      case 1:
      case 3:
      default:
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        break;
    }


    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(this.width / 2, this.height / 2);

    // draw central ring
    this.ctx.save();
    switch (this._color_mode) {
      case 1:
      case 3:
        this.ctx.strokeStyle = "rgb(15, 15, 15)";
        break;
      default:
        this.ctx.strokeStyle = "rgb(235, 235, 235)";
        break;
    }

    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this._r, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();

    // draw each particle
    this._particles.forEach(p => {
      p.move(tx, ty);
      p.show(this.ctx);
    });

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

    if (!this._animated) this.noLoop();
  }

  click() {
    if (!this._recording) {
      this.setup();
      this.loop();
    }
  }
}

const ease = (x) => 1 - (1 - x) * (1 - x);