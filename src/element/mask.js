import * as PIXI from 'pixi.js';
import Element from './element';
import {ShapeElement,ShapeContainerElement} from './shape';

export default class MaskElement extends ShapeElement {
    constructor(maskTargetLayer) {
        super();
        const data = maskTargetLayer.masksProperties[0];
        this.isMaskLayer = true;
        this.maskTargetLayer = maskTargetLayer;
        this.isClosed   = data.cl;
        this.isInverted = data.inv;
        this.mode       = data.mode;
        this.inFrame    = maskTargetLayer.inFrame;
        this.outFrame   = maskTargetLayer.outFrame;
        this.setupOpacity(data.o);
        this.shapePath  = this.createPath(data.pt.k);
        this.fillColorHex = "0x000000";
        this.fill = { enabled: true };
    }

    drawMask(frame) {
        let drawnMask   = false;
        const shapePath = this.shapePath;
        if (shapePath.hasAnimatedPath) {
            this.isClosed = shapePath.isClosed;
            let paths     = shapePath.paths;
            shapePath.paths.forEach((animData) => {
                if (animData.startFrame <= frame && frame <= animData.endFrame) {
                    if (!animData.fromPath) return;
                    const animatePath = this.createAnimatePath(animData, frame);
                    this.drawPath(animatePath);
                    drawnMask = true;
                }
            });
            let lastPath = paths[paths.length - 2];
            if (lastPath.endFrame <= frame) {
                this.drawPath(lastPath.toPath);
                drawnMask = true;
            }
        } else if (this.inFrame <= frame && frame <= this.outFrame) {
            this.isClosed = shapePath.isClosed;
            this.drawPath(shapePath);
            drawnMask = true;
        }
        return drawnMask;
    }

    __updateWithFrame(frame) {
        this.clear();
        return this.drawMask(frame);
    }
}
