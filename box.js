function checkForCollision(enemie, mario, opt_canvasCtx) {
	if(enemie.dead){
		return false;
	}
	
  var enemieBoxXPos = Game.defaultDimensions.WIDTH + enemie.xPos;

  var marioBox = new CollisionBox( mario.xPos + 8, mario.yPos, mario.config.WIDTH - 25, mario.config.HEIGHT - 10);

  var enemieBox = new CollisionBox(enemie.xPos + 10, enemie.getYPos() ,enemie.getWidth() - 20, enemie.getHeight() - 5);

  // Debug outer box
  if (opt_canvasCtx) {
    drawCollisionBoxes(opt_canvasCtx, marioBox, enemieBox);
  }

  // Simple outer bounds check.
  if (boxCompare(marioBox, enemieBox)) {
	  return true;
  }
  return false;
};

function createAdjustedCollisionBox(box, adjustment) {
  return new CollisionBox( box.x + adjustment.x, box.y + adjustment.y, box.width, box.height);
};

function drawCollisionBoxes(canvasCtx, marioBox, enemieBox) {
  canvasCtx.save();
  canvasCtx.strokeStyle = '#f00';
  canvasCtx.strokeRect(marioBox.x, marioBox.y, marioBox.width, marioBox.height);

  canvasCtx.strokeStyle = '#0f0';
  canvasCtx.strokeRect(enemieBox.x, enemieBox.y, enemieBox.width, enemieBox.height);
  canvasCtx.restore();
};

function boxCompare(marioBox, enemieBox) {
	var crashed = false;
	var marioBoxX = marioBox.x;
	var marioBoxY = marioBox.y;

	var enemieBoxX = enemieBox.x;
	var enemieBoxY = enemieBox.y;

	// Axis-Aligned Bounding Box method.
	if (marioBox.x < enemieBoxX + enemieBox.width &&
	    marioBox.x + marioBox.width > enemieBoxX &&
	    marioBox.y < enemieBox.y + enemieBox.height &&
	    marioBox.height + marioBox.y > enemieBox.y) {

		crashed = true;

	}

	return crashed;
};

function isJumpingOn(enemie, mario){
	
	var marioBox = new CollisionBox( mario.xPos + 8, mario.yPos, mario.config.WIDTH - 25, mario.config.HEIGHT - 10);

	var enemieBox = new CollisionBox(enemie.xPos + 10, enemie.getYPos() ,enemie.getWidth() - 20, enemie.getHeight() - 5);
	
	var jumpOn = false;
	
		// Axis-Aligned Bounding Box method.
	if (marioBox.y + marioBox.height > enemieBox.y && marioBox.y + marioBox.height < enemieBox.y + enemieBox.height && 
	    (marioBox.x  >= enemieBox.x  || marioBox.x + marioBox.width <= enemieBox.x + enemieBox.width ) && 
		mario.jumpVelocity > 0) {

		jumpOn = true;

	}

	return jumpOn;
	
}

function CollisionBox(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
};