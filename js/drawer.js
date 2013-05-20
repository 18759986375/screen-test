(function(undefined) {

  var Mode = {
    pencil : 0,
    circle : 1,
    rect : 2
  };

  var Util = {
    bind : function(fn, context) {
      return function() {
        fn.apply(context, arguments);
      };
    }
  };

  var Drawer = function(canvas) {
    this.mode = Mode.pencil;
    this.canvas = canvas;
    this.startingX = 0;
    this.startingY = 0;
    this.dragging = false;
    this.color = '#000000';
    this.width = 2;
    this._points = [];

    this.init();
  };

  Drawer.prototype = {
    init : function() {
      this.canvas.addEventListener('mousedown', Util.bind(this.onMouseDown, this));
      this.canvas.addEventListener('mouseup', Util.bind(this.onMouseUp, this));
      this.canvas.addEventListener('mousemove', Util.bind(this.onMouseMove, this));

      this.ctx = this.canvas.getContext('2d');
      this.setupMemoryCanvas();
    },

    setupMemoryCanvas : function() {
      this.memCanvas = document.createElement('canvas');
      this.memCanvas.width = this.canvas.width;
      this.memCanvas.height = this.canvas.height;
      this.memCtx = this.memCanvas.getContext('2d');
    },

    /* Public API */
    setMode : function(mode) {
      if(!Mode.hasOwnProperty(mode)) {
        mode = 'pencil'
      }

      this.mode = Mode[mode];
    },

    setColor : function(color) {
      this.color = color;
    },

    setLineWidth : function(width) {
      if(this.width <= 0) {
        throw new Error('Width must be positive. Given ' + width);
      }

      this.width = width;
    },
    /* End Public API */

    onMouseDown : function(e) {
      this.startingX = e.pageX - this.canvas.offsetLeft;
      this.startingY = e.pageY - this.canvas.offsetTop;
      this.dragging = true;

      // Update the width and height of the in-memory canvas just in case the dimensions have changed
      this.memCanvas.width = this.canvas.width;
      this.memCanvas.height = this.canvas.height;
      this.memCtx.drawImage(this.canvas, 0, 0);
    },

    onMouseUp : function(e) {
      this.dragging = false;
      this.previousPoints = null;

      this.memCanvas.width = this.memCanvas.width;
      this.memCtx.drawImage(this.canvas, 0, 0);
      this._points = [];
    },

    onMouseMove : function(e) {
      if(this.dragging) {
        var x = e.pageX - this.canvas.offsetLeft
          , y = e.pageY - this.canvas.offsetTop;

        this.draw(x, y);
      }
    },

    draw : function(currentX, currentY) {
      if(this.mode === Mode.pencil) {
        this.drawPencil(currentX, currentY);
      }
      else if(this.mode === Mode.circle) {
        this.drawEllipse(currentX, currentY);
      }
      else if(this.mode === Mode.rect) {
        this.drawRect(currentX, currentY);
      }
    },

    drawEllipse : function(currentX, currentY) {
      this.canvas.width = this.canvas.width;

      this.ctx.drawImage(this.memCanvas, 0, 0);

      var width = Math.abs(this.startingX - currentX)
        , height = Math.abs(this.startingY - currentY);

      var x = this.startingX
        , y = this.startingY;

      if(currentX < this.startingX) x = currentX;
      if(currentY < this.startingY) y = currentY;

      var kappa = 0.5522848
        , ox = (width / 2) * kappa
        , oy = (height / 2) * kappa
        , xe = x + width
        , ye = y + height
        , xm = x + width / 2
        , ym = y + height / 2;

      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.width;
      this.ctx.beginPath();
      this.ctx.moveTo(x, ym);
      this.ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
      this.ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
      this.ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
      this.ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
      this.ctx.closePath();
      this.ctx.stroke();
    },

    drawRect : function(currentX, currentY) {
      this.canvas.width = this.canvas.width;

      this.ctx.drawImage(this.memCanvas, 0, 0);

      var width = Math.abs(this.startingX - currentX)
        , height = Math.abs(this.startingY - currentY)
        , x = this.startingX
        , y = this.startingY;

      if(currentX < this.startingX) x = currentX;
      if(currentY < this.startingY) y = currentY;

      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.width;
      this.ctx.strokeRect(x, y, width, height);
    },

    previousPoints : null,
    drawPencil : function(currentX, currentY) {
      this.canvas.width = this.canvas.width;
      this._points.push([ currentX, currentY ]);
      this.ctx.drawImage(this.memCanvas, 0, 0);

      this.ctx.strokeStyle = this.color;
      this.ctx.lineJoin = "round";
      this.ctx.lineWidth = this.width;

      if(this._points.length < 6) {
        var b = this._points[0];
        this.ctx.beginPath();
        this.ctx.arc(b[0], b[1], this.ctx.lineWidth / 2, 0, Math.PI * 2, !0);
        this.ctx.closePath();
        this.ctx.fill();
        return;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(this._points[0][0], this._points[0][1]);
      var i = 0;
      for(i = 0; i < this._points.length - 2; i++) {
        var c = (this._points[i][0] + this._points[i + 1][0]) / 2
          , d = (this._points[i][1] + this._points[i + 1][1]) / 2;
        this.ctx.quadraticCurveTo(this._points[i][0], this._points[i][1], c, d);
      }
      this.ctx.quadraticCurveTo(this._points[i][0], this._points[i][1], this._points[i + 1][0], this._points[i + 1][1]);
      this.ctx.stroke();

      /*this.ctx.strokeStyle = this.color;
      this.ctx.lineJoin = "round";
      this.ctx.lineWidth = this.width;

      this.ctx.moveTo(this.previousPoints.x, this.previousPoints.y);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.closePath();
      this.ctx.stroke();

      this.previousPoints = { x : currentX, y : currentY };*/
    }

  };

  this.Drawer = Drawer;
}).call(this);
