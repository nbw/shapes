const TRI_H_RATIO = Math.pow(3,1/2)/2;

class Triangle {
  constructor(x,y, size, color = "#000") {
    this._x = x;
    this._y = y;
    this.width = size;
    this.height = TRI_H_RATIO*size;
    this.color = color;
    this.opacity = 1;
  }

  x() {
    return this._x - this.width/2;
  }

  y() {
    return this._y - this.height/2;
  }

  X1() {
    return this.x()
  }

  Y1() {
    return this.y() + this.height;
  }

  X2() {
    return this.x() + this.width;
  }

  Y2() {
    return this.y() + this.height;
  }

  X3() {
    return this.x() + this.width/2;
  }

  Y3() {
    return this.y();
  }

  increaseSize(amount) {
    this.height += 10*this.height*amount;
    this.width += 10*this.width*amount;
  }

  decreaseOpacity(amount) {
    this.opacity -= amount;
  }

  removable(canvas) {
    // biggest square that fits in a equilateral
    // triangle has a width: a/(1 + 2/√3) = 0.0464.
    //
    // divide by 2 to account for triangles created near the
    // screen edge.
    return (0.464/2*this.width > canvas.width) || (this.opacity < 0);
  }
}

export default Triangle;

