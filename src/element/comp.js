import * as PIXI from 'pixi.js';
import Element from './element';
import MaskElement from './mask';

export default class CompElement extends Element {
  constructor(data) {
    super(data);
    if (data.w > 0 && data.h > 0) {
      this.originWidth  = data.w;
      this.originHeight = data.h;
      this.scale        = new PIXI.Point(this.scaleX, this.scaleY);
    }
    if (this.scaleX < 0) {
      // flip mode.
      // reassign scale value because overwritten scale by this.width's setter
      this.scale.x = this.scaleX;
    }
    this.clonedLayers = [];
    this.autoOriented = data.ao;
  }

  allLayers() {
    let layers = [];
    if (this.masks) {
      layers = layers.concat(this.masks.map(maskData => maskData.maskLayer));
    }
    if (!this.layers) {
      layers = layers.concat(this.children.map((child) => {
        if (child instanceof Element) {
          return child;
        }
        return null;
      }).filter(layer => layer !== null));
    } else {
      layers = layers.concat(this.layers);
    }
    return layers.concat(this.clonedLayers);
  }

  set frameRate(value) {
    super.frameRate = value;
    this.allLayers().forEach(layer => layer.frameRate = value);
  }

  set opt(value) {
    super.opt = value;
    this.allLayers().forEach(layer => layer.opt = value);
  }

  addMaskLayer(layer) {
    if (!layer.hasMask) return;

    if (!this.masks) this.masks = [];

    const maskLayer = new MaskElement(layer);
    maskLayer.updateAnimationFrameByBaseFrame(this.startTime || 0);
    layer.addChild(maskLayer);
    layer.maskLayer = maskLayer;
    this.masks.push({
      maskTargetLayer: layer,
      maskLayer,
    });
  }

  setupTrackMatteLayer(layer, trackMatteLayer) {
    trackMatteLayer.isInvertedMask = layer.isInvertTrackMatteType();
    trackMatteLayer.alpha          = 0; // none visible
    layer.maskLayer                = trackMatteLayer;
    layer.addChild(trackMatteLayer);
    if (!this.masks) this.masks = [];
    this.masks.push({
      maskTargetLayer: layer,
      maskLayer: trackMatteLayer,
    });
  }

  setupReference(assetMap) {
    if (!this.referenceId) return;

    const asset = assetMap[this.referenceId];
    if (!asset) return;

    this.layers = asset.createLayers();
    this.layers.forEach((layer) => {
      layer.inFrame   += this.startTime;
      layer.outFrame  += this.startTime;
      layer.startTime += this.startTime;
      layer.updateAnimationFrameByBaseFrame(this.startTime || 0);
    });
    if (this.blendMode !== PIXI.BLEND_MODES.NORMAL) {
      this.layers.forEach((layer) => {
        layer.blendMode = this.blendMode;
      });
    }
    this.resolveLayerReference(this.layers, assetMap, asset);
    this.layers.forEach((layer, index) => {
      if (layer.hasParent) return;

      if (layer.hasTrackMatteType) {
        const trackMatteLayer = this.layers[index + 1];
        this.setupTrackMatteLayer(layer, trackMatteLayer);
      } else {
        this.addMaskLayer(layer);
      }

      if (layer.isTrackMatteData) return;
      this.addChild(layer);
    });
    this.clonedLayers.forEach((layer) => {
      layer.inFrame   += this.startTime;
      layer.outFrame  += this.startTime;
      layer.startTime += this.startTime;
      layer.updateAnimationFrameByBaseFrame(this.startTime || 0);
      this.addChild(layer);
    });
  }

  createParentLayer(layer, asset) {
    if (!layer.hasParent) return null;

    const parentLayer = asset.createLayerByIndex(layer.parentIndex);
    if (parentLayer.shapes) {
      parentLayer.shapes.forEach((shape) => {
        const parent = shape.parent;
        if (parent) parent.removeChild(shape);
      });
      parentLayer.shapes = [];
      parentLayer.inFrame  = layer.inFrame;
      parentLayer.outFrame = layer.outFrame;
    }
    this.addMaskLayer(layer);
    parentLayer.addChild(layer);
    const nextParentLayer = this.createParentLayer(parentLayer, asset);
    if (nextParentLayer) {
      nextParentLayer.addChild(parentLayer);
      return nextParentLayer;
    }
    return parentLayer;
  }

  resolveLayerReference(layers, assetMap, asset) {
    layers.sort((a, b) => {
      if (a.index < b.index) return -1;
      if (a.index > b.index) return 1;
      return 0;
    });
    layers.reverse().forEach((layer) => {
      const parentLayer = this.createParentLayer(layer, asset);
      if (parentLayer) this.clonedLayers.push(parentLayer);
    });
    layers.forEach((layer) => {
      if (layer.isCompType()) {
        layer.setupReference(assetMap);
      } else if (layer.isImageType()) {
        layer.setupImage(assetMap);
      }
    });
  }

  updateMask(frame) {
    this.masks.forEach((maskData) => {
      let maskLayer = maskData.maskLayer;

      if (maskLayer.isTrackMatteData && maskLayer.maskLayer) {
        maskLayer = maskLayer.maskLayer;
      }

      const drawnMask = maskLayer.__updateWithFrame(frame);
      if (drawnMask) {
        maskData.maskTargetLayer.mask = maskLayer;
      } else {
        maskData.maskTargetLayer.mask = null;
      }
    });
  }

  updateNotLayers(frame) {
    this.alpha = 1;
    if (this.noreplay) {
      const children = this.children.concat();
      children.forEach((layer) => {
        if (layer instanceof Element) {
          if (layer.outFrame < frame) {
            this.removeChild(layer);
            layer.destroy();
            return;
          }
          layer.__updateWithFrame(frame);
        }
      });
      return;
    }
    this.children.forEach((layer) => {
      if (layer instanceof Element) {
        layer.__updateWithFrame(frame);
      }
    });
  }

  updateLayers(frame) {
    if (this.noreplay) {
      this.layers = this.layers.filter((layer) => {
        if (layer.outFrame < frame) {
          this.removeChild(layer);
          layer.destroy();
          return false;
        }
        layer.__updateWithFrame(frame);
        return true;
      });
      return;
    }
    this.layers.forEach((layer) => {
      layer.__updateWithFrame(frame);
    });
  }

  updateClonedLayers(frame) {
    if (this.noreplay) {
      this.clonedLayers = this.clonedLayers.filter((layer) => {
        if (layer.outFrame < frame) {
          this.removeChild(layer);
          layer.destroy();
          return false;
        }

        layer.__updateWithFrame(frame);
        layer.visible = true;
        return true;
      });
      return;
    }
    this.clonedLayers.forEach((layer) => {
      layer.__updateWithFrame(frame);
      layer.visible = true;
    });
  }

  __updateWithFrame(frame) {
    super.__updateWithFrame(frame);
    if (this.masks) {
      this.updateMask(frame);
    }
    if (!this.layers) {
      this.updateNotLayers(frame);
    } else {
      this.updateLayers(frame);
    }

    this.updateClonedLayers(frame);
  }
}
