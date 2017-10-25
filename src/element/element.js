import * as PIXI from 'pixi.js';

export default class Element extends PIXI.Graphics {
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

        this.setupPosition(data.p);
        this.setupAnchorPoint(data.a);
        this.setupOpacity(data.o);
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
                fromAnchorPoint: animData.s,
                toAnchorPoint:   animData.e,
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
                fromOpacity:     animData.s / 100.0,
                toOpacity:       animData.e / 100.0,
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
                fromPosition:    animData.s,
                toPosition:      animData.e,
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
                fromRotation:    Math.PI * animData.s / 180.0,
                toRotation:      Math.PI * animData.e / 180.0,
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
                fromScale:       animData.s,
                toScale:         animData.e,
            };
        });
    }

    animateAnchorPoint(frame) {
        let isAnimated = false;
        this.animatedAnchorPoints.forEach((animData) => {
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                const anchorPointDiffX = animData.toAnchorPoint[0] - animData.fromAnchorPoint[0];
                const anchorPointDiffY = animData.toAnchorPoint[1] - animData.fromAnchorPoint[1];
                const frameDiff        = animData.endFrame - animData.startFrame;
                const playFrame        = frame - animData.startFrame;
                const perFrameAnchorPointX = anchorPointDiffX / frameDiff;
                const perFrameAnchorPointY = anchorPointDiffY / frameDiff;
                const anchorPointX = playFrame * perFrameAnchorPointX + animData.fromAnchorPoint[0];
                const anchorPointY = playFrame * perFrameAnchorPointY + animData.fromAnchorPoint[1];
                this.pivot = new PIXI.Point(anchorPointX, anchorPoinY);
                isAnimated = true;
            }
        });
        return isAnimated;
    }

    animateOpacity(frame) {
        let isAnimated = false;
        this.animatedOpacities.forEach((animData) => {
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                const opacityDiff = animData.toOpacity - animData.fromOpacity;
                const frameDiff   = animData.endFrame - animData.startFrame;
                const playFrame   = frame - animData.startFrame;
                const perFrameOpacity = 1.0 * opacityDiff / frameDiff;
                const opacity         = playFrame * perFrameOpacity + animData.fromOpacity;
                this.alpha = opacity;
                isAnimated = true;
            }
        });
        return isAnimated;
    }

    animatePosition(frame) {
        let isAnimated = false;
        this.animatedPositions.forEach((animData) => {
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                const posDiffX     = animData.toPosition[0] - animData.fromPosition[0];
                const posDiffY     = animData.toPosition[1] - animData.fromPosition[1];
                const frameDiff    = animData.endFrame - animData.startFrame;
                const playFrame    = frame - animData.startFrame;
                const perFramePosX = 1.0 * posDiffX / frameDiff;
                const perFramePosY = 1.0 * posDiffY / frameDiff;
                const posX         = playFrame * perFramePosX;
                const posY         = playFrame * perFramePosY;
                this.x             = animData.fromPosition[0] + posX;
                this.y             = animData.fromPosition[1] + posY;
                isAnimated         = true;
            }
        });
        return isAnimated;
    }

    animateRotation(frame) {
        let isAnimated = false;
        this.animatedRotations.forEach((animData) => {
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                const rotDiff     = animData.toRotation - animData.fromRotation;
                const frameDiff   = animData.endFrame - animData.startFrame;
                const playFrame   = frame - animData.startFrame;
                const perFrameRot = 1.0 * rotDiff / frameDiff;
                const rotation    = playFrame * perFrameRot;
                this.rotation  = animData.fromRotation + rotation;
                isAnimated     = true;
            }
        });
        return isAnimated;
    }

    animateScale(frame) {
        let isAnimated = false;
        this.animatedScales.forEach((animData) => {
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                const scaleDiffX   = animData.toScale[0] - animData.fromScale[0];
                const scaleDiffY   = animData.toScale[1] - animData.fromScale[1];
                const frameDiff    = animData.endFrame - animData.startFrame;
                const playFrame    = frame - animData.startFrame;
                const perFrameScaleX = 1.0 * scaleDiffX / frameDiff;
                const perFrameScaleY = 1.0 * scaleDiffY / frameDiff;
                const scaleX         = playFrame * perFrameScaleX + animData.fromScale[0];
                const scaleY         = playFrame * perFrameScaleY + animData.fromScale[1];
                this.scaleX = scaleX / 100.0;
                this.scaleY = scaleY / 100.0;
                this.scale  = new PIXI.Point(this.scaleX, this.scaleY);
                isAnimated  = true;
            }
        });
        return isAnimated
    }

    hasAnimateProperty() {
        return this.hasAnimatedAnchorPoint ||
               this.hasAnimatedOpacity     ||
               this.hasAnimatedPosition    ||
               this.hasAnimatedRotation    ||
               this.hasAnimatedScale;
    }

    update(frame) {
        if (!this.hasAnimateProperty()) {
            return;
        }
        let isAnimated = false;
        if (this.hasAnimatedAnchorPoint && this.animateAnchorPoint(frame)) {
            isAnimated = true;
        }
        if (this.hasAnimatedOpacity && this.animateOpacity(frame)) {
            isAnimated = true;
        }
        if (this.hasAnimatedPosition && this.animatePosition(frame)) {
            isAnimated = true;
        }
        if (this.hasAnimatedRotation && this.animateRotation(frame)) {
            isAnimated = true;
        }
        if (this.hasAnimatedScale && this.animateScale(frame)) {
            isAnimated = true;
        }
        if (isAnimated) {
            if (this.alpha === 0) this.alpha = 1;
        } else {
            this.alpha = 0;
        }
    }
}
