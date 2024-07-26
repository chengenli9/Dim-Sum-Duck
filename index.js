import Player from "./Player.js";
import Ground from "./Ground.js";
import ItemsController from "./ItemsController.js";
import Score from "./Score.js";

const canvas = document.getElementById('game');
const title = document.getElementById('opening-screen');
const playBtn = document.querySelector('.play-button');
const ctx = canvas.getContext("2d");

playBtn.addEventListener('click', ()=> {
  title.style.display = 'none';
  canvas.style.display = 'flex';
});


let image = document.querySelector(".title-img");
let images = ['images/duck_run1.png', 'images/duck_run2.png'];
let index = 0;

setInterval(() => {
  index = (index + 1) % images.length;
  image.src = images[index];
}, 300);







const GAME_SPEED_START = .80;
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 92 /1.5;
const PLAYER_HEIGHT = 88 /1.5;
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2342;
const GROUND_HEIGHT = 25;
const GROUND_AND_OBJECT_SPEED = 0.5;

const ITEMS_CONFIG = [
  {width: 95 /1.5 , height: 80 / 1.5, image: 'images/chashubao.png'},
  {width: 180 /1.5 , height: 75 / 1.5, image: 'images/baos2.png'},
  {width: 100 /1.5 , height: 70 / 1.5, image: 'images/eggtart1.png'},
  {width: 90 /1.5 , height: 120 / 1.5, image: 'images/tea_cup.png'},
  {width: 110/ 1.5, height: 130 / 1.5, image: 'images/takeout.png'},
  {width: 140/ 1.5, height: 70 / 1.5, image: 'images/shumai.png'},
  {width: 140/ 1.5, height: 80 / 1.5, image: 'images/doughballs.png'},
  {width: 120/ 1.5, height: 80 / 1.5, image: 'images/pineapple_bun.png'}
];

//game objects
let player = null;
let ground = null;
let score = null;
let itemsController = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;

function createSprites() {
  //for player
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  //for the ground
  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(ctx, playerWidthInGame, playerHeightInGame, minJumpHeightInGame, maxJumpHeightInGame, scaleRatio);

  ground = new Ground(ctx, groundWidthInGame, groundHeightInGame, GROUND_AND_OBJECT_SPEED, scaleRatio);

  const itemsImages = ITEMS_CONFIG.map(item => {
    const image = new Image();
    image.src = item.image;
    return {
      image: image,
      width: item.width * scaleRatio,
      height: item.height * scaleRatio,
    };
  })

  itemsController = new ItemsController(ctx, itemsImages, scaleRatio, GROUND_AND_OBJECT_SPEED);

  score = new Score(ctx, scaleRatio);

}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

setScreen();

//Safari mobile rotation
window.addEventListener('resize', () => setTimeout(setScreen, 500));

//chrome and other
if (screen.orientation) {
  screen.orientation.addEventListener('change', setScreen);
}

function getScaleRatio() {
  //get the height using the min value of both screen types
  const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);

  //get min width
  const screenWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);

  if(screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;  
  }
}

function showGameOver() {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Pixellari`;
  ctx.fillStyle = "black";
  const x = canvas.width / 4;
  const y = canvas.height / 2;
  ctx.fillText("GAME OVER", x, y);
}

function showRetry() {
  const fontSize = 15 * scaleRatio;
  ctx.font = `${fontSize}px Pixellari`;
  ctx.fillStyle = "gray";
  const x = canvas.width / 2.7;
  const y = canvas.height / 2;
  ctx.fillText("TAP or press SPACE to retry", x, y + 25*scaleRatio);
}

function setUpGameReset() {
  if(!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    setTimeout(() => {
      window.addEventListener("keyup", reset, {once:true});
      window.addEventListener("touchstart", reset, {once:true});
    }, 1000);
  }
}

function reset() {
  hasAddedEventListenersForRestart = false;
  gameOver = false;
  waitingToStart = false;
  ground.reset();
  itemsController.reset();
  score.reset();
  gameSpeed = GAME_SPEED_START;
}

function updateGameSpeed(frameTimeDelta) {
  gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
  console.log(gameSpeed);
}

function clearScreen() {
  ctx.fillStyle = "lightyellow";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}


//constant animation loop
function gameLoop(currentTime) {
  if(previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }
  //make sure everything moves at the same speed reguardless of monitor referesh rate / hardware
  const frameTimeDelta = currentTime - previousTime;
  previousTime = currentTime;
  clearScreen();

  if(!gameOver && !waitingToStart) {
    //update game objects
    ground.update(gameSpeed, frameTimeDelta);
    itemsController.update(gameSpeed, frameTimeDelta);
    player.update(gameSpeed, frameTimeDelta);
    score.update(frameTimeDelta);
    updateGameSpeed(frameTimeDelta);


  }

  if(!gameOver && itemsController.collideWith(player)) {
    gameOver = true;
    setUpGameReset();
    score.setHighScore();
  }


  //draw game objects
  ground.draw();
  itemsController.draw();
  player.draw();
  score.draw();

  if(gameOver) {
    showGameOver();
    showRetry(); 
  }

  if(waitingToStart) {
    showStartGameText();
  } 


  requestAnimationFrame(gameLoop);
}

function showStartGameText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Pixellari`;
  ctx.fillStyle = "gray";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1.5 * scaleRatio;
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText("TAP Screen or Press SPACE To Start", x, y);
}

window.addEventListener("keyup", reset, {once:true});
window.addEventListener("touchstart", reset, {once:true});

requestAnimationFrame(gameLoop);

