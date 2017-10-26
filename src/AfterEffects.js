const request = require('superagent');
import * as PIXI from 'pixi.js';
import * as element from './element';
import Asset from './asset';

export default class AfterEffects extends PIXI.Container {
    constructor(jsonPath) {
        super();
        request.get(jsonPath).end((err, res) => {
            this.setup(res.body);
        });
    }

    setup(data) {
        this.width       = data.w;
        this.height      = data.h;
        this.totalFrame  = data.op;
        this.frameRate   = data.fr;
        this.outPoint    = data.op;
        this.version     = data.v;
        this.isLoop      = false;
        this.isCompleted = false;
        this.assets      = data.assets.map((asset) => {
            return new Asset(asset);
        });
        this.layers    = data.layers.map((layer) => {
            return element.ElementFactory.create(layer);
        }).filter((layer) => { return layer !== null });
        this.layers.reverse().forEach((layer) => {
            if (layer.isCompType()) {
                layer.setupReference(this.assets);
            }
            this.addChild(layer);
        });
        console.log(data);
        console.log(this);
    }

    update(nowTime) {
        if (!this.layers) return;
        if (!this.firstTime) {
            this.firstTime = nowTime;
        }
        if (this.isCompleted) return;
        
        const elapsedTime = nowTime - this.firstTime;
        let currentFrame  = elapsedTime * this.frameRate / 1000.0;
        if (currentFrame > this.totalFrame) {
            currentFrame = this.totalFrame - 0.01;
            if (this.isLoop) {
                this.firstTime = nowTime;
            } else {
                this.isCompleted = true;
            }
        }
        this.layers.forEach((layer) => {
            layer.update(currentFrame);
        });
    }
}
