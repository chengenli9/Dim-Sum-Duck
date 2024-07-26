import Item from "./Item.js";

export default class ItemsController {
  ITEM_INTERVAL_MIN = 500;
  ITEM_INTERVAL_MAX = 1200;

  nextItemInterval = null;
  items = [];

  constructor(ctx, itemsImages, scaleRatio, speed) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.itemsImages = itemsImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;

    this.setNextItemTime();
  }

  createItem() {
    const index = this.getRandomNumber(0, this.itemsImages.length -1);
    const itemImage = this.itemsImages[index];
    const x = this.canvas.width * 1.5;
    const y = this.canvas.height - itemImage.height - 3* this.scaleRatio;
    const item = new Item(
      this.ctx,
      x,
      y,
      itemImage.width,
      itemImage.height,
      itemImage.image
    );

    this.items.push(item);
  }

  update(gameSpeed, frameTimeDelta) {
    if (this.nextItemInterval <= 0) {
      this.createItem();
      this.setNextItemTime();

    }
    this.nextItemInterval -= frameTimeDelta;

    this.items.forEach((item) => {
      item.update(this.speed, gameSpeed, frameTimeDelta, this.scaleRatio);
    })

    this.items = this.items.filter(item => item.x > -item.width);

    //console.log(this.items.length);
  }
  
  draw() {
    this.items.forEach((item) => { 
      item.draw();
    });
  }

  setNextItemTime() {
    const num = this.getRandomNumber(this.ITEM_INTERVAL_MIN, this.ITEM_INTERVAL_MAX);

    this.nextItemInterval = num;
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min +1) + min);
  }

  collideWith(sprite) {
    return this.items.some((item) => item.collideWith(sprite));
  }

  reset() {
    this.items = [];
  }
}