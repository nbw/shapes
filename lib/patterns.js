/*
 * Patterns
 *
 * Requirement:
 * - have 8 points
 * - each point has an x and y
 * - points are percentages (0 to 1)
 */

// First and last points are on boundary, so
// skip them (and divide by n+2 = 10)
const eighth = (i) => {
  return (i+1)/9;
};


const point = (x,y) => {
  return { x, y };
}

const octogonPoint = (i, a) => {
  const angle = Math.PI/4;
  const phase = Math.PI/2;
  return point(
    a*Math.cos(i*angle + phase),
    a*Math.sin(i*angle + phase)
  );
}

const dot = [];
const vertical = [];
const horizontal = [];
const octogon = [];

for (let i = 0; i < 8; i++) {
  dot.push(point(0.5, 0.5));
  vertical.push(point(0.5, eighth(i)));
  horizontal.push(point(eighth(i), 0.5));
  octogon.push(octogonPoint(i, 0.25));
}

module.exports = {
  dot,
  vertical,
  horizontal,
  octogon
};

