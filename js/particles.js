class Particle {
  constructor(x, y, theta, max_life, noise, color_mode = false) {
    this._x = x;
    this._y = y;
    this._theta = theta % (Math.PI * 2);
    this._max_life = max_life;
    this._noise = noise;
    this._color_mode = color_mode;

    // parameters
    this._min_life = 0.5;
    this._max_alpha = 0.3;
    this._min_saturation = 25;
    this._max_angle = Math.PI / 2;
    this._noise_depth = 3;
    this._noise_scl = 0.0003;
    this._scl = 2;
    this._width = 2;

    // calculate starting angle
    this._angle = Math.atan2(this._y, this._x);
    // calculate hue
    this._hue = Math.floor(theta * 180 / Math.PI);
  }

  move(tx, ty) {
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
      // alpha and saturation are eased and relative to distance
      const alpha = (ease((1 - i / this._points.length)) * this._max_alpha).toFixed(2);
      const saturation = Math.floor(ease((1 - i / this._points.length)) * (100 - this._min_saturation) + this._min_saturation);
      // points unpacking
      const p1 = this._points[i];
      const p2 = this._points[i + 1];

      switch (this._color_mode) {
        case 0:
          ctx.strokeStyle = `rgba(235, 235, 235, ${alpha})`;
          break;
        case 1:
          ctx.strokeStyle = `rgba(15, 15, 15, ${alpha})`;
          break;
        case 2:
        case 3:
        default:
          ctx.strokeStyle = `hsla(${this._hue}, ${saturation}%, 50%, ${alpha})`;
      }

      ctx.strokeWidth = this._width;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  _generateNoise(x = 0, y = 0, z = 0, w = 0) {
    // multiple harmonics noise generation
    let n = 0;
    for (let i = 0; i < this._noise_depth; i++) {
      const frequency = Math.pow(2, i);
      const amplitude = Math.pow(2, -i);
      n += this._noise.noise4D(x * frequency, y * frequency, z * frequency, w * frequency) / amplitude;
    }

    return n;
  }
}