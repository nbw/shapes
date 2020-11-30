import Circle from "./circle";
import Square from "./square";
import Triangle from "./triangle";
import * as PATTERNS from "./patterns";
import Midi from "./midi";
import OPZ from "opzjs";
import Settings from "./settings";

const settings = window.settings = new Settings();
settings.buildSettings();

var circles = [];
const shapes = [];

const midi = new Midi();

const canvas  = document.getElementById('canvas');
const scratch = document.createElement('canvas');
const ctxM = canvas.getContext('2d'); // Main
const ctxS = scratch.getContext('2d'); // Scratch

const setupCanvas = (c) => {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
};

const midiHandler = (event) => {
  const data = OPZ.decode(event.data);

  if (data.velocity > 0 && data.action === "keys") {
    const track = data.track;

    // Return if an unsupported track (fx, tape, etc)
    if (!settings.getId(track)) return;

    const coordinates = PATTERNS[settings.pattern];
    let height = window.innerHeight;
    let width = window.innerWidth;
    const color = settings.getColor(track);
    let shape;

    // Get coording for track
    const c = coordinates[settings.getId(track)];
    let c_x = c.x;
    let c_y = c.y;

    // Octogon requires special handling since
    // height and width are not guaranteed to be the same
    if (settings.pattern === "octogon") {
      const min = Math.min(height, width);
      c_x = (min/width)*c_x + 0.5;
      c_y = (min/height)*c_y + 0.5;
    }

    switch (settings.getShape(track)) {
      case "circle":
        shape = new Circle(width*c_x, height*c_y, 1, color);
        break;
      case "square":
        shape = new Square(width*c_x, height*c_y, 1, color);
        break;
      case "triangle":
        shape = new Triangle(width*c_x, height*c_y, 1, color);
        break;
    }

    shapes.push(shape);
  }

  if (data.action === "dial" && data.track === "motion") {
    console.log(data)
    switch(data.value.dialColor) {
      case "green":
        // 0 - 15
        settings.setOpacityRate(data.velocity*15/128);
        break;
      case "blue":
        // 0 - 100
        settings.setGrowRate(data.velocity*100/128);
        break;
      case "yellow":
        // 0 - 3
        settings.setPattern(Math.floor(data.velocity*4/128));
        break;
      case "red":
        // 0 - 3
        settings.setShapes(Math.floor(data.velocity*4/128));
        break;
    }
  }
};

const drawCircle = (ctx, c) => {
  ctx.beginPath();
  ctx.globalAlpha = c.opacity;
  ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.strokeStyle = c.color;
  ctx.stroke();
};

const drawSquare = (ctx, s) => {
  ctx.beginPath();
  ctx.globalAlpha = s.opacity;
  ctx.strokeStyle = s.color;
  ctx.strokeRect(s.x(), s.y(), s.width, s.height);
  ctx.closePath();
  ctx.stroke();
};

const drawTriangle = (ctx, t) => {
  ctx.beginPath();
  ctx.globalAlpha = t.opacity;
  ctx.strokeStyle = t.color;
  ctx.moveTo(t.X1(), t.Y1());
  ctx.lineTo(t.X2(), t.Y2());
  ctx.lineTo(t.X3(), t.Y3());
  ctx.lineTo(t.X1(), t.Y1());
  ctx.closePath();
  ctx.stroke();
};

const clearCanvas = (ctx, c) => {
  ctx.clearRect(0, 0, c.width, c.height);
};

const setBackgroundColor = () => {
  const body = document.getElementsByTagName("body")[0];
  const currentBg = body.style.backgroundColor;
  if (currentBg != settings.backgroundColor) {
    body.style.backgroundColor = settings.backgroundColor;
  }
}

const draw = () => {
  setupCanvas(canvas);
  setupCanvas(scratch);
  clearCanvas(ctxS, scratch);
  clearCanvas(ctxM, canvas);
  setBackgroundColor();

  for (let i = shapes.length - 1; i >= 0; --i) {
    switch(shapes[i].constructor.name) {
      case "Circle":
        drawCircle(ctxS, shapes[i]);
        break;
      case "Square":
        drawSquare(ctxS, shapes[i]);
        break;
      case "Triangle":
        drawTriangle(ctxS, shapes[i]);
        break;
    }

    shapes[i].increaseSize(settings.growRate);
    shapes[i].decreaseOpacity(settings.opacityRate);

    if (shapes[i].removable(canvas)) shapes.splice(i,1);
  }

  ctxM.drawImage(scratch, 0, 0);

  window.webkitRequestAnimationFrame(draw);
}

window.webkitRequestAnimationFrame(draw);

// Midi connect handler
document.getElementById("midi-connect").addEventListener("click", (e) => {
  midi.setup();
  setTimeout( () => {
    if (midi.devices.length > 0) {
      for (let deviceId in midi.devices) {
        midi.selectDevice(deviceId, midiHandler)
      }
      const menu = document.getElementById("menu");
      menu.classList.add("hide")
    } else {
      const error = document.getElementById("midi-connect-error")
      error.innerHTML = "Couldn't detect any midi devices (check browser support)";
    }
  }, 200);
});


