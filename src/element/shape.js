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
        shapePath.paths    = data.ks.k.v;
        this.shapePath     = shapePath;
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

        if (this.fill.enabled) {
            this.beginFill(this.fill.color);
        } else {
            this.lineStyle(1, this.fill.color);
        }
        if (this.shapePath.paths) {
            for (let i = 0; i < this.shapePath.paths.length; ++i) {
                if (i == 0) {
                    const moveToPath = this.shapePath.paths[i];
                    this.moveTo(moveToPath[0], moveToPath[1]);
                } else {
                    this.lineTo(this.shapePath.paths[i][0], this.shapePath.paths[i][1]);
                }
            }
        }
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
