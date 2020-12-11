import JSColor from "./utils/jscolor";

const DEFAULT_COLORS = [
  '#CA281D',
  '#F4AE01',
  '#0071BB',
  '#11A159',
  '#F56C46',
  '#008080',
  '#5BB5F2',
  '#7832B4'
];

const PATTERNS = ['vertical', 'horizontal', 'octogon', 'dot'];
const TRACKS = ['kick', 'snare', 'perc', 'sample', 'bass', 'lead', 'arp', 'chord'];
const SHAPES = ['circle', 'square', 'triangle'];

const toggle = (element, klass) => {
  if (element.classList.contains(klass)) {
    element.classList.remove(klass);
  } else {
    element.classList.add(klass);
  }
}

const createEl = (tag) => {
  return document.createElement(tag);
}

const createRadio = (name, value, checked, click) => {
  const radio = createEl("input")
  radio.setAttribute('id', `${name}-${value}`);
  radio.setAttribute('type', 'radio');
  radio.setAttribute('name', name);
  radio.setAttribute('value', value);
  radio.checked = checked;
  radio.onclick = click;
  return radio;
}

const createRange = (id, min, max, value, click) => {
  const range = createEl("input")
  range.setAttribute('id', id);
  range.setAttribute('type', 'range');
  range.setAttribute('min', min);
  range.setAttribute('max', max);
  range.setAttribute('value', value);
  range.onclick = click;
  return range;
}

const createTableRow = (title, content) => {
  const row = createEl("tr");
  const col1 = createEl("td");
  col1.innerHTML = title;
  row.appendChild(col1);
  const col2 = createEl("td");
  col2.appendChild(content);
  row.appendChild(col2);
  return row;
}

class Settings {
  constructor() {
    this.pattern = 'vertical';
    this.opacity = true;
    this.opacityRate = 0.005;
    this.growRate = 0.007;
    this.backgroundColor = '#000';
    this.trackSettings = this.setupTracks();
  }

  setupTracks() {
    const tracks = {};
    for (let i in TRACKS) {
      tracks[TRACKS[i]] = {
        id: i,
        color: DEFAULT_COLORS[i],
        shape: SHAPES[0]
      }
    }
    return tracks;
  }

  // Handles Int OR string input
  getTrack(track) {
    if (Number.isInteger(track)) {
      return TRACKS[track%(TRACKS.length-1)];
    } else {
      return track;
    }
  }

  getId(track) {
    const setting = this.trackSettings[this.getTrack(track)];
    if (setting) {
      return setting["id"];
    } else {
      return undefined;
    }
  }

  getShape(track) {
    return this.trackSettings[this.getTrack(track)]["shape"];
  }

  getColor(track) {
    return this.trackSettings[this.getTrack(track)]["color"];
  }

  setOpacityRate(value) {
    this.opacityRate = value*0.001;
    document.getElementById("opacity").value = value;
  }

  setGrowRate(value) {
    this.growRate = value*0.00025;
    document.getElementById("grow").value = value;
  }

  setPattern(value) {
    const p = PATTERNS[value];
    this.pattern = p;
    document.getElementById(`pattern-${p}`).checked = true;
  }

  setShapes(value) {
    for(let t of TRACKS) {
      const s = SHAPES[value];
      // Random shapes
      if (value == 3) {
        const random = Math.floor(SHAPES.length*Math.random());
        s = SHAPES[random];
      }
      this.trackSettings[t]["shape"] = s;
      document.getElementById(`${t}-${s}`).checked = true;
    };
  }

  /*
   Builds the settings page via Javascript.

   Not using any frameworks, so this is a monster sized query.
   */
  buildSettings() {
    const tracks = document.getElementById("tracks");
    for (let t of TRACKS) {
      const row = createEl("tr");
      const title = createEl("td");
      title.innerHTML = t;
      row.appendChild(title);

      // TRACK Shapes pickers
      const shapes = createEl("td");
      for (let s of SHAPES) {

        const c = (s === this.getShape(t));
        const click = (e) => {
          const _v = e.target.getAttribute("value");
          const _t = e.target.getAttribute("name");
          this.trackSettings[_t]["shape"] = _v;
        }

        const radio = createRadio(t, s, c, click);
        const label = createEl("label");
        const shape = createEl("div");

        switch(s) {
          case "circle":
            shape.classList.add("circle");
            break;
          case "square":
            shape.classList.add("square");
            break;
          case "triangle":
            shape.classList.add("triangle");
            break;
        }

        label.appendChild(radio);
        label.appendChild(shape);
        shapes.appendChild(label);
      }
      row.appendChild(shapes);

      /* TRACK Color pickers */
      const colorPicker = createEl("td");
      const colorPickerInput = createEl("input");
      colorPickerInput.setAttribute("data-jscolor", `{value: '${this.getColor(t)}'}`);
      colorPickerInput.setAttribute("data-track", t);
      colorPickerInput.oninput = (e, c) => {
        const _c = e.target.value;
        const _t = e.target.getAttribute("data-track");
        this.trackSettings[_t]["color"] = _c;
      };
      colorPicker.appendChild(colorPickerInput);
      row.appendChild(colorPicker);

      tracks.appendChild(row);
    }

    const global = document.getElementById("global");

    const patterns = createEl("ul")
    for (let p of PATTERNS) {
      const item = createEl("li");
      const c = (p === this.pattern);
      const click = (e) => {
        const _v = e.target.getAttribute("value");
        const _t = e.target.getAttribute("name");
        this.pattern = _v;
      };
      const radio = createRadio("pattern", p, c, click)
      const label = createEl("label");
      label.innerHTML = p;

      item.appendChild(radio);
      item.appendChild(label);
      patterns.appendChild(item);
    }

    // Pattern row
    global.appendChild(createTableRow("Pattern", patterns));

    /* Background color picker */
    const bgColorPickerInput = createEl("input");
    bgColorPickerInput.setAttribute("data-jscolor", `{value: '${this.backgroundColor}'}`);
    bgColorPickerInput.oninput = (e, c) => {
      const _c = e.target.value;
      this.backgroundColor = _c;
    };
    global.appendChild(createTableRow("Background Color", bgColorPickerInput));

    /* OPACITY */
    const opacityInput = createRange("opacity", 1, 15, 5, (e) => {
      const _c = parseInt(e.target.value);
      this.setOpacityRate(_c);
    })
    global.appendChild(createTableRow("Fade", opacityInput));

    /* GROWTH */
    const growInput = createRange("grow", 1, 100, 28, (e) => {
      const _c = parseInt(e.target.value);
      this.setGrowRate(_c);
    })
    global.appendChild(createTableRow("Grow Rate", growInput));

    JSColor.install();

    const settings = document.getElementById("settings");
    const close = document.getElementById("settings-close");
    const title = document.getElementById("settings-title");
    close.onclick = (e) => { toggle(settings, "active"); }
    title.onclick = (e) => { toggle(settings, "active"); }
  }
}

export default Settings;

