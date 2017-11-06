import * as PIXI from 'pixi.js';
import Element from './element';

export default class SolidElement extends Element {
    constructor(data) {
        super(data);
        this.color = data.sc;
        this.sw    = data.sw;
        this.sh    = data.sh;
    }

    update(frame) {
        super.update(frame);
        this.clear();
        this.beginFill(this.color);
        this.drawRect(0, 0, this.sw, this.sh);
        this.endFill();
    }
}
