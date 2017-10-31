import * as PIXI from 'pixi.js';
import * as element from './element';
import Asset        from './asset';
import AEDataLoader from './loader';

export default class AfterEffects extends PIXI.Container {
    constructor(jsonPath) {
        super();
        this.finder = new element.ElementFinder();
        if (!jsonPath) return;
        AEDataLoader.loadJSON(jsonPath).then((data) => {
            this.setup(data);
        }, (err) => {
            console.log(err);
        });
    }

    static fromData(data) {
        const ae = new AfterEffects();
        ae.setup(data);
        return ae;
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
        this.assets      = data.assets;
        this.layers      = data.layers;
        this.layers.reverse().forEach((layer) => {
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
        this.showFirstFrame();
    }

    find(name) {
        return this.finder.findByName(name, this);
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
        if (!this.isPlaying) return;
        if (!this.layers) return;
        if (!this.firstTime) {
            this.firstTime = nowTime;
        }
        if (this.isCompleted) return;

        this.nowTime      = nowTime;
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

    showFirstFrame() {
        if (this.masks) {
            this.updateMask(0);
        }
        this.layers.forEach((layer) => {
            layer.update(0);
        });
    }

    play(isLoop) {
        this.isLoop      = isLoop || false;
        this.firstTime   = null;
        this.isCompleted = false;
        this.isPlaying   = true;
    }

    pause() {
        this.isPlaying = false;
    }

    resume() {
        const elapsedTime = this.nowTime - this.firstTime;
        const nowTime     = performance.now();
        this.firstTime = nowTime - elapsedTime;
        this.isPlaying = true;
    }

    stop() {
        this.firstTime   = null;
        this.isCompleted = true;
        this.isPlaying   = false;
        this.showFirstFrame();
    }
}
