import * as PIXI from 'pixi.js';

export default class Element extends PIXI.Container {
    constructor(data) {
        super();
        this.name         = data.nm;
        this.referenceId  = data.refId;
        this.type         = data.ty;
        this.isCompleted  = data.completed;
        this.index        = data.ind;
        this.parentIndex  = data.parent;
        this.inFrame      = data.ip;
        this.outFrame     = data.op;
        this.sr           = data.sr || 1;
        this.st           = data.st;
        this.setupProperties(data.ks);
    }

    setupProperties(data) {
        this.setupAnchorPoint(data.a);
        this.setupOpacity(data.o);
        this.setupPosition(data.p);
        this.setupRotation(data.r);
        this.setupScale(data.s);
    }

    setupAnchorPoint(data) {
        const anchorPoints = data.k;
        if (typeof anchorPoints[0] === 'number') {
            this.anchorPointX  = anchorPoints[0];
            this.anchorPointY  = anchorPoints[1];
            this.pivot         = new PIXI.Point(this.anchorPointX, this.anchorPointY);
        }
    }

    setupOpacity(data) {
        const opacity = data.k;
        if (typeof opacity == 'number') {
            this.alpha = opacity / 100.0;
        }
    }

    setupPosition(data) {
        const pos = data.k;
        if (typeof pos[0] === 'number') {
            this.x = pos[0];
            this.y = pos[1];
        } else {
            const firstPos = pos[0];
            const startPos = firstPos.e;
            this.x = startPos[0];
            this.y = startPos[1];
        }
    }

    setupRotation(data) {
        const rotation = data.k;
        if (typeof rotation == 'number') {
            this.rotation = rotation;
        }
    }

    setupScale(data) {
        const scale = data.k;
        if (typeof scale[0] === 'number') {
            this.scaleX = scale[0] / 100.0;
            this.scaleY = scale[1] / 100.0;
            this.scale  = new PIXI.Point(this.scaleX, this.scaleY);
        }
    }

    update(frame) {}
}
