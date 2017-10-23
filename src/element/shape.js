import * as PIXI from 'pixi.js';
import Element from './element';

export class Shape extends PIXI.Graphics {
    constructor(data, inFrame, outFrame) {
        super();
        if (!data) return;
        this.name   = data.nm;
        this.type   = data.ty;
        this.inFrame  = inFrame;
        this.outFrame = outFrame;
        this.setupByDefinition(data.it);
        this.drawThis();
    }

    setupByDefinition(data) {
        data.forEach((def) => {
            switch (def.ty) {
            case "sh":
                this.setupPath(def);
                break;
            case "fl":
                this.setupFill(def);
                break;
            case "tr":
                this.setupTransform(def);
                break;
            default:
                break;
            }
        });
    }

    setupPath(data) {
        if (!this.shapePaths) this.shapePaths = [];
        let shapePath = {};
        shapePath.isClosed = data.closed;
        shapePath.name     = data.nm;
        shapePath.path     = this.createPath(data.ks.k);
        this.shapePaths.push(shapePath);
    }

    createPathByAnimation(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
            return {
                name:            animData.n,
                startFrame:      animData.t,
                endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                easingFromRatio: animData.i,
                easingToRatio:   animData.o,
                fromPath:        animData.e ? this.createPath(animData.e[0]) : null,
                toPath:          animData.s ? this.createPath(animData.s[0]) : null,
            };
        });
    }

    createPath(data) {
        if (!data.v) return this.createPathByAnimation(data);
        let path = {};
        data.v.forEach((_v, index) => {
            data.i[index][0] += data.v[index][0];
            data.i[index][1] += data.v[index][1];
            data.o[index][0] += data.v[index][0];
            data.o[index][1] += data.v[index][1];
            if (index == 0) return;
            const cp  = data.o[index - 1];
            const cp2 = data.i[index];
            const to  = data.v[index];
            if (index == 1) {
                path.moveTo = new PIXI.Point(data.v[0][0], data.v[0][1]);
            }
            if (!path.bezierCurveToPaths) path.bezierCurveToPaths = [];
            path.bezierCurveToPaths.push({
                cp:  new PIXI.Point(cp[0], cp[1]),
                cp2: new PIXI.Point(cp2[0], cp2[1]),
                to:  new PIXI.Point(to[0], to[1])
            });
        });
        path.bezierCurveToPaths.push({
            cp:  new PIXI.Point(data.o[data.v.length - 1][0], data.o[data.v.length - 1][1]),
            cp2: new PIXI.Point(data.i[0][0], data.i[0][1]),
            to:  new PIXI.Point(data.v[0][0], data.v[0][1])
        });
        return path;
    }

    setupFill(data) {
        let fill    = {};
        const color = data.c.k;
        if (color && typeof color[0] === 'number') {
            const hex  = this.rgbToHex(color[0], color[1], color[2]);
            fill.color = hex;
        }
        fill.enabled = data.fillEnabled;
        fill.name    = data.nm;
        fill.opacity = data.o.k;
        this.fill    = fill;
    }

    //TODO: refactor setupTransform (reason: same methods are implemented by Element class)
    setupTransform(data) {
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

    toHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r, g, b) {
        return "0x" + this.toHex(r) + this.toHex(g) + this.toHex(b);
    }

    drawPathForMask(shapePath) {
        const moveTo = shapePath.moveTo;
        this.moveTo(moveTo.x, moveTo.y);
        shapePath.bezierCurveToPaths.forEach((path) => {
            this.bezierCurveTo(path.cp.x, path.cp.y, path.cp2.x, path.cp2.y, path.to.x, path.to.y);
        });
        this.closePath();
    }

    drawPath(shapePath) {
        if (this.fill.enabled) {
            this.beginFill(this.fill.color);
        } else {
            this.lineStyle(1, this.fill.color);
        }
        this.moveTo(shapePath.moveTo.x, shapePath.moveTo.y);
        shapePath.bezierCurveToPaths.forEach((path) => {
            this.bezierCurveTo(path.cp.x, path.cp.y, path.cp2.x, path.cp2.y, path.to.x, path.to.y);
        });
        if (this.isClosed) {
            if (this.fill.enabled) {
                this.endFill();
            } else {
                this.closePath();
            }
        }
    }

    drawThis() {
        if (!this.fill) return;
        if (!this.shapePaths || this.shapePaths.length == 0) return;
        if (!this.shapePaths[0].path) return;
        if (this.shapePaths[0].path[0]) {
            const animPath = this.shapePaths[0].path[0];
            this.drawPath(animPath.fromPath);
            return;
        }
        this.shapePaths.forEach((shapePath) => {
            this.drawPath(shapePath.path);
        });
    }
}

export default class ShapeElement extends Element {
    constructor(data) {
        super(data);
        this.setupBounds(data.bounds);
        this.shapes = data.shapes.map((shape) => {
            return new Shape(shape, this.inFrame, this.outFrame);
        });
        this.shapes.forEach((shape) => {
            this.addChild(shape);
        });
    }

    setupBounds(data) {
        let bounds = {};
        bounds.top    = data.t;
        bounds.bottom = data.b;
        bounds.left   = data.l;
        bounds.right  = data.r;
        this.w        = data.r - data.l;
        this.h        = data.b - data.t;
        this.bounds   = bounds;
    }
/*
    update(frame) {
        this.shapes.forEach((shape) => {
            //shape.update(frame);
        });
    }
*/
}
