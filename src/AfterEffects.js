import * as PIXI from 'pixi.js';
import * as element from './element';
import Asset        from './asset';
import AEDataLoader from './loader';

export default class AfterEffects extends PIXI.Container {
  constructor(jsonPath, opt) {
    super();
    this.finder = new element.ElementFinder();
    if (!jsonPath) return;
    AEDataLoader.loadJSON(jsonPath).then((data) => {
      this.setup(data, opt || {});
    }, (err) => {
      console.log(err);
    });
  }

  static fromData(data, opt) {
    const ae = new AfterEffects();
    ae.setup(data, opt || {});
    return ae;
  }

  setup(data, opt) {
    this.width     = data.w;
    this.height    = data.h;
    this.inFrame   = data.ip;
    this.outFrame  = data.op;
    this.frameRate = data.fr;
    this.version   = data.v;
    this.layers    = data.layers;
    this.textures  = data.assets.filter(asset => !!asset.texture).map(asset => asset.texture);
    this.textureCacheIds = this.textures.
      filter(texture => texture.textureCacheIds && texture.textureCacheIds.length > 0).
      map(texture => texture.textureCacheIds[0]);
    this.player    = new element.ElementPlayer(this.frameRate, this.inFrame, this.outFrame, (frame) => {
      this.updateWithFrame(frame);
    }, () => {
      this.emit('completed', this);
    });
    this.deltaPlayer = new element.ElementDeltaPlayer(this.frameRate, this.inFrame, this.outFrame, (frame) => {
      this.updateWithFrame(frame);
    }, () => {
      this.emit('completed', this);
    });
    Object.keys(opt).forEach((key) => {
      this[key] = opt[key];
    });

    let layerIndexMap = {};
    this.layers.forEach((layer) => {
      layerIndexMap[layer.index] = layer;
    });

    this.layers.reverse().forEach((layer) => {
      layer.frameRate = this.frameRate;
      layer.opt       = opt;
      if (layer.hasMask) {
        if (!this.masks) this.masks = [];

        const maskLayer = new element.MaskElement(layer);
        this.addChild(layer);
        layer.addChild(maskLayer);
        this.masks.push({
          maskTargetLayer: layer,
          maskLayer: maskLayer,
        });
      } else if (layer.hasParent) {
        const parentLayer = layerIndexMap[layer.parentIndex];
        parentLayer.addChild(layer);
      } else {
        this.addChild(layer);
      }
    });
    this.player.showFirstFrame();
    this.deltaPlayer.showFirstFrame();
  }

  find(name) {
    return this.finder.findByName(name, this);
  }

  updateMask(frame) {
    this.masks.forEach((maskData) => {
      let drawnMask = maskData.maskLayer.__updateWithFrame(frame);
      if (drawnMask) {
        maskData.maskTargetLayer.mask = maskData.maskLayer;
      } else {
        maskData.maskTargetLayer.mask = null;
      }
    });
  }

  update(nowTime) {
    if (!this.layers) return;
    this.player.update(nowTime);
    this.layers.forEach((layer) => {
      layer.update(nowTime);
    });
  }

  updateByDelta(deltaTime) {
    if (!this.layers) return;
    this.deltaPlayer.update(deltaTime);
    this.layers.forEach((layer) => {
      layer.updateByDelta(deltaTime);
    });
  }

  updateWithFrame(frame) {
    if (this.masks) {
      this.updateMask(frame);
    }
    if (this.noreplay) {
      this.layers = this.layers.filter((layer) => {
        if (layer.outFrame < frame) {
          this.removeChild(layer);
          layer.destroy();
          return false;
        }
        layer.updateWithFrame(frame);
        return true;
      });
    } else {
      this.layers.forEach((layer) => {
        layer.updateWithFrame(frame);
      });
    }
  }

  play(isLoop) {
    this.player.play(isLoop);
    this.deltaPlayer.play(isLoop);
  }

  pause() {
    this.player.pause();
    this.deltaPlayer.pause();
  }

  resume() {
    this.player.resume();
    this.deltaPlayer.resume();
  }

  stop() {
    this.player.stop();
    this.deltaPlayer.stop();
  }
}
