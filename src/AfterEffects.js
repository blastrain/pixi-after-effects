const request = require('superagent');
import * as PIXI from 'pixi.js';
import * as element from './element';
import Asset from './asset';

export default class AfterEffects extends PIXI.Container {
    constructor(jsonPath) {
        super();
        this.jsonPath = jsonPath;
        this.baseName = this.jsonPath.split('/').slice(0, -1).join('/');
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
            return new Asset(asset, this.baseName);
        });
        this.layers    = data.layers.map((layer) => {
            return element.ElementFactory.create(layer);
        }).filter((layer) => { return layer !== null });
        this.layers.reverse().forEach((layer) => {
        let layerIndexMap = {};
        layers.forEach((layer) => {
            layerIndexMap[layer.index] = layer;
        });
        layers.reverse().forEach((layer) => {
            if (layer.isCompType()) {
                layer.setupReference(this.assets);
            } else if (layer.isImageType()) {
                layer.setupImage(this.assets);
            }
            if (layer.hasMask) {
                if (!this.masks) this.masks = [];
                if (layer.isImageType()) return;
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
        this.layers = layers;
        console.log(data);
        console.log(this);
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
        if (this.masks) {
            this.updateMask(currentFrame);
        }
        this.layers.forEach((layer) => {
            layer.update(currentFrame);
        });
    }
}
