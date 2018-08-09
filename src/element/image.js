import * as PIXI from 'pixi.js';
import Element from './element';

export default class ImageElement extends Element {
  constructor(data) {
    super(data);
    if (data.bmPIXI) {
      this.blendMode = data.bmPIXI;
    }
    if (data.image) {
      this.image = data.image;
      if (this.blendMode !== PIXI.BLEND_MODES.NORMAL) {
        this.image.blendMode = this.blendMode;
      }
      this.addChild(this.image);
    }
  }

  setupImage(assetMap) {
    if (this.image) return;
    if (!this.referenceId) return;

    const asset = assetMap[this.referenceId];
    if (!asset) return;

    if (asset.blendMode) {
      this.blendMode = asset.blendMode;
    }
    this.image = new PIXI.Sprite(asset.texture);
    this.image.blendMode = this.blendMode;
    this.addChild(this.image);
  }
}
