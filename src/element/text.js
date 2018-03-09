import * as PIXI from 'pixi.js';
import Element from './element';

export default class TextElement extends Element {
    constructor(data) {
        super(data);
        if (data.text) {
            this.text = data.text;
            if (data.rawText) {
                this.rawText   = data.rawText;
                this.text.text = data.rawText;
            }
            this.addChild(this.text);
            return;
        }
        const properties = data.t.d.k[0].s;
        if (data.rawText) {
            properties.t = data.rawText;
        }
        this.setupText(properties);
    }

    toHex(c) {
        if (c <= 1) {
            c *= 255;
            c  = Math.floor(c);
        }
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    toFontColor(data) {
        if (data.length > 0) {
            return "0x" + this.toHex(data[0]) + this.toHex(data[1]) + this.toHex(data[2]);
        }
        return 0xFFFFFF;
    }

    setupText(data) {
        if (this.text) return;

        this.fontFamily     = data.f;
        this.fontColor      = this.toFontColor(data.fc);
        this.fontSize       = data.s;
        this.rawText        = data.t;
        this.baseLineHeight = data.lh;
        this.baseLineShift  = data.ls;
        this.tracking       = data.tr;
        this.justification  = data.j;
        this.text           = new PIXI.Text(this.rawText, {
            fontFamily: this.fontFamily,
            fontSize:   this.fontSize,
            fill:       this.fontColor,
        });
        const dh = this.baseLineHeight - this.fontSize;
        this.text.x -= this.text.width - this.tracking * this.baseLineShift;
        this.text.y -= this.text.height - dh;
        this.addChild(this.text);
    }
}
