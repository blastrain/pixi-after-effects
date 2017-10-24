import * as PIXI from 'pixi.js';
import Element from './element';

export class ShapeElement extends Element {
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
                this.setupProperties(def);
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
        return {
            hasAnimatedPath: true,
            paths: data.map((animData, index) => {
                return {
                    name:            animData.n,
                    startFrame:      animData.t,
                    endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                    easingFromRatio: animData.i,
                    easingToRatio:   animData.o,
                    fromPath:        animData.e ? this.createPath(animData.e[0]) : null,
                    toPath:          animData.s ? this.createPath(animData.s[0]) : null,
                };
            })
        };
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

    drawThis(frame) {
        if (!this.fill) return;
        if (!this.shapePaths || this.shapePaths.length == 0) return;

        this.shapePaths.forEach((shapePath) => {
            if (shapePath.path.hasAnimatedPath) {
                this.isClosed = shapePath.isClosed;
                shapePath.path.paths.forEach((animData) => {
                    if (animData.startFrame <= frame && frame <= animData.endFrame) {
                        const toPath = animData.toPath;
                        this.drawPath(toPath);
                    }
                });
            } else {
                this.isClosed = shapePath.isClosed;
                this.drawPath(shapePath.path);
            }
        });
    }

    update(frame) {
        super.update(frame);
        this.drawThis(frame);
    }
}

export default class ShapeContainerElement extends Element {
    constructor(data) {
        super(data);
        this.setupBounds(data.bounds);
        this.shapes = data.shapes.map((shape) => {
            return new ShapeElement(shape, this.inFrame, this.outFrame);
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
        this.width    = data.r - data.l;
        this.height   = data.b - data.t;
        this.bounds   = bounds;
    }

    update(frame) {
        super.update(frame);
        this.shapes.forEach((shape) => {
            shape.update(frame);
        });
    }
}
