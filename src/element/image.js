import * as PIXI from 'pixi.js';
import Element from './element';

export default class ImageElement extends Element {
    constructor(data) {
        super(data);
        if (data.image) {
            this.image = data.image;
            this.addChild(this.image);
        }
    }

    setupImage(assets) {
        if (this.image) return;

        this.assets = assets;
        this.assetMap = {};
        assets.forEach((asset) => {
            this.assetMap[asset.id] = asset;
        });
        if (!this.referenceId) return;

        let asset = this.assetMap[this.referenceId];
        if (!asset) return;

        this.image = new PIXI.Sprite(asset.texture);
        this.addChild(this.image);
    }
}
