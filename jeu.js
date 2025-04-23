// Variables globales
const nbCases = 64;
const tailleCase = 40;
let joueur1, joueur2;
let tour = 1;
let centresX = new Array(nbCases);
let centresY = new Array(nbCases);
let board = new Array(nbCases);

let de1 = 1, de2 = 1;
let desLances = false;
let jeuTermine = false;

let messageEffet = "";
let messageEffetTimer = 0;

function setup() {
  createCanvas(800, 800);
  creerPlateauSpirale();
  joueur1 = new Joueur("Nico", color(255, 0, 0));
  joueur2 = new Joueur("Axel", color(0, 0, 255));
}

function draw() {
  background(180, 170, 255);
  dessinerPlateau();
  afficherJoueur(joueur1);
  afficherJoueur(joueur2);
  afficherInfos();

  if (joueur1.position === nbCases - 1) {
    afficherMessageVictoire(joueur1.nom);
    jeuTermine = true;
  } else if (joueur2.position === nbCases - 1) {
    afficherMessageVictoire(joueur2.nom);
    jeuTermine = true;
  }

  if (messageEffetTimer > 0) {
    afficherMessageEffet();
    messageEffetTimer--;
  }

  dessinerDes();
}

function mousePressed() {
  if (jeuTermine) return;

  if (mouseX >= 300 && mouseX <= 400 && mouseY >= 550 && mouseY <= 650 && !desLances) {
    let somme = lancerDes();
    desLances = true;
    let joueurActuel = (tour === 1) ? joueur1 : joueur2;
    joueurActuel.deplacer(somme);
    tour = (tour === 1) ? 2 : 1;
    desLances = false;
  }
}

function lancerDes() {
  de1 = int(random(1, 7));
  de2 = int(random(1, 7));
  return de1 + de2;
}

function creerPlateauSpirale() {
  let x = 0, y = 0, dx = 1, dy = 0;
  let minX = 0, minY = 0, maxX = 7, maxY = 7;
  let caseIndex = 0;

  while (caseIndex < nbCases) {
    let px = x * tailleCase + 100;
    let py = y * tailleCase + 100;
    centresX[caseIndex] = px + tailleCase / 2;
    centresY[caseIndex] = py + tailleCase / 2;
    board[caseIndex] = new Case("normale");

    x += dx;
    y += dy;

    if (dx === 1 && x > maxX) { x = maxX; dx = 0; dy = 1; minY++; }
    else if (dy === 1 && y > maxY) { y = maxY; dx = -1; dy = 0; maxX--; }
    else if (dx === -1 && x < minX) { x = minX; dx = 0; dy = -1; maxY--; }
    else if (dy === -1 && y < minY) { y = minY; dx = 1; dy = 0; minX++; }

    caseIndex++;
  }

  [9, 18, 27, 36, 45, 54].forEach(i => board[i] = new Case("oie"));
  board[19] = new Case("hotel");
  board[3] = new Case("puit");
  board[42] = new Case("labyrinthe");
  board[52] = new Case("prison");
  board[58] = new Case("teteDeMort");
}

function dessinerPlateau() {
  for (let i = 0; i < nbCases; i++) {
    dessinerCase(i);
    let x = centresX[i] - tailleCase / 2;
    let y = centresY[i] - tailleCase / 2;
    rect(x, y, tailleCase, tailleCase);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(i, centresX[i], centresY[i]);
  }
}

function dessinerCase(i) {
  let type = board[i].type;
  switch (type) {
    case "oie": fill(255, 200, 0); break;
    case "hotel": fill(255, 0, 255); break;
    case "puit": fill(0, 100, 255); break;
    case "labyrinthe": fill(100); break;
    case "prison": fill(16, 144, 72); break;
    case "teteDeMort": fill(255, 0, 0); break;
    default: fill(255);
  }
}

function dessinerDes() {
  fill(200);
  rect(300, 550, 100, 100);
  rect(500, 550, 100, 100);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(32);
  text(de1, 350, 600);
  text(de2, 550, 600);
}

function afficherJoueur(j) {
  fill(j.c);
  ellipse(centresX[j.position], centresY[j.position], 20, 20);

  if (j.bloque) {
    fill(255, 0, 0, 150);
    ellipse(centresX[j.position], centresY[j.position], 30, 30);
  }
}

function afficherInfos() {
  fill(0);
  textSize(16);
  text(joueur1.nom + " est en case " + joueur1.position, 120, 30);
  text(joueur2.nom + " est en case " + joueur2.position, 120, 50);
  text("Tour de : " + ((tour === 1) ? joueur1.nom : joueur2.nom), 120, 70);
}

function afficherMessageVictoire(nom) {
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(nom + " a gagné !", width / 2 + 50, height / 2);
}

function afficherMessageEffet() {
  fill(255, 0, 0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(messageEffet, width / 2, height - 100);
}

class Case {
  constructor(type) {
    this.type = type;
  }
}

class Joueur {
  constructor(nom, c) {
    this.nom = nom;
    this.c = c;
    this.position = 0;
    this.bloque = false;
    this.toursBloques = 0;
  }

  deplacer(deplacement) {
    if (this.bloque) {
      this.toursBloques--;
      if (this.toursBloques <= 0) this.bloque = false;
      return;
    }

    this.position += deplacement;
    if (this.position >= nbCases) this.position = nbCases - 1;
    this.appliquerEffet();
  }

  appliquerEffet() {
    let type = board[this.position].type;

    switch (type) {
      case "oie":
        messageEffet = this.nom + " est sur une 🪿 oie ! Il avance encore !";
        messageEffetTimer = 50;
        let bonus = lancerDes();
        this.position += bonus;
        if (this.position >= nbCases) this.position = nbCases - 1;
        this.appliquerEffet();
        break;
      case "hotel":
      case "prison":
      case "puit":
        messageEffet = this.nom + " est bloqué sur une case " + type + " pour 2 tours !";
        messageEffetTimer = 50;
        this.bloque = true;
        this.toursBloques = 2;
        break;
      case "labyrinthe":
        messageEffet = this.nom + " est perdu dans le labyrinthe... retour à la case 30.";
        messageEffetTimer = 50;
        this.position = 30;
        break;
      case "teteDeMort":
        messageEffet = this.nom + " tombe sur la 💀 tête de mort ! Retour à la case départ !";
        messageEffetTimer = 50;
        this.position = 0;
        break;
      default:
        messageEffet = this.nom + " est sur une case normale.";
        messageEffetTimer = 50;
    }
  }
}
