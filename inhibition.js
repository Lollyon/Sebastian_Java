let fixationText = '+';
let arrowSymbol = { left: '←', right: '→' };
let arrowPos = { left: [-80, -4], right: [80, -4] };

let ellipseW = 400;
let ellipseH = 200;

let ssd = 0.220;
const ssdStep = 0.050;
const minSSD = 0.020;
const maxSSD = 0.900;

const trialsPerSet = 80;
const totalSets = 3;

let currentSet = 0;
let setTrialIndex = 0;
let currentTrial;
let fullData = [];

let trialList = [];

let state = 'intro';
let trialStartTime = 0;
let responded = false;
let stopPresented = false;

let isiDuration = 0;
const fixationDuration = 0.5;
const stimulusDuration = 1.0;
let ellipseShouldBeBlue = false;

let showDownloadButton = false;

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, TOP);
  textWrap(WORD);
  textLeading(30);
  frameRate(60);
  fill(255);
  state = 'intro';
}

function keyPressed() {
  if (state === 'intro') {
    startSet();
  } else if (state === 'break') {
    startSet();
  } else if (state === 'end') {
    // Do nothing
  } else if (state === 'stimulus' && !responded) {
    responded = true;
    handleResponse();
    state = 'interTrial';
    trialStartTime = millis();
  }
}

function generateTrials() {
  const proportions = {
    congruent_go: 0.625,
    incongruent_go: 0.125,
    nogo: 0.125,
    stop: 0.125,
  };

  let trialList = [];

  let n_congruent = Math.floor(trialsPerSet * proportions.congruent_go);
  let n_incongruent = Math.floor(trialsPerSet * proportions.incongruent_go);
  let n_nogo = Math.floor(trialsPerSet * proportions.nogo);
  let n_stop = trialsPerSet - n_congruent - n_incongruent - n_nogo;

  function addTrials(type, count) {
    for (let i = 0; i < count; i++) {
      let direction = random(['left', 'right']);
      trialList.push({ type, direction });
    }
  }

  addTrials('congruent_go', n_congruent);
  addTrials('incongruent_go', n_incongruent);
  addTrials('nogo', n_nogo);
  addTrials('stop', n_stop);

  return shuffle(trialList);
}

function startSet() {
  currentSet++;
  if (currentSet > totalSets) {
    state = 'end';
    showDownloadButton = true;
    return;
  }

  trialList = generateTrials();
  setTrialIndex = 0;
  currentTrial = trialList[setTrialIndex];
  isiDuration = max(0.2, randomGaussian(1.5, 0.372));
  state = 'ISI';
  trialStartTime = millis();
  responded = false;
  stopPresented = false;
  ellipseShouldBeBlue = false;
}

function drawIntro() {
  background(0);
  textSize(18);
  textAlign(LEFT, TOP);
  textWrap(WORD);

  const instructionsTop = `Willkommen zur Studie!

Bitte lesen Sie die folgenden Instruktionen sorgfältig:

→ In jedem Durchgang sehen Sie einen Pfeil (← oder →), der entweder auf der linken oder rechten Seite erscheint.

→ Bitte drücken Sie die Pfeiltaste, in die der Pfeil zeigt – so schnell und genau wie möglich.

→ Wenn der Rahmen (Ellipse)`;
  const blauText = "BLAU";
  const instructionsBottom = `wird, dürfen Sie NICHT reagieren.

→ Pausen sind nach jedem Block vorgesehen.

Drücken Sie eine beliebige Taste, um zu beginnen.`;

  const margin = 50;
  const wrap = width - 2 * margin;
  let y = 40;

  fill(255);
  text(instructionsTop, margin, y, wrap);
  y += 230;

  fill(0, 0, 255);
  text(blauText, margin, y, wrap);
  y += 30;

  fill(255);
  text(instructionsBottom, margin, y, wrap);
}


function drawBreakScreen() {
  background(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  textWrap(WORD);

  const textLines = `Kurze Pause.

Sie haben ${currentSet} von ${totalSets} Blöcken abgeschlossen.

Drücken Sie eine beliebige Taste, um fortzufahren.`;

  text(textLines, width / 2, height / 2, width - 100);
}

function drawEndScreen() {
  background(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  textWrap(WORD);

  const textLines = `Vielen Dank für Ihre Teilnahme!

Sie können nun Ihre Daten herunterladen.`;

  text(textLines, width / 2, height / 2 - 40, width - 100);
}

function drawDownloadButton() {
  let x = width / 2 - 100;
  let y = height / 2 + 20;
  let w = 200;
  let h = 50;

  fill(100);
  rect(x, y, w, h, 10);
  fill(255);
  textSize(20);
  text("Daten herunterladen", width / 2, y + h / 2);

  if (mouseIsPressed && mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
    downloadCSV();
    showDownloadButton = false;
  }
}

function drawFixation() {
  textSize(40);
  fill(255);
  noStroke();
  text(fixationText, width / 2, height / 2);
}

function drawEllipse(colorName) {
  noFill();
  strokeWeight(3);
  stroke(colorName === 'blue' ? color(0, 0, 255) : 255);
  ellipse(width / 2, height / 2, ellipseW, ellipseH);
}

function drawArrow(symbol, pos) {
  textSize(60);
  fill(255);
  noStroke();
  text(symbol, width / 2 + pos[0], height / 2 + pos[1]);
}

function handleResponse() {
  if (!currentTrial) return;

  if (currentTrial.type === 'stop') {
    if (responded) {
      ssd = max(minSSD, ssd - ssdStep);
    } else {
      ssd = min(maxSSD, ssd + ssdStep);
    }
  }

  fullData.push({
    set: currentSet,
    trial: setTrialIndex + 1,
    type: currentTrial.type,
    direction: currentTrial.direction,
    responded: responded,
    ellipseColor: ellipseShouldBeBlue ? 'blue' : 'white'
  });
}

function downloadCSV() {
  let csv = "Set;Trial;Type;Direction;Responded;EllipseColor\n";
  fullData.forEach(d => {
    csv += `${d.set};${d.trial};${d.type};${d.direction};${d.responded};${d.ellipseColor}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "VPN/experiment_data.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function shuffle(array) {
  let currentIndex = array.length, temp, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = floor(random(currentIndex));
    currentIndex--;
    temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}
