	/*********************************************************************
     *   Mario
     */
	function Mario(canvas, sprite) {
		this.canvas = canvas;
		this.canvasCtx = canvas.getContext('2d');
		this.sprite = sprite;
		this.xPos = 50;
		this.yPos = 0;
		// Position when on the ground.
		this.groundYPos = 0;
		this.currentFrame = 0;
		this.currentAnimFrames = [];
		this.blinkDelay = 0;
		this.animStartTime = 0;
		this.timer = 0;
		this.msPerFrame = 1000 / FPS;
		this.config = Mario.config;
		
		// Current status.
		this.status = Mario.status.WAITING;

		this.jumping = false;
		this.dying = false; //TODO: player down animation
		this.dead = false;
		
		this.jumpVelocity = 0;
		this.reachedMinHeight = false;
		this.speedDrop = false;
		this.jumpCount = 0;
		this.jumpspotX = 0;

		this.init();
	};

	Mario.config = {
	  DROP_VELOCITY: -5,
	  GRAVITY: 0.6,
	  HEIGHT: 40,
	  HEIGHT_DUCK: 25,
	  INIITAL_JUMP_VELOCITY: -10,
	  INTRO_DURATION: 1500,
	  MAX_JUMP_HEIGHT: 30,
	  MIN_JUMP_HEIGHT: 30,
	  START_X_POS: 0,
	  WIDTH: 40,
	  WIDTH_DUCK: 59
	};

	Mario.collisionBoxes = [new CollisionBox(0, 0, 20, 20) ];

	Mario.status = {
	  CRASHED: 'CRASHED',
	  JUMPING: 'JUMPING',
	  RUNNING: 'RUNNING',
	  WAITING: 'WAITING'
	};

	Mario.animFrames = {
	  WAITING: {
		frames: [320],
		frameY: 115,
		msPerFrame: 1000 / 3
	  },
	  RUNNING: {
		frames: [320, 360],
		frameY: 75,
		msPerFrame: 1000 / 12
	  },
	  CRASHED: {
		frames: [0],
		frameY: 35,
		msPerFrame: 1000 / 60
	  },
	  JUMPING: {
		frames: [200],//,240],
		frameY: 110,
		msPerFrame: 1000 / 60
	  }
	};

	Mario.prototype = {
		init: function() {

			this.groundYPos = Game.defaultDimensions.HEIGHT - this.config.HEIGHT - Game.config.BOTTOM_PAD;
			this.yPos = this.groundYPos;
			
			//this.draw(Mario.animFrames.WAITING.framesX[0], Mario.animFrames.WAITING.framesY[0]);
			this.update(0, Mario.status.WAITING);
		},

		update: function(deltaTime, opt_status) {
			this.timer += deltaTime;

			// Update the status.
			if (opt_status) {
				this.status = opt_status;
				this.currentFrame = 0;
				this.msPerFrame = Mario.animFrames[opt_status].msPerFrame;
				this.currentAnimFrames = Mario.animFrames[opt_status].frames;
				this.currentAnimFramesY = Mario.animFrames[opt_status].frameY;
			}

			this.draw(this.currentAnimFrames[this.currentFrame], this.currentAnimFramesY);

			// Update the frame position.
			if (this.timer >= this.msPerFrame) {
				this.currentFrame = this.currentFrame == this.currentAnimFrames.length - 1 ? 0 : this.currentFrame + 1;
				this.timer = 0;
			}

		},

	  draw: function(x, y) {
		var sourceX = x;
		var sourceY = y;
		var sourceWidth = this.config.WIDTH;
		var sourceHeight = this.config.HEIGHT;

		// Standing / running
		this.canvasCtx.drawImage(this.sprite, sourceX, sourceY, sourceWidth, sourceHeight, this.xPos, this.yPos, this.config.WIDTH, this.config.HEIGHT);
	  },
	  setJumpVelocity: function(setting) {
		this.config.INIITAL_JUMP_VELOCITY = -setting;
		this.config.DROP_VELOCITY = -setting / 2;
	  },
	  startJump: function(speed) {
		if (!this.jumping) {
		  this.update(0, Mario.status.JUMPING);
		  
		  this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY - (speed / 10);
		  this.jumping = true;
		  this.reachedMinHeight = false;
		  this.speedDrop = false;
		}
	  },
	  endJump: function() {
		if (this.reachedMinHeight &&
			this.jumpVelocity < this.config.DROP_VELOCITY) {
		  this.jumpVelocity = this.config.DROP_VELOCITY;
		}
	  },
	  updateJump: function(deltaTime, speed) {
		var msPerFrame = Mario.animFrames[this.status].msPerFrame;
		var framesElapsed = deltaTime / msPerFrame;

		if(this.dead) return;
		
		if (this.speedDrop) {
		  this.yPos += Math.round(this.jumpVelocity *
			  this.config.SPEED_DROP_COEFFICIENT * framesElapsed);
		} else {
		  this.yPos += Math.round(this.jumpVelocity * framesElapsed);
		}

		this.jumpVelocity += this.config.GRAVITY * framesElapsed;
		
		if (this.yPos < this.minJumpHeight) {
		  this.reachedMinHeight = true;
		}

		if (this.yPos < this.config.MAX_JUMP_HEIGHT) {
		  this.endJump();
		}

		// Jump is done! =)
		if (this.yPos > this.groundYPos) {
		  this.reset();
		  this.jumpCount++;
		}

		this.update(deltaTime);
	  },
	  reset: function() {
		this.yPos = this.groundYPos;
		this.jumpVelocity = 0;
		this.jumping = false;
		this.ducking = false;
		this.update(0, Mario.status.RUNNING);
		this.midair = false;
		this.speedDrop = false;
		this.jumpCount = 0;
	  }
	};