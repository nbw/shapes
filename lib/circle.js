class Circle {
  constructor(x,y, radius, color = "#000") {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
  }

  increaseSize(amount) {
    this.radius += 2 + this.radius*amount;
  }

  decreaseOpacity(amount) {
    this.opacity -= amount;
  }

  removable(canvas) {
    return (this.radius > canvas.width) || (this.opacity < 0)
  }
}

export default Circle;
