	var FPS = 60;
		
	function Game(opt_config) {
		// Only one instance
		if (Game.instance_) {
			return Game.instance_;
		}
		Game.instance_ = this;
		this.config = opt_config || Game.config;

		this.dimensions = Game.defaultDimensions;

		this.canvas = null;
		this.canvasCtx = null;

		this.distanceMeter = null;
		this.distanceRan = 0;

		this.highestScore = 0;

		this.time = 0;
		this.runningTime = 0;
		this.msPerFrame = 1000 / FPS;
		this.currentSpeed = this.config.SPEED;

		this.mario = null;
		this.ground = null;
		this.enemies = [];
		this.powerups = [];

		//Game states
		this.started = false;
		this.activated = false;
		this.crashed = false;
		this.paused = false;
		
		// Images.
		this.images = {};
		this.imagesLoaded = 0;
		
		this.loadImages();
	}
		
	Game.config = {
		ACCELERATION: 0.001,
		BOTTOM_PAD: 20,
		CLEAR_TIME: 3000,
		GAP_COEFFICIENT: 0.6,
		GRAVITY: 0.6,
		INITIAL_JUMP_VELOCITY: 12,
		MAX_SPEED: 13,
		SPEED: 3,
		SPEED_DROP_COEFFICIENT: 3
	};

	Game.defaultDimensions = {
		WIDTH: 600,
		HEIGHT: 200
	};

	Game.keycodes = {
	  JUMP: {'38': 1},// Up, spacebar
	  RESTART: {'13': 1}  // Enter
	};
	
	Game.events = {
		ANIM_END: 'webkitAnimationEnd',
		CLICK: 'click',
		KEYDOWN: 'keydown',
		KEYUP: 'keyup',
		MOUSEDOWN: 'mousedown',
		MOUSEUP: 'mouseup',
		RESIZE: 'resize',
		TOUCHEND: 'touchend',
		TOUCHSTART: 'touchstart',
		VISIBILITY: 'visibilitychange',
		BLUR: 'blur',
		FOCUS: 'focus',
		LOAD: 'load',
		GAMEPADCONNECTED: 'gamepadconnected'
	};
	
	Game.prototype = {
		loadImages: function() {
			this.background = document.getElementById('background');
			this.marioSprite = document.getElementById('mario-sprite');
			this.groundSprite = document.getElementById('ground-sprite');
			this.enemiesSprite = document.getElementById('enemies-sprite');
			
			this.loadSounds();
		},  
		loadSounds:function(){
			
			this.backAudio = new Audio('assets/back.mp3');
			this.gameOverAudio = new Audio('assets/gameOver.mp3');
			this.jumpAudio = new Audio('assets/jump.wav');
			this.stompAudio = new Audio('assets/stomp.wav');
			
			this.backAudio.addEventListener('ended', function() {
				this.currentTime = 0;
				this.play();
			}, false);
			
			
			
			this.init();
		},
		setSpeed: function(opt_speed) {
			var speed = opt_speed || this.currentSpeed;

			this.currentSpeed =  speed;
		},
		drawBackgound: function(){
			this.canvasCtx.drawImage(this.background,0,0,this.dimensions.WIDTH, this.dimensions.HEIGHT);
		},
		clearCanvas: function() {
			this.canvasCtx.clearRect(0, 0, this.dimensions.WIDTH,this.dimensions.HEIGHT);
		},
		init: function() {
			this.setSpeed();

			this.canvas = document.getElementById('game-canvas');

			this.canvasCtx = this.canvas.getContext('2d');
			this.canvasCtx.fillStyle = 'blue';
			this.canvasCtx.fill();

			this.drawBackgound();

			this.ground = new Ground(this.canvas,this.groundSprite);
			
			this.mario = new Mario(this.canvas, this.marioSprite);
			
			this.startListening();
			this.update();
			//this.play();
		},
		update: function() {
			this.drawPending = false;

			var now = getTimeStamp();
			var deltaTime = now - (this.time || now);
			this.time = now;

			
			if (this.activated) {
				this.clearCanvas();
				this.drawBackgound();

				if (this.mario.jumping) {
					this.mario.updateJump(deltaTime);
				}

				this.runningTime += deltaTime;
				var hasObstacles = this.runningTime > this.config.CLEAR_TIME;

				if (this.mario.jumpCount == 1 && !this.started) {
					this.play();
				}
				
				deltaTime = !this.started ? 0 : deltaTime;
				
				this.ground.update(deltaTime, this.currentSpeed, false);
				
				if(hasObstacles){
					this.updateEnemies(deltaTime, this.currentSpeed);
				}

				// Check for collisions.
				var collision = hasObstacles && checkForCollision(this.enemies[0], this.mario);//, this.canvasCtx);

				//collision = false;//FOR DEBUG

				if (!collision) {
					this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;
				} else {
					if(isJumpingOn(this.enemies[0], this.mario)){
						this.enemies[0].setDead();
						this.stompAudio.play();
					}else{
						this.gameOver();
					}
				}
			}

			if (!this.crashed) {
				this.mario.update(deltaTime);
				this.raq();
			}
		},
		play: function() {
			if (!this.crashed) {
				this.backAudio.play();
				this.activated = true;
				this.started = true;
				this.paused = false;
				this.mario.update(0, Mario.status.RUNNING);
				this.time = getTimeStamp();
				this.update();
			}
		},  
		raq: function() {
			if (!this.drawPending) {
				this.drawPending = true;
				this.raqId = requestAnimationFrame(this.update.bind(this));
			}
		},
		isRunning: function() {
			return !!this.raqId;
		},
		startListening: function() {
			// Keys.
			document.addEventListener(Game.events.KEYDOWN, this);
			document.addEventListener(Game.events.KEYUP, this);

			document.addEventListener(Game.events.MOUSEDOWN, this);
			document.addEventListener(Game.events.MOUSEUP, this);

			window.addEventListener(Game.events.GAMEPADCONNECTED, this);
			window.setInterval(this.pollGamepads.bind(this), 10);
		},
		handleEvent: function(e) {
			return (function(evtType, events) {
				switch (evtType) {
					case events.KEYDOWN:
					case events.TOUCHSTART:
					case events.MOUSEDOWN:
					case events.GAMEPADCONNECTED:
						this.onKeyDown(e);
						break;
					case events.KEYUP:
					case events.TOUCHEND:
					case events.MOUSEUP:
						this.onKeyUp(e);
						break;
				}
			}.bind(this))(e.type, Game.events);
		},
		pollGamepads: function() {
			var gamepads = navigator.getGamepads();
			var keydown = false;
			for(var i = 0; i < gamepads.length; i++) {
			  if (gamepads[i] != undefined) {
				if (gamepads[i].buttons.filter(function(e){return e.pressed == true}).length > 0) {
				  keydown = true;
				}
			  }
			}
			if (keydown != this.gamepadPreviousKeyDown) {
			  this.gamepadPreviousKeyDown = keydown;

			  var event = new Event(keydown ? 'keydown' : 'keyup');
			  event.keyCode = 32;
			  event.which = event.keyCode;
			  event.altKey = false;
			  event.ctrlKey = true;
			  event.shiftKey = false;
			  event.metaKey = false;
			  document.dispatchEvent(event);
			}
		},
		onKeyUp: function(e) {
			var keyCode = String(e.keyCode);
			var isjumpKey = Game.keycodes.JUMP[keyCode];
			   
			if (this.isRunning() && isjumpKey) {
			  this.mario.endJump();
			}
		},
		onKeyDown: function(e) {
			if (!this.mario.dead && !this.crashed && Game.keycodes.JUMP[e.keyCode]) {
				if (!this.activated) {
					this.activated = true;
				}

				if (!this.mario.jumping && !this.mario.ducking) {
					this.mario.startJump(this.currentSpeed);
					this.jumpAudio.play();
				}
			}
		},
		updateEnemies: function(deltaTime, currentSpeed) {
			var updatedEnemies = this.enemies.slice(0);

			for (var i = 0; i < this.enemies.length; i++) {
			  var enemie = this.enemies[i];
			  enemie.update(deltaTime, currentSpeed);

			  if (enemie.remove) {
				updatedEnemies.shift();
			  }
			}
			this.enemies = updatedEnemies;

			if (this.enemies.length > 0) {
			  var lastEnemie = this.enemies[this.enemies.length - 1];

			  if (lastEnemie && !lastEnemie.followingObstacleCreated && lastEnemie.isVisible() && (lastEnemie.xPos + lastEnemie.width + lastEnemie.gap) <  this.dimensions.WIDTH) {
				this.addNewEnemie(currentSpeed);
				lastEnemie.followingObstacleCreated = true;
			  }
			} else {
			  this.addNewEnemie(currentSpeed);
			}
		},
		addNewEnemie: function(currentSpeed) {
			var enemieTypeIndex = getRandomNum(0, Enemie.types.length - 1);
			var enemieType = Enemie.types[enemieTypeIndex];

			this.enemies.push(new Enemie(this.canvasCtx, enemieType, this.enemiesSprite, this.dimensions, this.config.GAP_COEFFICIENT, currentSpeed));
		},  
		gameOver: function() {			
		
			this.stop();
		
			this.crashed = true;
			this.mario.dead = true;			
			
			this.mario.update(0, Mario.status.CRASHED);


			this.backAudio.pause();
			this.gameOverAudio.play();
			
			
			//TODO: Show a gameOver screen

			// Reset the time clock.
			this.time = getTimeStamp();
		},
		stop: function() {
			this.activated = false;
			this.paused = true;
			cancelAnimationFrame(this.raqId);
			this.raqId = 0;
		},
		restart: function() {
			if (!this.raqId) {
				this.playCount++;
				this.runningTime = 0;
				this.activated = true;
				this.crashed = false;
				this.distanceRan = 0;
				this.setSpeed(this.config.SPEED);
				this.ground.reset();
				this.mario.reset();
				this.time = getTimeStamp();
				this.enemies = [];

				this.backAudio.pause();
				this.backAudio.play()
				
				this.update();
			}
		},
	}

	function getTimeStamp() {
	  return performance.now();
	}

	function getRandomNum(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}


	new Game();