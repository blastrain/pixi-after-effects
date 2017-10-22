import * as PIXI from 'pixi.js';
import Element from './element';

class Shape extends PIXI.Graphics {
    constructor(data, width, height) {
        super();
        this.name   = data.nm;
        this.width  = width;
        this.height = height;
        this.type   = data.ty;
        this.setupByDefinition(data.it);
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
        this.drawThis();
    }

    setupPath(data) {
        let shapePath = {};
        shapePath.isClosed = data.closed;
        shapePath.name     = data.nm;
        shapePath.path     = this.createPath(data.ks.k);
        this.shapePath     = shapePath;
    }

    createPath(data) {
        if (!data.v) return null;
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

    setupTransform(data) {
        this.pivot = new PIXI.Point(data.a.k[0], data.a.k[1]);
        //this.alpha = data.o.k;
        this.setupPosition(data.p);
        this.rotation = data.r.k;
        this.scale = new PIXI.Point(data.s.k[0] / 100.0, data.s.k[1] / 100.0);
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

    toHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r, g, b) {
        return "0x" + this.toHex(r) + this.toHex(g) + this.toHex(b);
    }

    drawThis() {
        if (!this.fill) return;
        if (!this.shapePath) return;
        if (!this.shapePath.path) return;

        if (this.fill.enabled) {
            this.beginFill(this.fill.color);
        } else {
            this.lineStyle(1, this.fill.color);
        }
        const moveTo = this.shapePath.path.moveTo;
        this.moveTo(moveTo.x, moveTo.y);
        this.shapePath.path.bezierCurveToPaths.forEach((path) => {
            this.bezierCurveTo(path.cp.x, path.cp.y, path.cp2.x, path.cp2.y, path.to.x, path.to.y);
        });
        if (this.fill.enabled) {
            this.endFill();
        } else {
            this.closePath();
        }
    }
}

export default class ShapeElement extends Element {
    constructor(data) {
        super(data);
        this.setupBounds(data.bounds);
        this.shapes = data.shapes.map((shape) => {
            return new Shape(shape, this.w, this.h);
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
}
