import Cog from "./js/Cog.js";
import Key from "./js/Key.js";
import Main from "./js/Main.js";
import Personnage from "./js/Personnage.js";
import Porte from "./js/Porte.js";
import Programmation from "./js/Programmation.js";
import States from "./js/States.js";
import Tuile from "./js/Tuile.js";
import Tuiles from "./js/Tuiles.js";

let levels;
let currentLevel;
let squareSize = 60;
let character;
let images;
let main;
let programmation;
let tuiles;
let state;
let cog;
let cle;
let porte;

window.preload = function() {
  levels = loadJSON("levels.json");
  images = [
    loadImage("img/MARI - Tourne droite.png"),
    loadImage("img/MARI - Tout droit.png"),
    loadImage("img/MARI - Tout droit x2.png"),
    loadImage("img/MARI - Attendre.png"),
    loadImage("img/MARI - Toune gauche.png"),
    loadImage("img/MARI - Stop.png"),
    loadImage("img/MARI - Open door.png"),
    loadImage("img/MARI - x2.png"),
    loadImage("img/MARI - Turn and flip.png")
  ];
}

window.setup = function() {
  createCanvas(innerWidth, innerHeight);

  let old = levels;
  levels = [];
  for (const level in old) {
    levels[level] = old[level];
  }

  currentLevel = levels.length - 1;

  const level = levels[currentLevel];
  character = new Personnage(squareSize);
  const position = findPosition(level, Tuiles.Entree);
  character.setPosition(position.x, position.y);
  character.setOrientation(level.orientation);

  main = new Main(squareSize);
  tuiles = [];
  for (let i of level.tiles) {
    const tuile = new Tuile(images[Math.abs(i)], Math.abs(i));
    if (i < 0) tuile.flipped = true;
    tuiles.push(tuile);
    main.addTile(tuile);
  }
  main.setPosition(
    (level.grid[0].length + 0.5) * squareSize,
    0.5 * squareSize
  );

  programmation = new Programmation(squareSize);
  if (level.startingTiles) {
    for (let i of level.startingTiles) {
      const tuile = new Tuile(images[Math.abs(i)], Math.abs(i));
      if (i < 0) tuile.flipped = true;
      tuiles.push(tuile);
      programmation.addTile(tuile, 0);
    }
  }
  programmation.setPosition(
    (level.grid[0].length + 0.5) * squareSize,
    2 * squareSize
  );

  const cogPosition = findPosition(level, Tuiles.Rouage);
  if (cogPosition !== null) {
    cog = new Cog(squareSize);
    cog.setPosition(cogPosition.x, cogPosition.y);
  }

  const clePosition = findPosition(level, Tuiles.Cle);
  if (clePosition !== null) {
    cle = new Key(squareSize);
    cle.setPosition(clePosition.x, clePosition.y);
  }

  porte = findPorte(level);

  setState(States.ChooseTile);
}

function setState(newState) {
  state = newState;

  switch(state) {
    case States.ChooseTile:
      for (let tile of main.children) {
        tile.setClickable(true);
      }
      programmation.setClickable(false);
      break;

    case States.ChoosePosition:
      for (let tile of main.children) {
        tile.setClickable(false);
      }
      programmation.setClickable(true);
      break;

    case States.Win:
    case States.Lose:
      for (let tile of main.children) {
        tile.setClickable(false);
      }
      programmation.setClickable(false);
      break;
  }
}

function findPosition(level, tuile) {
  const grid = level.grid;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] == tuile) return { x, y };
    }
  }
  return null;
}

function findPorte(level) {
  const positionsPorte = [];

  const grid = level.grid;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] == Tuiles.Porte) {
        positionsPorte.push({ x, y });
        if (positionsPorte.length == 2) break;
      };
    }
  }

  let positionRail = null;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (Math.abs(grid[y][x]) == Tuiles.Rail) {
        positionRail = { x, y };
        break;
      }
    }
  }

  if (positionsPorte.length === 0) return null;

  return new Porte(positionsPorte, positionRail, squareSize);
}

window.draw = function() {
  background(220);

  drawGrid();
  main.draw();
  programmation.draw();
  if (cog)
    cog.draw();
  if (cle)
    cle.draw();
  if (porte)
    porte.draw();
  character.draw();
  drawLevel();
  drawVictory();
}

function drawLevel() {
  noStroke();
  fill(0);
  textAlign(LEFT, BOTTOM);
  textSize(32);
  text("Level: " + (currentLevel + 1), 10, height - 10);
}

function drawVictory() {
  if (state === States.Win || state === States.Lose) {
    const str = state === States.Win ? "YOU WIN!" : "YOU LOSE!";

    push();
    fill(0);
    noStroke();
    textStyle(BOLD);
    translate(width / 2, height / 2);
    textAlign(CENTER, CENTER);
    textSize(96);
    text(str, 0, 0);
    pop();
  }
}

function checkVictory() {
  const level = levels[currentLevel];

  if (level.grid[character.gridPosition.y][character.gridPosition.x] == Tuiles.Sortie
     && (!cle || cle.grabed)) {
    setState(States.Win);
  }
}

function checkGrabKey() {
  const level = levels[currentLevel];

  if (level.grid[character.gridPosition.y][character.gridPosition.x] == Tuiles.Cle) {
    cle.setTarget(programmation.position.x + squareSize * 0.5, programmation.position.y + squareSize * 2, 100);
    cle.grabed = true;
  }
}

function drawGrid() {
  const level = levels[currentLevel];
  const grid = level.grid;

  stroke(0);
  strokeWeight(2);

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] == Tuiles.Vide) continue;

      if (level.difficulty === "Easy")
        fill(150, 220, 255);
      else if (level.difficulty === "Medium")
        fill(240, 225, 175);
      else
        fill(250, 175, 175);
      push();
      translate(x * squareSize, y * squareSize);

      if (grid[y][x] !== Tuiles.RailExterieur) {
        rect(0, 0, squareSize);
      }

      if (grid[y][x] == Tuiles.Sortie) {
        fill(255, 200, 0);
        rect(
          squareSize / 8,
          squareSize / 8,
          2.5 * squareSize / 8,
          6 * squareSize / 8
        );
        rect(
          4.5 * squareSize / 8,
          squareSize / 8,
          2.5 * squareSize / 8,
          6 * squareSize / 8
        );

        if (cle && !cle.grabed) {
          fill(255, 0, 0);
          noStroke();
          push();
          translate(squareSize / 2, squareSize / 2);
          for (let i = 0; i < 4; i++)
          {
            rect(
              squareSize / 9 - squareSize / 2,
              squareSize / 9 - squareSize / 2,
              7 * squareSize / 9,
              squareSize / 9
            );
            rotate(HALF_PI);
          }
          pop();
          noFill();
          stroke(0);
          rect(
            squareSize / 9,
            squareSize / 9,
            7 * squareSize / 9,
            7 * squareSize / 9
          );
          rect(
            2 * squareSize / 9,
            2 * squareSize / 9,
            5 * squareSize / 9,
            5 * squareSize / 9
          );
        }
      } else if([Tuiles.Porte, Tuiles.Rail].includes(Math.abs(grid[y][x]))) {
        push();
        translate(squareSize / 2, squareSize / 2);

        if (porte.orientation == 1)
          rotate(HALF_PI);

        fill(150, 100, 0);
        noStroke();
        rect(
          -squareSize / 2,
          -squareSize / 5,
          squareSize,
          2 * squareSize / 5
        );
        const nbRails = 4;
        const widthRail = squareSize / (nbRails * 2 + 1);
        fill(0);
        for (let i = 0; i < nbRails; i++) {
          rect(
            -squareSize / 2 + (2 * i + 1) * widthRail,
            -squareSize / 6,
            widthRail,
            2 * squareSize / 6
          );
        }
        pop();
      }

      pop();
    }
  }
}

window.mouseMoved = function() {
  if (programmation === undefined) return;

  cursor(ARROW);

  programmation.onMove(mouseX, mouseY);
  for (const tuile of tuiles) {
    tuile.onMouseMove(mouseX, mouseY);
  }
}

window.mouseClicked = function() {
  if (programmation === undefined) return;

  programmation.onClick(mouseX, mouseY);
  for (const tuile of tuiles) {
    if (tuile.contains(mouseX, mouseY)) {
      tuile.onClick();
    }
  }
}

export {
  checkVictory,
  checkGrabKey,
  setState,
  state,
  levels,
  currentLevel,
  programmation,
  main,
  porte,
  character,
  cog,
  cle
};