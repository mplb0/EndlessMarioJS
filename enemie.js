function Enemie(canvasCtx, type, sprite, dimensions, gapCoefficient, speed) {

  this.canvasCtx = canvasCtx;
  this.sprite = sprite;
  this.typeConfig = type;
  this.gapCoefficient = gapCoefficient;
  this.size = 1;
  this.dimensions = dimensions;
  this.remove = false;
  this.xPos = 0;
  this.yPos = 0;
  this.width = 0;
  this.collisionBoxes = [];
  this.gap = 0;
  this.speedOffset = 0;
  this.dead = false;
  this.status = Enemie.status.ALIVE;
  
  this.currentFrame = 0;
  this.timer = 0;

  this.init(speed);
};

Enemie.status = {
  ALIVE: 'ALIVE',
  DEAD: 'DEAD'
};


Enemie.MAX_GAP_COEFFICIENT = 2;

Enemie.MAX_Enemie_LENGTH = 3,


Enemie.prototype = {

  init: function(speed) {
    
    this.size = 1;
    
	this.width = this.typeConfig.width;
    this.xPos = this.dimensions.WIDTH - this.width;
    this.yPos = this.typeConfig.yPos;

    this.draw();

    // For Enemies that go at a different speed from the ground.
    if (this.typeConfig.speedOffset) {
      this.speedOffset = this.typeConfig.speedOffset;
    }

    this.gap = this.getGap(this.gapCoefficient, speed);
  },

  draw: function() {
    var sourceWidth = this.typeConfig.width;
    var sourceHeight = this.typeConfig.height[this.status];

	var sourceX = (Array.isArray(this.typeConfig.framesX[this.status]) && this.typeConfig.framesX[this.status].length > 1) ?  this.typeConfig.framesX[this.status][this.currentFrame] : this.typeConfig.framesX[this.status][0];
	var sourceY = (Array.isArray(this.typeConfig.framesY[this.status]) && this.typeConfig.framesY[this.status].length > 1) ?  this.typeConfig.framesY[this.status][this.currentFrame] : this.typeConfig.framesY[this.status][0];	
	
	
	
	this.canvasCtx.drawImage(this.sprite, sourceX, sourceY, sourceWidth, sourceHeight, this.xPos, this.yPos[this.status], this.typeConfig.width, this.typeConfig.height[this.status]);
//	               drawImage(        img,      sx,      sy,      sWidth,      sHeight,        dx,        dy,                dWidth,                dHeight)
  },

  update: function(deltaTime, speed) {
    if (!this.remove) {
      if (this.typeConfig.speedOffset) {
        speed += this.speedOffset;
      }
      this.xPos -= Math.floor((speed * FPS / 1000) * deltaTime);

      // Update frame
      if (this.typeConfig.numFrames) {
        this.timer += deltaTime;
        if (this.timer >= this.typeConfig.frameRate) {
          this.currentFrame =
              this.currentFrame == this.typeConfig.numFrames - 1 ?
              0 : this.currentFrame + 1;
          this.timer = 0;
        }
      }
      this.draw();

      if (!this.isVisible()) {
        this.remove = true;
      }
    }
  },

  getGap: function(gapCoefficient, speed) {
    var minGap = Math.round(this.width * speed + this.typeConfig.minGap * gapCoefficient);
    var maxGap = Math.round(minGap * Enemie.MAX_GAP_COEFFICIENT);

    return getRandomNum(minGap, maxGap);
  },
  setDead: function(){
	this.dead = true;
	this.status = Enemie.status.DEAD;
  },
  getHeight: function(){
	  return this.typeConfig.height[this.status];
  },
  getWidth: function(){
	  return this.typeConfig.width;
  },
  getYPos: function(){
	  return this.typeConfig.yPos[this.status];
  },
  isVisible: function() {
    return this.xPos + this.width > 0;
  },

  cloneCollisionBoxes: function() {
    var collisionBoxes = this.typeConfig.collisionBoxes;

    for (var i = collisionBoxes.length - 1; i >= 0; i--) {
      this.collisionBoxes[i] = new CollisionBox(collisionBoxes[i].x,
          collisionBoxes[i].y, collisionBoxes[i].width,
          collisionBoxes[i].height);
    }
  }
};

Enemie.types = [
  {
    type: 'TURTLE_GREEN',
	framesX:{
		ALIVE: [80, 120],
		DEAD : [120]
	},
	framesY:{
		ALIVE: [0],
		DEAD : [120]
	},
    width: 35,
    height: {
		ALIVE: [35],
		DEAD : [20]
	},
    yPos: {
		ALIVE: [140],
		DEAD : [150]
	},
    multipleSpeed: 4,
    minGap: 140,
    minSpeed: 0,
    numFrames: 2,
    frameRate: 1000/5,
	speedOffset: .8,
    collisionBoxes: [
      new CollisionBox(0, 0, 20, 10)
	]
  },
  {
    type: 'TURTLE_RED',
	framesX:{
		ALIVE: [240, 280],
		DEAD : [280]
	},
	framesY:{
		ALIVE: [0],
		DEAD : [120]
	},
    width: 35,
    height: {
		ALIVE: [35],
		DEAD : [20]
	},
    yPos: {
		ALIVE: [140],
		DEAD : [150]
	},
    multipleSpeed: 4,
    minGap: 140,
    minSpeed: 0,
    numFrames: 2,
    frameRate: 1000/5,
	speedOffset: .8,
    collisionBoxes: [
      new CollisionBox(0, 0, 35, 10)
	]
  },
  {
    type: 'TURTLE_BLUE',
	framesX:{
		ALIVE: [80, 120],
		DEAD : [120]
	},
	framesY:{
		ALIVE: [160],
		DEAD : [280]
	},
    width: 35,
    height: {
		ALIVE: [35],
		DEAD : [20]
	},
    yPos: {
		ALIVE: [140],
		DEAD : [150]
	},
    multipleSpeed: 4,
    minGap: 140,
    minSpeed: 0,
    numFrames: 2,
    frameRate: 1000/5,
	speedOffset: .8,
    collisionBoxes: [
      new CollisionBox(0, 0, 35, 10)
	]
  },
  {
    type: 'TURTLE_YELLOW',
	framesX:{
		ALIVE: [240, 280],
		DEAD : [280]
	},
	framesY:{
		ALIVE: [160],
		DEAD : [280]
	},
    width: 35,
    height: {
		ALIVE: [35],
		DEAD : [20]
	},
    yPos: {
		ALIVE: [140],
		DEAD : [150]
	},
    multipleSpeed: 4,
    minGap: 140,
    minSpeed: 0,
    numFrames: 2,
    frameRate: 1000/5,
	speedOffset: .8,
    collisionBoxes: [
      new CollisionBox(0, 0, 35, 10)
	]
  },
  {
    type: 'SHELL_GREEN',
	framesX:{
		ALIVE: [0],
		DEAD : [120]
	},
	framesY:{
		ALIVE: [5, 45, 85],
		DEAD : [120]
	},
	width: 40,
    height: {
		ALIVE: [35],
		DEAD : [20]
	},
    yPos: {
		ALIVE: [150],
		DEAD : [150]
	},
    multipleSpeed: 4,
    minSpeed: 10,
    minGap: 300,
    numFrames: 3,
    frameRate: 1000/10,
	speedOffset: 1.8, //Shells always will be faster than turtles
    collisionBoxes: [
      new CollisionBox(0, 0, 40, 25)
	]
  },
  {
    type: 'SHELL_RED',
	framesX:{
		ALIVE: [160],
		DEAD : [120]
	},
	framesY:{
		ALIVE: [5, 45, 85],
		DEAD : [120]
	},
	width: 40,
    height: {
		ALIVE: [35],
		DEAD : [20]
	},
    yPos: {
		ALIVE: [150],
		DEAD : [150]
	},
    multipleSpeed: 4,
    minSpeed: 10,
    minGap: 300,
    numFrames: 3,
    frameRate: 1000/10,
	speedOffset: 1.8, //Shells always will be faster than turtles
    collisionBoxes: [
      new CollisionBox(0, 0, 40, 25)
	]
  },
  {
    type: 'SHELL_BLUE',
	framesX:{
		ALIVE: [0],
		DEAD : [120]
	},
	framesY:{
		ALIVE: [165, 205, 245],
		DEAD : [120]
	},
	width: 40,
    height: {
		ALIVE: [35],
		DEAD : [20]
	},
    yPos: {
		ALIVE: [150],
		DEAD : [150]
	},
    multipleSpeed: 4,
    minSpeed: 10,
    minGap: 300,
    numFrames: 3,
    frameRate: 1000/10,
	speedOffset: 1.8, //Shells always will be faster than turtles
    collisionBoxes: [
      new CollisionBox(0, 0, 40, 25)
	]
  },
  {
    type: 'SHELL_YELLOW',
	framesX:{
		ALIVE: [160],
		DEAD : [120]
	},
	framesY:{
		ALIVE: [165, 205, 245],
		DEAD : [120]
	},
	width: 40,
    height: {
		ALIVE: [35],
		DEAD : [20]
	},
    yPos: {
		ALIVE: [150],
		DEAD : [150]
	},
    multipleSpeed: 4,
    minSpeed: 10,
    minGap: 300,
    numFrames: 3,
    frameRate: 1000/10,
	speedOffset: 1.8, //Shells always will be faster than turtles
    collisionBoxes: [
      new CollisionBox(0, 0, 40, 25)
	]
  }
];