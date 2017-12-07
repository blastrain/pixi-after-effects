import * as PIXI from 'pixi.js';
import AfterEffects  from '../AfterEffects';
import ElementFinder from './finder';
import ElementPlayer from './player';
import ElementDeltaPlayer from './delta_player';
import BezierEasing from 'bezier-easing';

const TRACK_MATTE_TYPE = {
    ALPHA:          1,
    ALPHA_INVERTED: 2,
    LUMA:           3,
    LUMA_INVERTED:  4,
};

export default class Element extends PIXI.Graphics {
    constructor(data) {
        super();
        this.finder = new ElementFinder();
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
        this.stretch      = data.sr || 1;
        this.startTime    = data.st;
        this.hasMask      = data.hasMask;
        this.setupProperties(data.ks);
        this.blendMode    = this.toPIXIBlendMode(data.bm);
        if (data.tt) {
            this.hasTrackMatteType = true;
            this.trackMatteType    = data.tt;
        } else if (data.td) {
            this.isTrackMatteData = true;
        }
        this.player = new ElementPlayer(0, this.outFrame, (frame) => {
            this.updateWithFrameBySelfPlayer(frame);
        }, () => {
            this.emit('completed', this);
        });
        this.deltaPlayer = new ElementDeltaPlayer(0, this.outFrame, (frame) => {
            this.updateWithFrameBySelfPlayer(frame);
        }, () => {
            this.emit('completed', this);
        });
        if (data.masksProperties) {
            this.masksProperties = data.masksProperties;
        }
        if (data.events) {
            Object.keys(data.events).forEach((eventName) => {
                if (this.isInteractiveEvent(eventName)) this.interactive = true;
                this.on(eventName, data.events[eventName]);
            });
        }
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

    __root(node) {
        if (node instanceof AfterEffects) return node;
        if (node.parent) return this.__root(node.parent);
        return null;
    }

    root() {
        return this.__root(this);
    }

    addChild(child) {
        super.addChild(child);
        if (this.isInvertedMask) {
            child.isInvertedMask = true;
        }
    }

    isInvertTrackMatteType() {
        return this.trackMatteType == TRACK_MATTE_TYPE.ALPHA_INVERTED ||
               this.trackMatteType == TRACK_MATTE_TYPE.LUMA_INVERTED;
    }

    set frameRate(value) {
        if (this.player) {
            this.player.frameRate = value;
        }
        if (this.deltaPlayer) {
            this.deltaPlayer.frameRate = value;
        }
    }

    isInteractiveEvent(eventName) {
        if (!this.interactiveEventMap) {
            const interactiveEvents = [
                'click',       'mousedown',   'mousemove',        'mouseout',
                'mouseover',   'mouseup',     'mouseupoutside',   'pointercancel',
                'pointerdown', 'pointermove', 'pointerout',       'pointerover',
                'pointertap',  'pointerup',   'pointerupoutside', 'removed',
                'rightclick',  'rightdown',   'rightup',          'rightupoutside', 'tap',
                'touchcancel', 'touchend',    'touchendoutside',  'touchmove',      'touchstart',
            ];
            this.interactiveEventMap = {};
            interactiveEvents.forEach((event) => {
                this.interactiveEventMap[event] = true;
            });
        }
        return this.interactiveEventMap[eventName];
    }

    find(name) {
        return this.finder.findByName(name, this);
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

    updateAnimationFrameByBaseFrame(animBaseFrame) {
        if (this.hasAnimatedAnchorPoint) {
            this.animatedScales.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame   += animBaseFrame;
            });
        }
        if (this.hasAnimatedOpacity) {
            this.animatedOpacities.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame   += animBaseFrame;
            });
        }
        if (this.hasAnimatedPosition) {
            this.animatedPositions.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame += animBaseFrame;
            });
        }
        if (this.hasAnimatedRotation) {
            this.animatedRotations.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame   += animBaseFrame;
            });
        }
        if (this.hasAnimatedScale) {
            this.animatedScales.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame   += animBaseFrame;
            });
        }
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
            const easing = (animData.i && animData.o) ?
                  BezierEasing(animData.o.x, animData.o.y, animData.i.x, animData.i.y) : null;
            return {
                name:            animData.n,
                startFrame:      animData.t,
                endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                easing:          easing,
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
            const easing = (animData.i && animData.o) ?
                  BezierEasing(animData.o.x[0], animData.o.y[0], animData.i.x[0], animData.i.y[0]) : null;
            return {
                name:        animData.n,
                startFrame:  animData.t,
                endFrame:    (lastIndex > index) ? data[index + 1].t : animData.t,
                easing:      easing,
                fromOpacity: (animData.s ? animData.s[0] : 0) / 100.0,
                toOpacity:   (animData.e ? animData.e[0] : 0) / 100.0,
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
            let easing = null;
            if (animData.i && animData.o) {
                if (typeof animData.i.x === 'number') {
                    easing = BezierEasing(animData.o.x, animData.o.y, animData.i.x, animData.i.y)
                } else {
                    easing = BezierEasing(animData.o.x[0], animData.o.y[0], animData.i.x[0], animData.i.y[0])
                }
            }
            return {
                name:         animData.n,
                startFrame:   animData.t,
                endFrame:     (lastIndex > index) ? data[index + 1].t : animData.t,
                easing:       easing,
                fromPosition: animData.s,
                toPosition:   animData.e,
            };
        });
    }

    setupRotation(data) {
        if (!data) return; // not 'r' property at z rotation pattern

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
            const easing = (animData.i && animData.o) ?
                  BezierEasing(animData.o.x[0], animData.o.y[0], animData.i.x[0], animData.i.y[0]) : null;
            return {
                name:         animData.n,
                startFrame:   animData.t,
                endFrame:     (lastIndex > index) ? data[index + 1].t : animData.t,
                easing:       easing,
                fromRotation: animData.s ? Math.PI * animData.s[0] / 180.0 : 0,
                toRotation:   animData.e ? Math.PI * animData.e[0] / 180.0 : 0,
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
            const easing = (animData.i && animData.o) ?
                  BezierEasing(animData.o.x[0], animData.o.y[1], animData.i.x[0], animData.i.y[1]) : null;
            return {
                name:       animData.n,
                startFrame: animData.t,
                endFrame:   (lastIndex > index) ? data[index + 1].t : animData.t,
                easing:     easing,
                fromScale:  animData.s ? animData.s : [0],
                toScale:    animData.e ? animData.e : [0],
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
                if (!animData.easing) return;
                const anchorPointDiffX = animData.toAnchorPoint[0] - animData.fromAnchorPoint[0];
                const anchorPointDiffY = animData.toAnchorPoint[1] - animData.fromAnchorPoint[1];
                const totalFrame       = animData.endFrame - animData.startFrame;
                const playFrame        = (frame - animData.startFrame) * 1.0;
                const playRatio        = playFrame / totalFrame;
                const posRatio         = animData.easing(playRatio);
                const anchorPointX = posRatio * anchorPointDiffX + animData.fromAnchorPoint[0];
                const anchorPointY = posRatio * anchorPointDiffY + animData.fromAnchorPoint[1];
                this.pivot = new PIXI.Point(anchorPointX, anchorPointY);
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
                if (!animData.easing) return;
                const opacityDiff = animData.toOpacity - animData.fromOpacity;
                const totalFrame  = animData.endFrame - animData.startFrame;
                const playFrame   = (frame - animData.startFrame) * 1.0;
                const playRatio   = playFrame / totalFrame;
                const opacityRatio = animData.easing(playRatio);
                const opacity = opacityDiff * opacityRatio + animData.fromOpacity;
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
                if (!animData.easing) return;
                const posDiffX     = animData.toPosition[0] - animData.fromPosition[0];
                const posDiffY     = animData.toPosition[1] - animData.fromPosition[1];
                const totalFrame   = animData.endFrame - animData.startFrame;
                const playFrame    = (frame - animData.startFrame) * 1.0;
                const playRatio    = playFrame / totalFrame;
                const posRatio     = animData.easing(playRatio);
                const posX         = posDiffX * posRatio;
                const posY         = posDiffY * posRatio;
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
                if (!animData.easing) return;
                const rotDiff    = animData.toRotation - animData.fromRotation;
                const totalFrame = animData.endFrame - animData.startFrame;
                const playFrame  = (frame - animData.startFrame) * 1.0;
                const playRatio  = playFrame / totalFrame;
                const rotation   = playFrame * rotDiff / totalFrame + animData.fromRotation;
                const rotRatio   = animData.easing(playRatio);
                this.rotation    = rotDiff * rotRatio + animData.fromRotation;
                isAnimated       = true;
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
                if (!animData.easing) return;
                const scaleDiffX = animData.toScale[0] - animData.fromScale[0];
                const scaleDiffY = animData.toScale[1] - animData.fromScale[1];
                const totalFrame = animData.endFrame - animData.startFrame;
                const playFrame  = (frame - animData.startFrame) * 1.0;
                const playRatio  = playFrame / totalFrame;
                const scaleRatio = animData.easing(playRatio);
                const scaleX     = scaleDiffX * scaleRatio + animData.fromScale[0];
                const scaleY     = scaleDiffY * scaleRatio + animData.fromScale[1];
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

    update(nowTime) {
        if (!this.player) return;
        this.player.update(nowTime);
    }

    updateByDelta(deltaTime) {
        if (!this.deltaPlayer) return;
        this.deltaPlayer.update(deltaTime);
    }

    // called from self player
    updateWithFrameBySelfPlayer(frame) {
        this.__updateWithFrame(frame);
    }

    // called from parent layer. if self player is playing, stop it.
    updateWithFrame(frame) {
        if (this.player && this.player.isPlaying) {
            this.player.stop();
        }
        if (this.deltaPlayer && this.deltaPlayer.isPlaying) {
            this.deltaPlayer.stop();
        }
        this.__updateWithFrame(frame);
    }

    __updateWithFrame(frame) {
        if (this.inFrame <= frame && frame <= this.outFrame) {
            this.visible = true;
        } else {
            this.visible = false;
        }
        if (!this.visible || !this.hasAnimateProperty()) {
            return true;
        }

        if (this.hasAnimatedAnchorPoint) this.animateAnchorPoint(frame);
        if (this.hasAnimatedOpacity)     this.animateOpacity(frame);
        if (this.hasAnimatedPosition)    this.animatePosition(frame);
        if (this.hasAnimatedRotation)    this.animateRotation(frame);
        if (this.hasAnimatedScale)       this.animateScale(frame);
        return true;
    }

    play(isLoop) {
        if (this.player) {
            this.player.play(isLoop);
        }
        if (this.deltaPlayer) {
            this.deltaPlayer.play(isLoop);
        }
    }

    pause() {
        if (this.player) {
            this.player.pause();
        }
        if (this.deltaPlayer) {
            this.deltaPlayer.pause();
        }
    }

    resume() {
        if (this.player) {
            this.player.resume();
        }
        if (this.deltaPlayer) {
            this.deltaPlayer.resume();
        }
    }

    stop() {
        if (this.player) {
            this.player.stop();
        }
        if (this.deltaPlayer) {
            this.deltaPlayer.stop();
        }
    }
}
