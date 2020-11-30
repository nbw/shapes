class Square {
  constructor(x,y, size, color = "#000") {
    this._x = x;
    this._y = y;
    this.width = size;
    this.height = size;
    this.color = color;
    this.opacity = 1;
  }

  x() {
    return this._x - this.width/2;
  }

  y() {
    return this._y - this.height/2;
  }

  increaseSize(amount) {
    this.height += 10*this.height*amount;
    this.width += 10*this.width*amount;
  }

  decreaseOpacity(amount) {
    this.opacity -= amount;
  }

  removable(canvas) {
    return this.width > canvas.width || (this.opacity < 0);
  }
}

export default Square;
