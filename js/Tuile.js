import Actions from "./Actions.js";
import States from "./States.js";
import { character, state, porte, cle } from "../sketch.js";

class Tuile {
  constructor(image, action) {
    this.image = image;
    this.action = action;
    this.position = { x: 0, y: 0 };
    this.scale = { w: 0, h: 0 };
    this.parent = null;
    this.clickable = false;
    this.highlight = false;
    this.crossed = false;
    this.flipped = false;
  }

  draw() {
    const globalPosition = this.globalPosition();

    if (this.highlight) {
      fill(225, 150, 0);
      noStroke();
      rect(
        globalPosition.x - 10,
        globalPosition.y - 10,
        this.scale.w + 20,
        this.scale.h + 20
      );
    }

    push();
    translate(globalPosition.x, globalPosition.y);
    if (this.flipped) {
      push();
      translate(this.scale.w, 0);
      scale(-1, 1);
      image(
        this.image,
        0,
        0,
        this.scale.w,
        this.scale.h
      );
      pop();
    } else {
      image(
        this.image,
        0,
        0,
        this.scale.w,
        this.scale.h
      );
    }
    pop();

    if (this.crossed) {
      push();
      translate(globalPosition.x, globalPosition.y);
      translate(this.scale.w / 2, this.scale.h / 2);
      rotate(HALF_PI / 2);

      fill(255, 0, 0);
      for (let i = 0; i < 2; i++) {
        rect(
          -2 * this.scale.w / 5,
          -this.scale.w / 10,
          4 * this.scale.w / 5,
          2 * this.scale.w / 10
        );
        rotate(HALF_PI);
      }

      pop();
    }
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  setScale(w, h) {
    this.scale.w = w;
    this.scale.h = h;
  }

  setParent(object) {
    this.parent = object;
  }

  globalPosition() {
    const globalPosition = this.parent.globalPosition();

    globalPosition.x += this.position.x;
    globalPosition.y += this.position.y;

    return globalPosition;
  }

  contains(x, y) {
    const globalPosition = this.globalPosition();

    return (
      x >= globalPosition.x &&
      x < globalPosition.x + this.scale.w &&
      y >= globalPosition.y &&
      y < globalPosition.y + this.scale.h
    );
  }

  setClickable(clickable = true) {
    this.clickable = clickable;
  }

  setCrossed(crossed = true) {
    this.crossed = crossed;
  }

  onMouseMove(x, y) {
    if (!this.clickable) return false;

    const contained = this.contains(x, y);
    if (!contained) {
      this.setHighlight(false);
      this.setCrossed(false);
      return;
    }

    if (!this.isSelectable()) {
      this.setHighlight(false);
      this.setCrossed(true)
      return;
    }

    this.setHighlight(true);
    this.setCrossed(false);
    cursor(HAND);
  }

  isSelectable() {
    if (this.action === Actions.OpenDoor) {
      return cle.grabed;
    }

    return true;
  }

  onClick() {
    if (!this.clickable) return;
    if (!this.isSelectable()) return;
    if (!this.parent.onClickTile) return;

    this.parent.onClickTile(this);
  }

  setHighlight(highlight = true) {
    this.highlight = highlight;
  }

  activate(withoutHighlight = false) {
    return new Promise((resolve, reject) => {
      if (this.action == Actions.ToutDroit) {
        character.avancer();
      } else if (this.action == Actions.ToutDroitFoisDeux) {
        character.avancer(2);
      } else if (this.action == Actions.TourneNegatif) {
        character.tourneNegatif();
      } else if (this.action == Actions.TournePositif) {
        character.tournePositif();
      } else if (this.action == Actions.OpenDoor) {
        porte.toggle();
      } else if (this.action == Actions.TurnAndFlip) {
        if (this.flipped) {
          character.tourneNegatif();
        } else {
          character.tournePositif();
        }
        this.flipped = !this.flipped;
      }

      var lastState = state;

      if (!withoutHighlight) {
        this.setHighlight(true);
        setTimeout(() => {
          this.setHighlight(false);
          lastState === States.Lose ? reject() : resolve();
        }, 500);
      }
    });
  }
}

export default Tuile;