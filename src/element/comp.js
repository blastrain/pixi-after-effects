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

    set frameRate(value) {
        super.frameRate = value;
        if (this.masks) {
            this.masks.forEach((maskData) => {
                maskData.maskLayer.frameRate = value;
            });
        }
        if (!this.layers) {
            this.children.forEach((child) => {
                if (child instanceof Element) {
                    child.frameRate = value;
                }
            });
        } else {
            this.layers.forEach((layer) => {
                layer.frameRate = value;
            });
        }
        this.clonedLayers.forEach((layer) => {
            layer.frameRate = value;
        });
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
            maskLayer: maskLayer,
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
        if (this.blendMode !== PIXI.BLEND_MODES.NORMAL) {
            this.layers.forEach((layer) => {
                layer.blendMode = this.blendMode;
            });
        }
        this.resolveLayerReference(this.layers, asset);
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

    resolveLayerReference(layers, asset) {
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
                layer.setupReference(this.assets);
            } else if (layer.isImageType()) {
                layer.setupImage(this.assets);
            }
        });
    }

    updateMask(frame) {
        this.masks.forEach((maskData) => {
            let maskLayer = maskData.maskLayer;

            if (maskLayer.isTrackMatteData && maskLayer.maskLayer) {
                maskLayer = maskLayer.maskLayer;
            }

            let drawnMask = maskLayer.__updateWithFrame(frame);
            if (drawnMask) {
                maskData.maskTargetLayer.mask = maskLayer;
            } else {
                maskData.maskTargetLayer.mask = null;
            }
        });
    }

    __updateWithFrame(frame) {
        super.__updateWithFrame(frame);
        if (this.masks) {
            this.updateMask(frame);
        }
        if (!this.layers) {
            this.alpha = 1;
            this.children.forEach((child) => {
                if (child instanceof Element) {
                    child.__updateWithFrame(frame);
                }
            });
        } else {
            this.layers.forEach((layer) => {
                layer.__updateWithFrame(frame);
            });
        }
        this.clonedLayers.forEach((layer) => {
            layer.__updateWithFrame(frame);
            layer.visible = true;
        });
    }
}
