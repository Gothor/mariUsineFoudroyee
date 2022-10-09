import Directions from "./Directions.js";
import States from "./States.js";
import { state, cog, levels, currentLevel, porte, setState } from "../sketch.js";

class Personnage {
  constructor(size) {
    this.position = { x: 0, y: 0 };
    this.gridPosition = { x: 0, y: 0 };
    this.orientation = 0;
    this.target = null;
    this.targetOrientation = null;
    this.rotation = 0;
    this.size = size;
  }

  setPosition(x, y) {
    this.gridPosition.x = x;
    this.gridPosition.y = y;
    this.position.x = (this.gridPosition.x + 0.5) * this.size;
    this.position.y = (this.gridPosition.y + 0.5) * this.size;
  }

  setOrientation(orientation) {
    this.orientation = orientation;
    this.rotation = orientation * HALF_PI;
  }

  rotateTo(direction, duration) {
    this.targetOrientation = { angle: direction * HALF_PI, origAngle: this.rotation, startTime: new Date().getTime(), duration };
    this.orientation = (direction + 4) % 4;
  }

  moveToDirection() {
    const currentTime = new Date().getTime();
    const phi = Math.min((currentTime - this.targetOrientation.startTime) / 500, 1);
    this.rotation = this.targetOrientation.origAngle + (this.targetOrientation.angle - this.targetOrientation.origAngle) * phi;
    if (phi === 1) {
      this.targetOrientation = null;
      this.rotation = this.orientation * HALF_PI;
    }
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
    if (this.targetOrientation !== null) {
      this.moveToDirection();
    }

    push();
    translate(this.position.x, this.position.y);

    fill(225, 150, 0);
    stroke(0);
    ellipse(0, 0, this.size * 0.8);

    rotate(this.rotation);
    if (state !== States.Lose) {
      fill(0);
      noStroke();
      ellipse(
        -0.1 * this.size,
        -0.25 * this.size,
        0.1 * this.size,
        0.2 * this.size
      );
      ellipse(
        0.1 * this.size,
        -0.25 * this.size,
        0.1 * this.size,
        0.2 * this.size
      );
    } else {
      fill(0);
      noStroke();
      translate(0, -0.25 * this.size);
      rectMode(CENTER);
      rotate(PI / 8);
      rect(0, 0, this.size * 0.5, this.size * 0.05);
      rotate(- PI / 4);
      rect(0, 0, this.size * 0.5, this.size * 0.05);
    }

    pop();
  }

  avancer(n = 1) {
    const newPosition = {...this.gridPosition};
    const level = levels[currentLevel];

    let blocked = false;
    while (n--) {
      if (this.orientation === Directions.Nord) {
        newPosition.y--;
      } else if (this.orientation === Directions.Est) {
        newPosition.x++;
      } else if (this.orientation === Directions.Sud) {
        newPosition.y++;
      } else if (this.orientation === Directions.Ouest) {
        newPosition.x--;
      }

      if (newPosition.x < 0
        || newPosition.x >= level.grid[0].length
        || newPosition.y < 0
        || newPosition.y >= level.grid.length
        || level.grid[newPosition.y][newPosition.x] === -1) {
        blocked = true;
        break;
      }

      if (cog
        && cog.gridPosition.x == newPosition.x
        && cog.gridPosition.y == newPosition.y) {
        blocked = cog.avancer(n + 1, this.orientation);
        break;
      }

      if (porte
        && porte.contains(newPosition.x, newPosition.y)) {
        blocked = true;
        break;
      }
    }

    if (blocked) {
      setState(States.Lose);
      return;
    }
    // this.setPosition(newPosition.x, newPosition.y);
    this.setTarget(newPosition.x, newPosition.y, 400);
  }

  tourneNegatif() {
    this.rotateTo(this.orientation + 1, 400);
  }

  tournePositif() {
    this.rotateTo(this.orientation - 1, 400);
  }
}

export default Personnage;