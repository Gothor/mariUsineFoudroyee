class Cog {
  constructor(size) {
    this.position = { x: 0, y: 0 };
    this.gridPosition = { x: 0, y: 0 };
    this.target = null;
    this.size = size;
  }

  setPosition(x, y) {
    this.gridPosition.x = x;
    this.gridPosition.y = y;
    this.position.x = (this.gridPosition.x + 0.5) * this.size;
    this.position.y = (this.gridPosition.y + 0.5) * this.size;
  }

  setTarget(x, y, duration) {
    this.gridPosition.x = x;
    this.gridPosition.y = y;
    const posX = (this.gridPosition.x + 0.5) * this.size;
    const posY = (this.gridPosition.y + 0.5) * this.size;
    this.target = { x: posX, y: posY, duration, startTime: new Date().getTime(), origX: this.position.x, origY: this.position.y };
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

    fill(200);
    stroke(0);
    beginShape();
    const nbTrucs = 8;
    for (let i = 0; i < nbTrucs * 2; i++) {
      const angle = i * TWO_PI / (nbTrucs * 2);
      let c = cos(angle);
      let s = sin(angle);
      if (i % 2) {
        vertex(c * this.size * 0.4, s * this.size * 0.4);
        vertex(c * this.size * 0.35, s * this.size * 0.35);
      } else {
        vertex(c * this.size * 0.35, s * this.size * 0.35);
        vertex(c * this.size * 0.4, s * this.size * 0.4);
      }
    }
    endShape(CLOSE);
    ellipse(0, 0, this.size * 0.35);

    pop();
  }

  avancer(n, direction) {
    const newPosition = { ...this.gridPosition };
    while (n--) {
      if (direction === Directions.Nord) {
        newPosition.y--;
      } else if (direction === Directions.Est) {
        newPosition.x++;
      } else if (direction === Directions.Sud) {
        newPosition.y++;
      } else if (direction === Directions.Ouest) {
        newPosition.x--;
      }
    }
    const level = levels[currentLevel];
    if (newPosition.x < 0
      || newPosition.x >= level.grid[0].length
      || newPosition.y < 0
      || newPosition.y >= level.grid.length
      || level.grid[newPosition.y][newPosition.x] === -1) {
      return true;
    }
    // this.setPosition(newPosition.x, newPosition.y);
    this.setTarget(newPosition.x, newPosition.y, 400);
    return false;
  }
}

export default Cog;