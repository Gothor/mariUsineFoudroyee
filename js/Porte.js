import States from "./States.js";
import { levels, currentLevel, character, setState } from "../sketch.js";

class Porte {
  constructor(positions, positionRail, size) {
    this.position = { x: 0, y: 0 };
    this.orientation = positions[0].x === positions[1].x ? 1 : 0;
    this.gridPosition = { x: 0, y: 0 };
    this.target = null;
    this.size = size;
    this.positionToToggle = positionRail;

    this.setPosition(
      Math.min(...positions.map(p => p.x)),
      Math.min(...positions.map(p => p.y))
    );
  }

  setPosition(x, y) {
    this.gridPosition.x = x;
    this.gridPosition.y = y;
    this.position.x = (this.gridPosition.x + 0.5) * this.size;
    this.position.y = (this.gridPosition.y + 0.5) * this.size;
  }

  contains(x, y) {
    const position = { ...this.gridPosition };

    // First tile
    if (position.x === x && position.y === y) return true;

    // Second tile
    if (this.orientation == 0)
      position.x++;
    else
      position.y++;

    return position.x === x && position.y === y;
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
    if (this.orientation == 1) rotate(HALF_PI);

    fill(200);
    stroke(0);
    rect(
      -7 * this.size / 18,
      -4 * this.size / 10,
      16 * this.size / 9,
      4 * this.size / 5
    );

    pop();
  }

  toggle() {
    if (character.gridPosition.x === this.positionToToggle.x
      && character.gridPosition.y === this.positionToToggle.y) {
      setState(States.Lose);
      return;
    }

    const newPosition = { ...this.gridPosition };
    if (this.orientation === 0 && this.gridPosition.x > this.positionToToggle.x) {
      newPosition.x--;
      this.positionToToggle.x++;
    } else if (this.orientation === 0 && this.gridPosition.x < this.positionToToggle.x) {
      newPosition.x++;
      this.positionToToggle.x--;
    } else if (this.orientation === 1 && this.gridPosition.y > this.positionToToggle.y) {
      this.positionToToggle.y++;
      newPosition.y--;
    } else if (this.orientation === 1 && this.gridPosition.y < this.positionToToggle.y) {
      this.positionToToggle.y--;
      newPosition.x++;
    }

    this.setTarget(newPosition.x, newPosition.y, 400);
    return false;
  }
}

export default Porte;