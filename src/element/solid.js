import * as PIXI from 'pixi.js';
import Element from './element';

export default class SolidElement extends Element {
  constructor(data) {
    super(data);
    this.color = data.sc;
    this.sw    = data.sw;
    this.sh    = data.sh;
    if (this.color.startsWith("#")) {
      this.color = '0x' + this.color.substr(1);
    }
  }

  __updateWithFrame(frame) {
    super.__updateWithFrame(frame);
    this.clear();
    this.beginFill(this.color, this.opacity);
    this.drawRect(0, 0, this.sw * this.scaleX, this.sh * this.scaleY);
    this.endFill();
  }
}
