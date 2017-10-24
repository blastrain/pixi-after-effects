import * as PIXI from 'pixi.js';
import Element from './element';
import {ShapeElement,ShapeContainerElement} from './shape';

export default class MaskElement extends Element {
    constructor(data) {
        super(data);
        this.isClosed   = data.cl;
        this.inv        = data.inv;
        this.mode       = data.mode;
        this.alpha      = data.o.k / 100.0;
        const shape     = new ShapeElement();
        const shapePath = shape.createPath(data.pt.k);
        shape.drawPathForMask(shapePath[0].fromPath);
        this.shape = shape;
    }
}
