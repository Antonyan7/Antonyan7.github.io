const Dot = class Dot {
  constructor(x, y, r = 0) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.animationCount = 0;
  }

  static midPoint(a, b) {
    const mx = a.x + (b.x - a.x) * 0.5;
    const my = a.y + (b.y - a.y) * 0.5;

    return new Dot(mx, my);
  }

  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
  }
};

const AnimatedGrid = class AnimatedGrid {

  constructor(canvasElement) {
    const that = this;

    // The grid step
    this.dotsStep = 10;

    // The default size of dots in grid
    this.dotsDefaultRadius = 0.5;

    // The max size of animated dots on mouse movement
    this.dotsMaxRadius = 80;

    // The width of trail which appears after the mouse
    this.trailWidth = 8;

    // The number of animation frames for dot animation. Bigger numbers mean longer animation duration.
    this.maxAnimationCount = 40;

    this.gridGradientColor1 = '#204868';
    this.gridGradientColor2 = '#256456';
    this.gridGradientColor3 = '#5a643d';
    this.activeGradientColor1 = '#e5fe48';
    this.activeGradientColor2 = '#00ffae';
    this.activeGradientColor3 = '#0092ff';

    // Pattern's offsets relative to the grid.
    this.patternVerticalOffset = 1;
    this.patternHorizontalOffset = 0;

    // Array of dots which are currently being animated
    this.dots = [];
    // The last point where mouse event was registered
    this.lastPoint = null;

    this.canvas = canvasElement;

    this.setupScene();
    this.draw();

    // this.canvas.addEventListener('mousemove', function (e) {
    //   that.registerPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    // });
    $('#animated-grid').bind('mousemove',function(e){
      that.registerPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    });

    this.canvas.addEventListener('touchmove', function (e) {
      that.registerPoint(
        e.changedTouches[0].pageX - this.offsetLeft,
        e.changedTouches[0].pageY - this.offsetTop
      );
    });

    window.addEventListener('resize', function () {
      that.setupScene();
    })
  }

  setupScene() {
    this.dots = [];
    this.lastPoint = null;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.prerenderedGrid = this.renderGrid();
    this.ctx = this.canvas.getContext('2d');

    const activeGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    activeGradient.addColorStop(0, this.activeGradientColor1);
    activeGradient.addColorStop(0.5, this.activeGradientColor2);
    activeGradient.addColorStop(1, this.activeGradientColor3);
    this.activeGradient = activeGradient;
  }

  renderGrid() {
    let canvas = document.createElement('canvas');
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    let context = canvas.getContext('2d');

    const gridGradient = context.createLinearGradient(0, 0, this.canvas.width, 0);
    gridGradient.addColorStop(0, this.gridGradientColor1);
    gridGradient.addColorStop(0.5, this.gridGradientColor2);
    gridGradient.addColorStop(1, this.gridGradientColor3);

    context.clearRect(0, 0, canvas.width, canvas.height);

    return canvas;
  }

  findNearestGridDots(x, y, dist) {
    let givenDot = new Dot(x, y);

    // The positions in the grid matrix
    let i_min = Math.floor(x / this.dotsStep);
    let j_min = Math.floor(y / this.dotsStep);

    // The dots in the surrounding square
    // In the future we can also add dots from the outer 4x4 square also
    let surroundingSquare = [
      {i: i_min, j: j_min},
      {i: i_min, j: j_min + 1},
      {i: i_min + 1, j: j_min},
      {i: i_min + 1, j: j_min + 1}];

    // Only those dots which are closer than the given distance
    let nearestDots = [];

    for (let n in surroundingSquare) {
      let dotX = this.dotsStep * surroundingSquare[n].i + this.patternHorizontalOffset;
      let dotY = this.dotsStep * surroundingSquare[n].j + this.patternVerticalOffset;

      let currentDot = new Dot(dotX, dotY, this.dotsDefaultRadius);

      if (Dot.distance(givenDot, currentDot) < dist) {
        nearestDots.push(currentDot);
      }
    }

    return nearestDots;
  }

  draw() {
    const that = this;
    requestAnimationFrame(function () {
      that.draw();
    });

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.prerenderedGrid, 0, 0);
    this.drawAnimatedDots();
  }

  drawAnimatedDots() {
    let b, k;

    for (let i in this.dots) {
      let dot = this.dots[i];
      if (dot.animationCount < this.maxAnimationCount) {

        if (dot.animationCount < this.maxAnimationCount / 2) {
          // Linear increase
          // t = dot.animationCount
          // r(t) = k*t + b
          // r(0) = dotsDefaultRadius
          // r(maxAnimationCount/2) = dotsMaxRadius
          b = this.dotsDefaultRadius;
          k = 2 * (this.dotsMaxRadius - this.dotsDefaultRadius) / this.maxAnimationCount;
        }
        else {
          // Linear decrease
          // t = dot.animationCount
          // r(t) = k*t + b
          // r(maxAnimationCount/2) = dotsMaxRadius
          // r(maxAnimationCount) = dotsDefaultRadius
          b = 2 * this.dotsMaxRadius - this.dotsDefaultRadius;
          k = -2 * (this.dotsMaxRadius - this.dotsDefaultRadius) / this.maxAnimationCount;
        }

        dot.r = k * dot.animationCount + b;
        dot.animationCount++;

        this.ctx.beginPath();
        this.ctx.fillStyle = this.activeGradient;
        this.ctx.arc(dot.x, dot.y, dot.r, 0, 2 * Math.PI, true);
        this.ctx.fill();
      }
      else {
        // Dot animationCount is bigger than maxAnimationCount. Remove it from the animating dots array
        this.dots.splice(i, 1);
      }
    }
  }

  registerPoint(x, y) {
    // The point where mouse were located
    const point = new Dot(x, y);

    if (this.lastPoint) {
      let that = this;
      let midpoint = Dot.midPoint(this.lastPoint, point);
      let midpoint1 = Dot.midPoint(point, midpoint);
      let midpoint2 = Dot.midPoint(this.lastPoint, midpoint);
      let midpoint3 = Dot.midPoint(point, midpoint1);
      let midpoint4 = Dot.midPoint(midpoint1, midpoint);
      let midpoint5 = Dot.midPoint(midpoint, midpoint2);
      let midpoint6 = Dot.midPoint(midpoint2, this.lastPoint);

      let dotsToDraw = this.findNearestGridDots(point.x, point.y, this.trailWidth);
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint.x, midpoint.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint1.x, midpoint1.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint2.x, midpoint2.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint3.x, midpoint3.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint4.x, midpoint4.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint5.x, midpoint5.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint6.x, midpoint6.y, this.trailWidth));

      // Skip dots if they are already in animation
      for (let i in dotsToDraw) {
        let found = false;
        for (let j in that.dots) {
          if (that.dots[j].x === dotsToDraw[i].x && that.dots[j].y === dotsToDraw[i].y) {
            found = true;
            break;
          }
        }
        if (!found) {
          that.dots.push(dotsToDraw[i])
        }
      }
    }

    this.lastPoint = point;
  }
};
const DottedGrid = class DottedGrid {

  constructor(canvasElement) {
    const that = this;

    // The grid step
    this.dotsStep = 10;

    // The default size of dots in grid
    this.dotsDefaultRadius = 0.5;

    // The max size of animated dots on mouse movement
    this.dotsMaxRadius = 2;

    // The width of trail which appears after the mouse
    this.trailWidth = 8;

    // The number of animation frames for dot animation. Bigger numbers mean longer animation duration.
    this.maxAnimationCount = 40;

    this.gridGradientColor1 = '#204868';
    this.gridGradientColor2 = '#256456';
    this.gridGradientColor3 = '#5a643d';
    this.activeGradientColor1 = '#e5fe48';
    this.activeGradientColor2 = '#00ffae';
    this.activeGradientColor3 = '#0092ff';

    // Pattern's offsets relative to the grid.
    this.patternVerticalOffset = 1;
    this.patternHorizontalOffset = 0;

    // Array of dots which are currently being animated
    this.dots = [];
    // The last point where mouse event was registered
    this.lastPoint = null;

    this.canvas = canvasElement;

    this.setupScene();
    this.draw();

    var isAnimated = false;
    this.canvas.addEventListener('mousemove', function (e) {
      if(!isAnimated){
        isAnimated = new AnimatedGrid(document.querySelector('#animated-grid'));
      }
      isAnimated.registerPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
      that.registerPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    });

    this.canvas.addEventListener('touchmove', function (e) {
      that.registerPoint(
        e.changedTouches[0].pageX - this.offsetLeft,
        e.changedTouches[0].pageY - this.offsetTop
      );
    });

    window.addEventListener('resize', function () {
      that.setupScene();
    })
  }

  setupScene() {
    this.dots = [];
    this.lastPoint = null;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.prerenderedGrid = this.renderGrid();
    this.ctx = this.canvas.getContext('2d');

    const activeGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    activeGradient.addColorStop(0, this.activeGradientColor1);
    activeGradient.addColorStop(0.5, this.activeGradientColor2);
    activeGradient.addColorStop(1, this.activeGradientColor3);
    this.activeGradient = activeGradient;
  }

  renderGrid() {
    let canvas = document.createElement('canvas');
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    let context = canvas.getContext('2d');

    const gridGradient = context.createLinearGradient(0, 0, this.canvas.width, 0);
    gridGradient.addColorStop(0, this.gridGradientColor1);
    gridGradient.addColorStop(0.5, this.gridGradientColor2);
    gridGradient.addColorStop(1, this.gridGradientColor3);

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < Math.round(canvas.width / this.dotsStep * 1.1); i++) {
      for (let j = 0; j < Math.round(canvas.height / this.dotsStep * 1.1); j++) {
        let x = this.dotsStep * i + this.patternHorizontalOffset;
        let y = this.dotsStep * j + this.patternVerticalOffset;
        let r = this.dotsDefaultRadius;

        context.beginPath();
        context.fillStyle = gridGradient;
        context.arc(x, y, r, 0, 2 * Math.PI, true);
        context.fill();
      }
    }

    return canvas;
  }

  findNearestGridDots(x, y, dist) {
    let givenDot = new Dot(x, y);

    // The positions in the grid matrix
    let i_min = Math.floor(x / this.dotsStep);
    let j_min = Math.floor(y / this.dotsStep);

    // The dots in the surrounding square
    // In the future we can also add dots from the outer 4x4 square also
    let surroundingSquare = [
      {i: i_min, j: j_min},
      {i: i_min, j: j_min + 1},
      {i: i_min + 1, j: j_min},
      {i: i_min + 1, j: j_min + 1}];

    // Only those dots which are closer than the given distance
    let nearestDots = [];

    for (let n in surroundingSquare) {
      let dotX = this.dotsStep * surroundingSquare[n].i + this.patternHorizontalOffset;
      let dotY = this.dotsStep * surroundingSquare[n].j + this.patternVerticalOffset;

      let currentDot = new Dot(dotX, dotY, this.dotsDefaultRadius);

      if (Dot.distance(givenDot, currentDot) < dist) {
        nearestDots.push(currentDot);
      }
    }

    return nearestDots;
  }

  draw() {
    const that = this;
    requestAnimationFrame(function () {
      that.draw();
    });

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.prerenderedGrid, 0, 0);
    this.drawAnimatedDots();
  }

  drawAnimatedDots() {
    let b, k;

    for (let i in this.dots) {
      let dot = this.dots[i];
      if (dot.animationCount < this.maxAnimationCount) {

        if (dot.animationCount < this.maxAnimationCount / 2) {
          // Linear increase
          // t = dot.animationCount
          // r(t) = k*t + b
          // r(0) = dotsDefaultRadius
          // r(maxAnimationCount/2) = dotsMaxRadius
          b = this.dotsDefaultRadius;
          k = 2 * (this.dotsMaxRadius - this.dotsDefaultRadius) / this.maxAnimationCount;
        }
        else {
          // Linear decrease
          // t = dot.animationCount
          // r(t) = k*t + b
          // r(maxAnimationCount/2) = dotsMaxRadius
          // r(maxAnimationCount) = dotsDefaultRadius
          b = 2 * this.dotsMaxRadius - this.dotsDefaultRadius;
          k = -2 * (this.dotsMaxRadius - this.dotsDefaultRadius) / this.maxAnimationCount;
        }

        dot.r = k * dot.animationCount + b;
        dot.animationCount++;

        this.ctx.beginPath();
        this.ctx.fillStyle = this.activeGradient;
        this.ctx.arc(dot.x, dot.y, dot.r, 0, 2 * Math.PI, true);
        this.ctx.fill();
      }
      else {
        // Dot animationCount is bigger than maxAnimationCount. Remove it from the animating dots array
        this.dots.splice(i, 1);
      }
    }
  }

  registerPoint(x, y) {
    // The point where mouse were located
    const point = new Dot(x, y);

    if (this.lastPoint) {
      let that = this;
      let midpoint = Dot.midPoint(this.lastPoint, point);
      let midpoint1 = Dot.midPoint(point, midpoint);
      let midpoint2 = Dot.midPoint(this.lastPoint, midpoint);
      let midpoint3 = Dot.midPoint(point, midpoint1);
      let midpoint4 = Dot.midPoint(midpoint1, midpoint);
      let midpoint5 = Dot.midPoint(midpoint, midpoint2);
      let midpoint6 = Dot.midPoint(midpoint2, this.lastPoint);

      let dotsToDraw = this.findNearestGridDots(point.x, point.y, this.trailWidth);
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint.x, midpoint.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint1.x, midpoint1.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint2.x, midpoint2.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint3.x, midpoint3.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint4.x, midpoint4.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint5.x, midpoint5.y, this.trailWidth));
      dotsToDraw = dotsToDraw.concat(this.findNearestGridDots(midpoint6.x, midpoint6.y, this.trailWidth));

      // Skip dots if they are already in animation
      for (let i in dotsToDraw) {
        let found = false;
        for (let j in that.dots) {
          if (that.dots[j].x === dotsToDraw[i].x && that.dots[j].y === dotsToDraw[i].y) {
            found = true;
            break;
          }
        }
        if (!found) {
          that.dots.push(dotsToDraw[i])
        }
      }
    }

    this.lastPoint = point;
  }
};


new DottedGrid(document.querySelector('#dotted-grid'));
