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
        this.blendMode    = this.toPIXIBlendMode(data.bm);
        this.autoOriented = data.ao;
    }

    setupReference(assets) {
        this.assets   = assets;
        this.assetMap = {};
        assets.forEach((asset) => {
            this.assetMap[asset.id] = asset;
        });
        if (!this.referenceId) return;

        let asset = this.assetMap[this.referenceId];
        if (!asset) return;

        this.layers = asset.createLayers();
        this.layers.forEach((layer) => {
            layer.inFrame   += this.startTime;
            layer.outFrame  += this.startTime;
            layer.startTime += this.startTime;
            layer.updateAnimationFrameByBaseFrame(this.startTime || 0);
        });
        this.resolveLayerReference(this.layers);
        this.layers.forEach((layer, index) => {
            if (layer.hasMask) {
                if (!this.masks) this.masks = [];
                if (layer.isImageType()) return;

                const maskLayer = new MaskElement(layer);
                this.addChild(layer);
                layer.addChild(maskLayer);
                this.masks.push({
                    maskTargetLayer: layer,
                    maskLayer: maskLayer,
                });
            } else if (!layer.hasParent) {
                this.addChild(layer);
            }
        });
    }

    resolveLayerReference(layers) {
        layers.sort((a, b) => {
            if (a.index < b.index) return -1;
            if (a.index > b.index) return 1;
            return 0;
        });
        let layerIndexMap = {};
        layers.forEach((layer) => {
            layerIndexMap[layer.index] = layer;
        });
        layers.reverse().forEach((layer) => {
            if (layer.hasParent) {
                const parentLayer = layerIndexMap[layer.parentIndex];
                parentLayer.addChild(layer);
            }
        });
        layers.forEach((layer) => {
            if (layer.isCompType()) {
                layer.setupReference(this.assets);
            } else if (layer.isImageType()) {
                layer.setupImage(this.assets);
            }
        });
    }

    toPIXIBlendMode(mode) {
        switch(mode) {
        case 0:
            return PIXI.BLEND_MODES.NORMAL;
        case 1:
            return PIXI.BLEND_MODES.MULTIPLY;
        case 2:
            return PIXI.BLEND_MODES.SCREEN;
        case 3:
            return PIXI.BLEND_MODES.OVERLAY;
        case 4:
            return PIXI.BLEND_MODES.DARKEN;
        case 5:
            return PIXI.BLEND_MODES.LIGHTEN;
        case 6:
            return PIXI.BLEND_MODES.COLOR_DODGE;
        case 7:
            return PIXI.BLEND_MODES.COLOR_BURN;
        case 8:
            return PIXI.BLEND_MODES.HARD_LIGHT;
        case 9:
            return PIXI.BLEND_MODES.SOFT_LIGHT;
        case 10:
            return PIXI.BLEND_MODES.DIFFERENCE;
        case 11:
            return PIXI.BLEND_MODES.EXCLUSION;
        case 12:
            return PIXI.BLEND_MODES.HUE;
        case 13:
            return PIXI.BLEND_MODES.SATURATION;
        case 14:
            return PIXI.BLEND_MODES.COLOR;
        case 15:
            return PIXI.BLEND_MODES.LUMINOSITY;
        }
        return PIXI.BLEND_MODES.NORMAL;
    }

    updateMask(frame) {
        this.masks.forEach((maskData) => {
            let drawnMask = maskData.maskLayer.update(frame);
            if (drawnMask) {
                maskData.maskTargetLayer.mask = maskData.maskLayer;
            } else {
                maskData.maskTargetLayer.mask = null;
            }
        });
    }

    update(frame) {
        super.update(frame);
        if (this.masks) {
            this.updateMask(frame);
        }
        if (!this.layers) {
            this.alpha = 1;
            this.children.forEach((child) => {
                child.update(frame);
            });
        } else {
            this.layers.forEach((layer) => {
                layer.update(frame);
            });
        }
    }
}
