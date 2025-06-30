let fixationText = '+';
let arrowSymbol = { left: '←', right: '→' };
let arrowPos = { left: [-80, -4], right: [80, -4] };

let ellipseW = 400;
let ellipseH = 200;

let ssd = 0.220;
const ssdStep = 0.050;
const minSSD = 0.020;
const maxSSD = 0.900;

const nTrials = 160;
const proportions = {
  congruent_go: 0.625,
  incongruent_go: 0.125,
  nogo: 0.125,
  stop: 0.125,
};

let trialList = [];
let trialIndex = 0;
let currentTrial;

let state = 'ISI';
let trialStartTime = 0;
let responded = false;
let stopPresented = false;

let isiDuration = 0;
const fixationDuration = 0.5;
const stimulusDuration = 1.0;
let ellipseShouldBeBlue = false;

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  frameRate(60);
  textSize(40);
  fill(255);
  generateTrials();
  nextTrial();
}

function generateTrials() {
  let n_congruent = Math.floor(nTrials * proportions.congruent_go);
  let n_incongruent = Math.floor(nTrials * proportions.incongruent_go);
  let n_nogo = Math.floor(nTrials * proportions.nogo);
  let n_stop = nTrials - n_congruent - n_incongruent - n_nogo;

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

  trialList = shuffle(trialList);
}

function nextTrial() {
  if (trialIndex >= trialList.length) {
    noLoop();
    console.log('Experiment finished');
    return;
  }

  currentTrial = trialList[trialIndex++];
  isiDuration = max(0.2, randomGaussian(1.5, 0.372));
  trialStartTime = millis();
  state = 'ISI';
  responded = false;
  stopPresented = false;
  ellipseShouldBeBlue = false;
}

function draw() {
  background(0);
  fill(255);
  let elapsed = (millis() - trialStartTime) / 1000;

  if (state === 'ISI') {
    if (elapsed >= isiDuration) {
      state = 'fixation';
      trialStartTime = millis();
    }
  }

  else if (state === 'fixation') {
    drawEllipse('white');
    drawFixation();
    if (elapsed >= fixationDuration) {
      state = 'stimulus';
      trialStartTime = millis();
    }
  }

  else if (state === 'stimulus') {
    let t = elapsed;
    let direction = currentTrial.direction;
    let arrowDir = direction;
    let arrowDisplayPos;

    if (currentTrial.type === 'incongruent_go') {
      arrowDir = direction === 'left' ? 'right' : 'left';
      arrowDisplayPos = arrowPos[arrowDir];
    } else {
      arrowDisplayPos = arrowPos[direction];
    }

    // Ellipse color logic
    if (currentTrial.type === 'nogo') {
      ellipseShouldBeBlue = true;
    } else if (currentTrial.type === 'stop' && !stopPresented && t >= ssd) {
      ellipseShouldBeBlue = true;
      stopPresented = true;
    }

    drawEllipse(ellipseShouldBeBlue ? 'blue' : 'white');
    drawFixation();
    drawArrow(arrowSymbol[arrowDir], arrowDisplayPos);

    if (!responded && keyIsPressed) {
      responded = true;
      handleResponse();
      state = 'interTrial';
      trialStartTime = millis();
    }

    if (t >= stimulusDuration && !responded) {
      handleResponse();
      state = 'interTrial';
      trialStartTime = millis();
    }
  }

  else if (state === 'interTrial') {
    if (elapsed >= 0.5) {
      nextTrial();
    }
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
  if (colorName === 'blue') {
    stroke(0, 0, 255);
  } else {
    stroke(255);
  }
  ellipse(width / 2, height / 2, ellipseW, ellipseH);
}

function drawArrow(symbol, pos) {
  textSize(60);
  fill(255);
  noStroke();
  text(symbol, width / 2 + pos[0], height / 2 + pos[1]);
}

function handleResponse() {
  if (currentTrial.type === 'stop') {
    if (responded) {
      ssd = max(minSSD, ssd - ssdStep);
    } else {
      ssd = min(maxSSD, ssd + ssdStep);
    }
  }
}

// Fisher-Yates shuffle
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
