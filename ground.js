	function Ground(canvas,  spriteGround) {
		this.spriteGround = spriteGround;
		//this.spritePos = spritePos;
		this.canvas = canvas;
		this.canvasCtx = canvas.getContext('2d');
		this.sourceDimensions = {};
		this.dimensions = Ground.dimensions;
		this.sourceXPos = [24, 24];
		this.sourceYPos = [5,22];
		this.xPos = [];
		this.yPos = [];
		this.bumpThreshold = 0.5;

		this.setSourceDimensions();
		this.draw();
	};

	Ground.dimensions = {
		WIDTH: 600,
		SPRITE_WIDTH: 16,
		HEIGHT: 16,
		SPRITE_HEIGHT: 16,
		YPOS: 168,
		YPOS2: 184
	};


	Ground.prototype = {
		setSourceDimensions: function() {

			for (var dimension in Ground.dimensions) {
				this.sourceDimensions[dimension] = Ground.dimensions[dimension];

				this.dimensions[dimension] = Ground.dimensions[dimension];
			}

			this.xPos = [0, Ground.dimensions.WIDTH];
			this.yPos = [Ground.dimensions.YPOS, Ground.dimensions.YPOS2];
		},
		draw: function() {
			var x = this.xPos[0];
			while(x<this.dimensions.WIDTH){
				this.canvasCtx.drawImage(this.spriteGround, this.sourceXPos[0], this.sourceYPos[0], this.sourceDimensions.SPRITE_WIDTH, this.sourceDimensions.SPRITE_HEIGHT, x, this.yPos[0], this.dimensions.SPRITE_WIDTH, this.dimensions.HEIGHT);
				//			   drawImage(               img,                 sx,                 sy,                             sWidth,                             sHeight,           dx,        dy,                dWidth,                dHeight)

				this.canvasCtx.drawImage(this.spriteGround, this.sourceXPos[1], this.sourceYPos[1],	this.sourceDimensions.SPRITE_WIDTH, this.sourceDimensions.SPRITE_HEIGHT, x, this.yPos[1],	this.dimensions.SPRITE_WIDTH, this.dimensions.HEIGHT);
				//			   drawImage(               img,                 sx,                 sy,                                sWidth,                             sHeight,           dx,        dy,                dWidth,                dHeight)
				
				x += this.sourceDimensions.SPRITE_WIDTH;
			}
		},
		updateXPos: function(pos, increment) {
			var line1 = pos;
			var line2 = pos == 0 ? 1 : 0;

			this.xPos[line1] -= increment;
			this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH;
		},
		update: function(deltaTime, speed) {
			var increment = Math.floor(speed * (FPS / 1000) * deltaTime);

			if (this.xPos[0] <= 0) {
				this.updateXPos(0, increment);
			} else {
				this.updateXPos(1, increment);
			}
			
			this.draw();
		},

		reset: function() {
			this.xPos[0] = 0;
			this.xPos[1] = Ground.dimensions.WIDTH;
		}
	};