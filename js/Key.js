class Key {
  constructor(size) {
    this.position = { x: 0, y: 0 };
    this.gridPosition = { x: 0, y: 0 };
    this.target = null;
    this.grabed = false;
    this.size = size;
  }

  setPosition(x, y) {
    this.gridPosition.x = x;
    this.gridPosition.y = y;
    this.position.x = (this.gridPosition.x + 0.5) * this.size;
    this.position.y = (this.gridPosition.y + 0.5) * this.size;
  }

  setTarget(x, y, duration) {
    this.target = { x, y, duration, startTime: new Date().getTime(), origX: this.position.x, origY: this.position.y };
  }

  moveToTarget() {
    const currentTime = new Date().getTime();
    const phi = Math.min((currentTime - this.target.startTime) / 500, 1);
    this.position = {
      x: this.target.origX + (this.target.x - this.target.origX) * phi,
      y: this.target.origY + (this.target.y - this.target.origY) * phi
    };
    if (phi === 1) this.target = null;
  }

  draw() {
    if (this.target !== null) {
      this.moveToTarget();
    }

    push();
    translate(this.position.x, this.position.y);

    fill(255, 220, 150);
    stroke(0);

    push();
    rectMode(CENTER);
    rotate(-HALF_PI / 2);
    rect(0, 0, this.size * 0.8, this.size * 0.2);
    pop();
    ellipse(this.size * 0.25, -this.size * 0.25, this.size * 0.4);

    pop();
  }
}

export default Key;