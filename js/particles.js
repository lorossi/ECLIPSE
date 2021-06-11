class Particle {
  constructor(x, y, theta, max_life, noise, colors = false) {
    this._colors = colors;

    this._x = x;
    this._y = y;
    this._theta = theta;
    this._hue = theta * 180 / Math.PI;
    this._max_life = max_life;
    this._noise = noise;

    this._min_life = 0.4;
    this._max_alpha = 0.3;
    this._min_saturation = 25;
    this._max_angle = Math.PI * 2;
    this._noise_depth = 5;

    this._noise_scl = 0.0015;
    this._time_scl = 0.1;
    this._scl = 10;

    // calculate starting angle
    this._angle = Math.atan2(this._y, this._x);
  }

  move(percent) {
    // calculate time coordinates
    const time_theta = Math.PI * 2 * percent;
    const tx = this._time_scl * (Math.cos(time_theta) + 1);
    const ty = this._time_scl * (Math.sin(time_theta) + 1);

    // generate random length
    const n = (this._noise.noise4D(this._x * this._noise_scl, this._y * this._noise_scl, tx, ty) + 1) / 2;
    this._length = ((1 - this._min_life) * (n * this._max_life) + this._min_life * this._max_life) / this._scl;


    this._points = [];
    this._points.push({ x: this._x, y: this._y });
    // generate each point
    for (let i = 1; i < this._length; i++) {
      const prev = this._points[i - 1];
      const n = this._generateNoise(prev.x * this._noise_scl, prev.y * this._noise_scl, tx, ty);
      // rotate each point by a certain angle 
      const theta = n * this._max_angle + this._angle;
      // calculate xy coordinates
      const nx = prev.x + Math.cos(theta) * this._scl;
      const ny = prev.y + Math.sin(theta) * this._scl;

      this._points.push({ x: nx, y: ny });
    }
  }

  show(ctx) {
    ctx.save();

    for (let i = 0; i < this._points.length - 1; i++) {
      const alpha = ease((1 - i / this._points.length)) * this._max_alpha;
      const saturation = ease((1 - i / this._points.length)) * (100 - this._min_saturation) + this._min_saturation;
      const p1 = this._points[i];
      const p2 = this._points[i + 1];

      if (this._colors) {
        ctx.strokeStyle = `hsla(${this._hue}, ${saturation}%, 50%, ${alpha})`;
      } else {
        ctx.strokeStyle = `rgba(235, 235, 235, ${alpha})`;
      }

      ctx.strokeWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  _generateNoise(x, y, z, w) {
    let n = 0;
    for (let i = 0; i < this._noise_depth; i++) {
      const frequency = i + 1;
      const amplitude = Math.pow(2, i);
      n += this._noise.noise4D(x * frequency, y * frequency, z * frequency, w * frequency) / amplitude;
    }

    return n;
  }
}