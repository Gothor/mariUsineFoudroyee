import Actions from "./Actions.js";
import States from "./States.js";
import { checkVictory, checkGrabKey, setState, main } from "../sketch.js";

class Programmation {
  constructor(size) {
    this.children = [];
    this.position = { x: 0, y: 0 };
    this.clickable = false;
    this.plannedPosition = null;
    this.size = size;
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  draw() {
    if (this.plannedPosition !== null) {
      push();
      fill(225, 150, 0);
      noStroke();
      translate(this.globalPosition().x - this.size / 8 + this.size * 1.25 * this.plannedPosition, this.globalPosition().y);
      rect(-5, 0, 10, this.size);
      pop();
    }

    for (let child of this.children) {
      child.draw();
    }
  }

  addTile(tuile, position) {
    this.children.splice(position, 0, tuile);

    tuile.setPosition((position * 1.25) * this.size, 0);
    tuile.setScale(this.size, this.size);
    tuile.setClickable(false);
    tuile.setParent(this);

    for (let i = position + 1; i < this.children.length; i++) {
      const t = this.children[i];
      t.setPosition((i * 1.25) * this.size, 0);
    }
  }

  globalPosition() {
    return {...this.position};
  }

  setClickable(clickable = true) {
    this.clickable = clickable;
  }

  run() {
    let promise = null;
    for (let tuile of this.children) {
      if (tuile.action === Actions.FoisDeux) {
        const nextIndex = this.children.indexOf(tuile) + 1;
        if (nextIndex < this.children.length) {
        const nextTile = this.children[nextIndex];
          if (promise !== null)
            promise.then(() => nextTile.activate(true));
          else
            nextTile.activate(true);
        }
      }
      if (promise === null) {
        promise = tuile.activate();
      } else {
        promise = promise.then(() => tuile.activate());
      }
      if (tuile.action === Actions.Stop) {
        break;
      }
    }
    promise.then(() => {
      checkVictory();
      checkGrabKey();
    }, () => console.error("Bah alors ? On est mort ?!"));
  }

  onMove(x, y) {
    if (!this.clickable) return;

    const position = this.getPosition(x, y);
    if (position !== null) {
      this.plannedPosition = position;

      cursor(HAND);
    }
  }

  getPosition(x, y) {
    for (let i = 0; i < this.children.length; i++) {
      const tuile = this.children[i];
      if (x >= tuile.globalPosition().x - this.size / 4
         && x < tuile.globalPosition().x
         && y >= tuile.globalPosition().y
         && y < tuile.globalPosition().y + tuile.scale.h) return i;
    }

    const lastTuile = this.children[this.children.length - 1];
    if (lastTuile.action !== Actions.Wait
         && x >= lastTuile.globalPosition().x + this.size
         && x < lastTuile.globalPosition().x + this.size + this.size / 4
         && y >= lastTuile.globalPosition().y
         && y < lastTuile.globalPosition().y + lastTuile.scale.h) return this.children.length;

    return null;
  }

  onClick(x, y) {
    if (!this.clickable) return;

    setState(States.ChooseTile);
    main.moveSelectedTileToProg(this.plannedPosition);
    this.plannedPosition = null;
  }
}

export default Programmation;