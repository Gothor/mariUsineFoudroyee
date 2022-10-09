import Actions from "./Actions.js";
import States from "./States.js";
import { programmation, setState } from "../sketch.js";

class Main {
  constructor(size) {
    this.children = [];
    this.position = { x: 0, y: 0 };
    this.selectedTile = null;
    this.size = size;
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  draw() {
    for (let child of this.children) {
      child.draw();
    }
  }

  addTile(tuile) {
    tuile.setPosition((this.children.length * 1.25) * this.size, 0);
    tuile.setScale(this.size, this.size);
    tuile.setClickable(true);
    tuile.setParent(this);

    this.children.push(tuile);
  }

  globalPosition() {
    return {...this.position};
  }

  selectTile(tuile) {
    this.selectedTile = tuile;
    tuile.setHighlight(true);
  }

  moveSelectedTileToProg(position) {
    const tuile = this.selectedTile;
    this.selectedTile = null;
    this.moveTuileToProg(tuile, position);
  }

  moveTuileToProg(tuile, position) {
    tuile.setClickable(false);
    tuile.setHighlight(false);

    let index = this.children.indexOf(tuile);
    this.children.splice(index, 1);

    programmation.addTile(tuile, position);
    programmation.run();
  }

  onClickTile(tuile) {
    if (!programmation.children.length) {
      this.moveTuileToProg(tuile, 0);
    } else if (tuile.action == Actions.Wait) {
      this.moveTuileToProg(tuile, programmation.children.length);
    } else {
      this.selectTile(tuile);
      setState(States.ChoosePosition);
    }
  }
}

export default Main;