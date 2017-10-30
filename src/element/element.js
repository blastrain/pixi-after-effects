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
        this.hasParent    = data.hasOwnProperty("parent");
        this.parentIndex  = data.parent;
        this.inFrame      = data.ip;
        this.outFrame     = data.op;
        this.sr           = data.sr || 1;
        this.stretch      = data.st;
        this.hasMask      = data.hasMask;
        this.setupProperties(data.ks);
        if (data.masksProperties) {
            this.masksProperties = data.masksProperties;
        }
    }

    isCompType() {
        return this.type === 0;
    }

    isImageType() {
        return this.type === 2;
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
        const anchorPoint = this.createAnchorPoint(data);
        if (anchorPoint.length > 0) {
            this.hasAnimatedAnchorPoint = true;
            this.animatedAnchorPoints   = anchorPoint;
        } else {
            this.pivot = anchorPoint;
        }
    }

    createAnchorPoint(data) {
        if (typeof data.k[0] === 'number') {
            return new PIXI.Point(data.k[0], data.k[1]);
        } else {
            return this.createAnimatedAnchorPoint(data.k);
        }
    }

    createAnimatedAnchorPoint(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
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
        const opacity = this.createOpacity(data);
        if (opacity.length > 0) {
            this.hasAnimatedOpacity = true;
            this.animatedOpacities  = opacity;
        } else {
            this.alpha = opacity;
        }
    }

    createOpacity(data) {
        const opacity = data.k;
        if (typeof opacity === 'number') {
            return opacity / 100.0;
        } else {
            return this.createAnimatedOpacity(data.k);
        }
    }

    createAnimatedOpacity(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
            return {
                name:            animData.n,
                startFrame:      animData.t,
                endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                easingFromRatio: animData.i,
                easingToRatio:   animData.o,
                fromOpacity:     (animData.s ? animData.s[0] : 0) / 100.0,
                toOpacity:       (animData.e ? animData.e[0] : 0) / 100.0,
            };
        });
    }

    setupPosition(data) {
        const pos = this.createPosition(data);
        if (pos.length > 0) {
            this.hasAnimatedPosition = true;
            this.animatedPositions   = pos;
        } else {
            this.position = pos;
        }
    }

    createPosition(data) {
        const pos = data.k;
        if (typeof pos[0] === 'number') {
            return new PIXI.Point(pos[0], pos[1]);
        } else {
            return this.createAnimatedPosition(data.k);
        }
    }

    createAnimatedPosition(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
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
        const rotation = this.createRotation(data);
        if (rotation.length > 0) {
            this.hasAnimatedRotation = true;
            this.animatedRotations   = rotation;
        } else {
            this.rotation = rotation;
        }
    }

    createRotation(data) {
        const rotation = data.k;
        if (typeof rotation === 'number') {
            return Math.PI * rotation / 180.0;
        } else {
            return this.createAnimatedRotation(data.k);
        }
    }

    createAnimatedRotation(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
            return {
                name:            animData.n,
                startFrame:      animData.t,
                endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                easingFromRatio: animData.i,
                easingToRatio:   animData.o,
                fromRotation:    animData.s ? Math.PI * animData.s[0] / 180.0 : 0,
                toRotation:      animData.e ? Math.PI * animData.e[0] / 180.0 : 0,
            };
        });
    }

    setupScale(data) {
        const scale = this.createScale(data);
        if (scale.length > 0) {
            this.hasAnimatedScale = true;
            this.animatedScales   = scale;
        } else {
            this.scaleX = scale.x;
            this.scaleY = scale.y;
            this.scale  = scale;
        }
    }

    createScale(data) {
        const scale = data.k;
        if (typeof scale[0] === 'number') {
            const scaleX = scale[0] / 100.0;
            const scaleY = scale[1] / 100.0;
            return new PIXI.Point(scaleX, scaleY);
        } else {
            return this.createAnimatedScale(data.k);
        }
    }

    createAnimatedScale(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
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
        if (frame < this.animatedAnchorPoints[0].startFrame) {
            const anchorPoint = this.animatedAnchorPoints[0].fromAnchorPoint;
            this.pivot = new PIXI.Point(anchorPoint[0], anchorPoint[1]);
        }
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
        if (!isAnimated && frame > this.animatedAnchorPoints[this.animatedAnchorPoints.length - 1].endFrame) {
            const anchorPoint = this.animatedAnchorPoints[this.animatedAnchorPoints.length - 2].toAnchorPoint;
            this.pivot = new PIXI.Point(anchorPoint[0], anchorPoint[1]);
        }
        return isAnimated;
    }

    animateOpacity(frame) {
        let isAnimated = false;
        if (frame < this.animatedOpacities[0].startFrame) {
            const opacity = this.animatedOpacities[0].fromOpacity;
            this.alpha    = opacity;
        }
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
        if (!isAnimated && frame > this.animatedOpacities[this.animatedOpacities.length - 1].endFrame) {
            const opacity = this.animatedOpacities[this.animatedOpacities.length - 2].toOpacity;
            this.alpha    = opacity;
        }
        return isAnimated;
    }

    animatePosition(frame) {
        let isAnimated = false;
        if (frame < this.animatedPositions[0].startFrame) {
            const position = this.animatedPositions[0].fromPosition;
            this.position  = new PIXI.Point(position[0], position[1]);
        }
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
        if (!isAnimated && frame > this.animatedPositions[this.animatedPositions.length - 1].endFrame) {
            const position = this.animatedPositions[this.animatedPositions.length - 2].toPosition;
            this.position  = new PIXI.Point(position[0], position[1]);
        }
        return isAnimated;
    }

    animateRotation(frame) {
        let isAnimated = false;
        if (frame < this.animatedRotations[0].startFrame) {
            const rotation = this.animatedRotations[0].fromRotation;
            this.rotation  = rotation;
        }
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
        if (!isAnimated && frame > this.animatedRotations[this.animatedRotations.length - 1].endFrame) {
            const rotation = this.animatedRotations[this.animatedRotations.length - 2].toRotation;
            this.rotation  = rotation;
        }
        return isAnimated;
    }

    animateScale(frame) {
        let isAnimated = false;
        if (frame < this.animatedScales[0].startFrame) {
            const scale = this.animatedScales[0].fromScale;
            this.scale  = new PIXI.Point(scale[0] / 100.0, scale[1] / 100.0);
        }
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
        if (!isAnimated && frame > this.animatedScales[this.animatedScales.length - 1].endFrame) {
            const scale = this.animatedScales[this.animatedScales.length - 2].toScale;
            this.scale  = new PIXI.Point(scale[0] / 100.0, scale[1] / 100.0);
        }
        return isAnimated
    }

    hasAnimateProperty() {
        return this.hasAnimatedAnchorPoint ||
               this.hasAnimatedOpacity     ||
               this.hasAnimatedPosition    ||
               this.hasAnimatedRotation    ||
               this.hasAnimatedScale;
    }

    hasVisibleChildren(frame, node) {
        if (!node || !node.children) return false;
        for (let i = 0; i < node.children.length; ++i) {
            const child = node.children[i];
            if (child.inFrame <= frame && frame <= child.outFrame) return true;
            if (child.inFrame - child.stretch <= frame && frame <= child.outFrame - child.stretch) return true;
            if (this.hasVisibleChildren(child)) return true;
        }
        return false;
    }

    update(frame) {
        if (this.inFrame - this.stretch <= frame && frame <= this.outFrame - this.stretch) {
            this.visible = true;
        } else if (this.inFrame <= frame && frame <= this.outFrame) {
            this.visible = true;
        } else if (this.hasVisibleChildren(frame, this)) {
            this.visible = true;
        } else {
            this.visible = false;
        }
        if (!this.visible || !this.hasAnimateProperty()) {
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
    }
}
