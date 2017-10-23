import * as PIXI from 'pixi.js';

export default class Element extends PIXI.Container {
    constructor(data) {
        super();
        if (!data) return;
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
        if (!data) return;
        
        this.setupAnchorPoint(data.a);
        this.setupOpacity(data.o);
        this.setupPosition(data.p);
        this.setupRotation(data.r);
        this.setupScale(data.s);
    }

    setupAnchorPoint(data) {
        const anchorPoint = data.k;
        if (typeof anchorPoint[0] === 'number') {
            this.pivot = new PIXI.Point(anchorPoint[0], anchorPoint[1]);
        } else {
            this.setupAnimatedAnchorPoint(data.k);
        }
    }

    setupAnimatedAnchorPoint(data) {
        this.hasAnimatedAnchorPoint = true;
        const lastIndex = data.length - 1;
        this.animatedAnchorPoints = data.map((animData, index) => {
            return {
                name:            animData.n,
                startFrame:      animData.t,
                endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                easingFromRatio: animData.i,
                easingToRatio:   animData.o,
                fromAnchorPoint: animData.e,
                toAnchorPoint:   animData.s,
            };
        });
    }

    setupOpacity(data) {
        const opacity = data.k;
        if (typeof opacity === 'number') {
            this.alpha = opacity / 100.0;
        } else {
            this.setupAnimatedOpacity(data.k);
        }
    }

    setupAnimatedOpacity(data) {
        this.hasAnimatedOpacity = true;
        const lastIndex = data.length - 1;
        this.animatedOpacities = data.map((animData, index) => {
            return {
                name:            animData.n,
                startFrame:      animData.t,
                endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                easingFromRatio: animData.i,
                easingToRatio:   animData.o,
                fromOpacity:     animData.e / 100.0,
                toOpacity:       animData.s / 100.0,
            };
        });
    }

    setupPosition(data) {
        const pos = data.k;
        if (typeof pos[0] === 'number') {
            this.x = pos[0];
            this.y = pos[1];
        } else {
            this.setupAnimatedPosition(data.k);
        }
    }

    setupAnimatedPosition(data) {
        this.hasAnimatedPosition = true;
        const lastIndex = data.length - 1;
        this.animatedPositions = data.map((animData, index) => {
            return {
                name:            animData.n,
                startFrame:      animData.t,
                endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                easingFromRatio: animData.i,
                easingToRatio:   animData.o,
                fromPosition:    animData.e,
                toPosition:      animData.s,
            };
        });
    }

    setupRotation(data) {
        const rotation = data.k;
        if (typeof rotation === 'number') {
            this.rotation =  Math.PI * rotation / 180.0;
        } else {
            this.setupAnimatedRotation(data.k);
        }
    }

    setupAnimatedRotation(data) {
        this.hasAnimatedRotation = true;
        const lastIndex = data.length - 1;
        this.animatedRotations = data.map((animData, index) => {
            return {
                name:            animData.n,
                startFrame:      animData.t,
                endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                easingFromRatio: animData.i,
                easingToRatio:   animData.o,
                fromRotation:    Math.PI * animData.e / 180.0,
                toRotation:      Math.PI * animData.s / 180.0,
            };
        });
    }

    setupScale(data) {
        const scale = data.k;
        if (typeof scale[0] === 'number') {
            this.scaleX = scale[0] / 100.0;
            this.scaleY = scale[1] / 100.0;
            this.scale  = new PIXI.Point(this.scaleX, this.scaleY);
        } else {
            this.setupAnimatedScale(data.k);
        }
    }

    setupAnimatedScale(data) {
        this.hasAnimatedScale = true;
        const lastIndex = data.length - 1;
        this.animatedScales = data.map((animData, index) => {
            return {
                name:            animData.n,
                startFrame:      animData.t,
                endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                easingFromRatio: animData.i,
                easingToRatio:   animData.o,
                fromScale:       animData.e,
                toScale:         animData.s,
            };
        });
    }

    animateAnchorPoint(frame) {
        this.animatedAnchorPoints.forEach((animData) => {
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                const anchorPoint = animData.fromAnchorPoint;
                this.pivot = new PIXI.Point(anchorPoint[0], anchorPoint[1]);
            }
        });
    }

    animateOpacity(frame) {
        this.animatedOpacities.forEach((animData) => {
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                const opacity = animData.fromOpacity;
                this.alpha    = opacity;
            }
        });
    }

    animatePosition(frame) {
        this.animatedPositions.forEach((animData) => {
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                const pos = animData.fromPosition;
                this.x    = pos[0];
                this.y    = pos[1];
            }
        });
    }

    animateRotation(frame) {
        this.animatedRotations.forEach((animData) => {
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                const rotation = animData.fromRotation;
                this.rotation  = rotation;
            }
        });
    }

    animateScale(frame) {
        this.animatedScales.forEach((animData) => {
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                const scale = animData.fromScale;
                this.scaleX = scale[0] / 100.0;
                this.scaleY = scale[1] / 100.0;
                this.scale  = new PIXI.Point(this.scaleX, this.scaleY);
            }
        });
    }

    update(frame) {
        if (this.inFrame <= frame && frame <= this.outFrame) {
            this.alpha = 1;
            if (this.hasAnimatedAnchorPoint) {
                this.animateAnchorPoint(frame);
            }
            if (this.hasAnimatedOpacity) {
                this.animateOpacity(frame);
            }
            if (this.hasAnimatedPosition) {
                this.animatePosition(frame);
            }
            if (this.hasAnimatedRotation) {
                this.animateRotation(frame);
            }
            if (this.hasAnimatedScale) {
                this.animateScale(frame);
            }
        } else {
            this.alpha = 0;
        }
    }
}
