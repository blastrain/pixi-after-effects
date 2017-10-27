import * as PIXI from 'pixi.js';
import Element from './element';

export class ShapeElement extends Element {
    constructor(data, inFrame, outFrame, stretch) {
        super();
        if (!data) return;
        this.name   = data.nm;
        this.type   = data.ty;
        this.inFrame  = inFrame;
        this.outFrame = outFrame;
        this.stretch  = stretch;
        this.setupByDefinition(data.it);
        this.drawThis(0);
        this.interactive = true;
        this.on('click', function () {
            console.log(this);
        });
    }

    setupByDefinition(data) {
        data.forEach((def) => {
            switch (def.ty) {
            case "sh":
                this.setupPath(def);
                break;
            case "st":
                this.setupStroke(def);
                break;
            case "tm":
                this.setupTrim(def);
                break;
            case "el":
                this.setupEllipse(def);
                break;
            case "fl":
                this.setupFill(def);
                break;
            case "tr":
                this.setupProperties(def);
                break;
            default:
                console.log(def);
                break;
            }
        });
        if (this.shapePaths) this.shapePaths.reverse();
    }

    setupPath(data) {
        if (!this.shapePaths) this.shapePaths = [];
        let shapePath = {};
        shapePath.isClosed = data.closed;
        shapePath.name     = data.nm;
        shapePath.path     = this.createPath(data.ks.k);
        this.shapePaths.push(shapePath);
    }

    setupStroke(data) {
        let stroke  = {};
        stroke.lineCap     = data.lc;
        stroke.lineJoin    = data.lj;
        stroke.miterLimit  = data.ml;
        stroke.opacity     = data.o.k;
        stroke.width       = data.w.k;
        stroke.color       = this.createColor(data.c);
        stroke.enabledFill = data.fillEnabled;
        this.stroke        = stroke;
    }

    setupTrim(data) {

    }

    setupEllipse(data) {
        if (!this.ellipses) this.ellipses = [];
        let ellipse = {};
        ellipse.direction = data.d;
        ellipse.position  = this.createPosition(data.p);
        ellipse.size      = this.createSize(data.s);
        if (ellipse.position.length > 0 || ellipse.size.length > 0) {
            ellipse.enabledAnimation = true;
        }
        this.ellipses.push(ellipse);
    }

    createSize(data) {
        return this.createPosition(data);
    }

    createColor(data) {
        if (typeof data.k[0] == 'number') {
            return this.rgbArrayToHex(data.k);
        } else {
            return this.createAnimatedColor(data.k);
        }
    }

    createAnimatedColor(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
            return {
                name:            animData.n,
                startFrame:      animData.t,
                endFrame:        (lastIndex > index) ? data[index + 1].t : animData.t,
                easingFromRatio: animData.i,
                easingToRatio:   animData.o,
                fromColor:       animData.s ? this.rgbArrayToHex(animData.s) : "0x000000",
                toColor:         animData.e ? this.rgbArrayToHex(animData.e) : "0x000000",
            };
        });
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
                    fromPath:        animData.s ? this.createPath(animData.s[0]) : null,
                    toPath:          animData.e ? this.createPath(animData.e[0]) : null,
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
        let fill     = {};
        fill.color   = this.createColor(data.c);
        fill.enabled = data.fillEnabled;
        fill.name    = data.nm;
        fill.opacity = this.createOpacity(data.o);
        this.fill    = fill;
    }

    rgbArrayToHex(arr) {
        return this.rgbToHex(arr[0], arr[1], arr[2]);
    }
    
    rgbToHex(r, g, b) {
        return "0x" + this.toHex(r) + this.toHex(g) + this.toHex(b);
    }

    toHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    drawPathForMask(shapePath) {
        const moveTo = shapePath.moveTo;
        this.moveTo(moveTo.x, moveTo.y);
        shapePath.bezierCurveToPaths.forEach((path) => {
            this.bezierCurveTo(path.cp.x, path.cp.y, path.cp2.x, path.cp2.y, path.to.x, path.to.y);
        });
        this.closePath();
    }

    beforeDraw() {
        if (this.stroke) {
            if (this.stroke.enabledFill) {
                this.beginFill(this.strokeColorHex);
            }
            this.lineStyle(this.stroke.width, this.strokeColorHex);
            //TODO: ignore miterLimit and lineCap and lineJoin
        } else if (this.fill) {
            if (this.fill.enabled) {
                this.beginFill(this.fillColorHex);
                //this.lineStyle(2, this.fillColor);
            } else {
                this.lineStyle(2, this.fillColorHex);
            }
        }
    }

    afterDraw() {
        if (this.isClosed) {
            if (this.stroke) {
                if (this.stroke.enabledFill) {
                    this.endFill();
                } else {
                    this.closePath();
                }
            } else if (this.fill) {
                if (this.fill.enabled) {
                    this.endFill();
                    //this.closePath();
                } else {
                    this.closePath();
                }
            }
        }
    }

    drawPath(shapePath) {
        this.beforeDraw();

        this.moveTo(shapePath.moveTo.x, shapePath.moveTo.y);
        shapePath.bezierCurveToPaths.forEach((path) => {
            this.bezierCurveTo(path.cp.x, path.cp.y, path.cp2.x, path.cp2.y, path.to.x, path.to.y);
        });

        this.afterDraw();
    }

    createAnimatePos(animData, frame, fromPos, toPos) {
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame  = frame - animData.startFrame;
        const posDiffX   = toPos.x - fromPos.x;
        const posDiffY   = toPos.y - fromPos.y;
        const posX       = 1.0 * playFrame * posDiffX / totalFrame + fromPos.x;
        const posY       = 1.0 * playFrame * posDiffY / totalFrame + fromPos.y;
        return new PIXI.Point(posX, posY);
    }

    createAnimatePath(animData, frame) {
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame  = frame - animData.startFrame;
        const fromPath   = animData.fromPath;
        const toPath     = animData.toPath;
        return {
            moveTo: this.createAnimatePos(animData, frame, fromPath.moveTo, toPath.moveTo),
            bezierCurveToPaths: fromPath.bezierCurveToPaths.map((path, index) => {
                const fromBezierCurveToPath = fromPath.bezierCurveToPaths[index];
                const toBezierCurveToPath   = toPath.bezierCurveToPaths[index];
                const cp  = this.createAnimatePos(animData, frame, fromBezierCurveToPath.cp, toBezierCurveToPath.cp);
                const cp2 = this.createAnimatePos(animData, frame, fromBezierCurveToPath.cp2, toBezierCurveToPath.cp2);
                const to  = this.createAnimatePos(animData, frame, fromBezierCurveToPath.to, toBezierCurveToPath.to);
                return { cp: cp, cp2: cp2, to: to };
            })
        };
    }

    setupStrokeColor(frame) {
        if (!this.stroke) return;

        if (typeof this.stroke.color !== 'string') {
            const firstColor = this.stroke.color[0];
            if (frame < firstColor.startFrame) {
                this.strokeColorHex = firstColor.fromColor;
                return;
            }
            this.stroke.color.forEach((animData) => {
                if (animData.startFrame <= frame  && frame <= animData.endFrame) {
                    this.strokeColorHex = animData.fromColor;
                }
            });
            const lastColor = this.stroke.color[this.stroke.color.length - 2];
            if (frame > lastColor.endFrame) {
                this.strokeColorHex = lastColor.fromColor;
            }
        } else {
            this.strokeColorHex = this.stroke.color;
        }
    }

    setupFillColor(frame) {
        if (!this.fill) return;

        if (typeof this.fill.color !== 'string') {
            const firstColor = this.fill.color[0];
            if (frame < firstColor.startFrame) {
                this.fillColorHex = firstColor.fromColor;
                return;
            }
            this.fill.color.forEach((animData) => {
                if (animData.startFrame <= frame  && frame <= animData.endFrame) {
                    this.fillColorHex = animData.fromColor;
                }
            });
            const lastColor = this.fill.color[this.fill.color.length - 2];
            if (frame > lastColor.endFrame) {
                this.fillColorHex = lastColor.toColor;
            }
        } else {
            this.fillColorHex = this.fill.color;
        }
    }

    createEllipsePosition(frame, ellipse) {
        if (ellipse.position.length > 0) {
            let pos = null;
            ellipse.position.forEach((animData) => {
                if (animData.startFrame <= frame  && frame <= animData.endFrame) {
                    const posDiffX     = animData.toPosition[0] - animData.fromPosition[0];
                    const posDiffY     = animData.toPosition[1] - animData.fromPosition[1];
                    const frameDiff    = animData.endFrame - animData.startFrame;
                    const playFrame    = frame - animData.startFrame;
                    const perFramePosX = 1.0 * posDiffX / frameDiff;
                    const perFramePosY = 1.0 * posDiffY / frameDiff;
                    const posX         = playFrame * perFramePosX;
                    const posY         = playFrame * perFramePosY;
                    pos = new PIXI.Point(animData.fromPosition[0] + posX, animData.fromPosition[1] + posY);
                }
            });
            const lastPos = ellipse.position[ellipse.position.length - 2];
            if (frame > lastPos.endFrame) {
                pos = lastPos.toPos;
            }
            return pos;
        }
        return ellipse.position;
    }

    createEllipseSize(frame, ellipse) {
        if (ellipse.size.length > 0) {
            let size = null;
            ellipse.size.forEach((animData) => {
                if (animData.startFrame <= frame  && frame <= animData.endFrame) {
                    const posDiffX     = animData.toPosition[0] - animData.fromPosition[0];
                    const posDiffY     = animData.toPosition[1] - animData.fromPosition[1];
                    const frameDiff    = animData.endFrame - animData.startFrame;
                    const playFrame    = frame - animData.startFrame;
                    const perFramePosX = 1.0 * posDiffX / frameDiff;
                    const perFramePosY = 1.0 * posDiffY / frameDiff;
                    const posX         = playFrame * perFramePosX;
                    const posY         = playFrame * perFramePosY;
                    size = new PIXI.Point(animData.fromPosition[0] + posX, animData.fromPosition[1] + posY);
                }
            });
            const lastSize = ellipse.size[ellipse.size.length - 2];
            if (frame > lastSize.endFrame) {
                size = lastSize.toPos;
            }
            return size;
        }
        return ellipse.size;
    }

    drawEllipseAnimation(frame, ellipse) {
        const pos  = this.createEllipsePosition(frame, ellipse);
        const size = this.createEllipseSize(frame, ellipse);
        if (!pos || !size) return;

        this.drawEllipse(pos.x, pos.y, size.x, size.y);
    }

    drawThis(frame) {
        this.clear();

        this.setupStrokeColor(frame);
        this.setupFillColor(frame);

        if (this.shapePaths) {
            this.shapePaths.forEach((shapePath, index) => {
                if (shapePath.path.hasAnimatedPath) {
                    this.isClosed = shapePath.isClosed;
                    let paths     = shapePath.path.paths;
                    shapePath.path.paths.forEach((animData) => {
                        if (animData.startFrame <= frame && frame <= animData.endFrame) {
                            if (!animData.fromPath) return;
                            const animatePath = this.createAnimatePath(animData, frame);
                            this.drawPath(animatePath);
                            if (index !== 0) {
                                this.addHole();
                            }
                        }
                    });
                    let lastPath = paths[paths.length - 2];
                    if (lastPath.endFrame <= frame) {
                        this.drawPath(lastPath.toPath);
                        if (index !== 0) {
                            this.addHole();
                        }
                    }
                } else if (this.inFrame <= frame && frame <= this.outFrame) {
                    this.isClosed = shapePath.isClosed;
                    this.drawPath(shapePath.path);
                    if (index !== 0) {
                        this.addHole();
                    }
                }
            });
        }
        
        if (this.ellipses) {
            this.beforeDraw();
            this.ellipses.forEach((ellipse) => {
                if (ellipse.enabledAnimation) {
                    this.drawEllipseAnimation(frame, ellipse);
                } else {
                    this.drawEllipse(ellipse.position.x, ellipse.position.y, ellipse.size.x, ellipse.size.y);
                }
            });
            this.afterDraw();
        }
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
            return new ShapeElement(shape, this.inFrame, this.outFrame, this.stretch);
        });
        this.shapes.forEach((shape) => {
            shape.scale = new PIXI.Point(this.scaleX, this.scaleY);
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
