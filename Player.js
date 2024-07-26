export default class Player {
  WALK_ANIMATION_TIMER = 200;
  walkAnimationTimer = this.WALK_ANIMATION_TIMER;
  duckRunImages = [];

  jumpPressed = false;
  jumpInProgress = false;
  falling = false;
  JUMP_SPEED = 0.6;
  GRAVITY = 0.4;

  constructor(ctx, width, height, minJumpHeight, maxJumpHeight, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.width = width;
    this.height = height;
    this.minJumpHeight = minJumpHeight;
    this.maxJumpHeight = maxJumpHeight;
    this.scaleRatio = scaleRatio;

    this.x = 10 * scaleRatio;
    this.y = this.canvas.height - this.height - 4 * scaleRatio;
    this.yStandingPosition = this.y;

    this.standingStillImage = new Image();   
    this.standingStillImage.src = 'images/duck_still.png';
    this.image = this.standingStillImage;

    const duckRunImage1 = new Image();
    duckRunImage1.src = 'images/duck_run1.png';
    
    const duckRunImage2 = new Image();
    duckRunImage2.src = 'images/duck_run2.png';

    this.duckJumpImage = new Image();
    this.duckJumpImage.src = 'images/duck_jump.png'
    
    this.duckRunImages.push(duckRunImage1);
    this.duckRunImages.push(duckRunImage2);


    //keyboard
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);

    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);

    //touch
    window.removeEventListener('touchstart', this.touchstart);
    window.removeEventListener('touchend', this.touchend);

    window.addEventListener('touchstart', this.touchstart);
    window.addEventListener('touchend', this.touchend);

  }

  keydown = (event) => {
    if (event.code === "Space") {
      this.jumpPressed = true;
    }
  }

  keyup = (event) => {
    if (event.code === "Space") {
      this.jumpPressed = false;
    }
  }

  touchstart = () => {
    this.jumpPressed = true;
    
  }

  touchend = () => {
    this.jumpPressed = false;
    
  }

  update(gameSpeed, frameTimeDelta) {
    this.run(gameSpeed, frameTimeDelta);

    if (this.jumpInProgress) {
      this.image = this.duckJumpImage;
    } 

    this.jump(frameTimeDelta);
  }

  jump(frameTimeDelta) {
    if (this.jumpPressed) {
      this.jumpInProgress = true;
    }

    if (this.jumpInProgress && !this.falling) {
      if (
        this.y > this.canvas.height - this.minJumpHeight  ||
        (this.y > this.canvas.height - this.maxJumpHeight && this.jumpPressed)
      ) {
        this.y -= this.JUMP_SPEED * frameTimeDelta * this.scaleRatio;
      } else {
        this.falling = true;
      }
    } else {
      if (this.y < this.yStandingPosition) { //if still falling
        this.y += this.GRAVITY * frameTimeDelta * this.scaleRatio;
        //make sure player isn't falling through the ground
        if (this.y + this.height > this.canvas.height) {
          this.y = this.yStandingPosition;
        } 
          
      } else {
        this.falling = false;
        this.jumpInProgress = false;
      }
    }
  }
  

  run(gameSpeed, frameTimeDelta) {
    if(this.walkAnimationTimer <= 0) {
      if (this.image === this.duckRunImages[0]) {
        this.image = this.duckRunImages[1]
      } else { 
        this.image = this.duckRunImages[0];
      }
      this.walkAnimationTimer = this.WALK_ANIMATION_TIMER;
    }
    //changes based on the game speed
    this.walkAnimationTimer -= frameTimeDelta * gameSpeed;
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}