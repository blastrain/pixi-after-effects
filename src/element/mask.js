import * as PIXI from 'pixi.js';
import { ShapeElement } from './shape';

const MASK_MODE = {
  NONE:       0,
  ADDITIVE:   1,
  SUBTRACT:   2,
  LIGHTEN:    3,
  DARKEN:     4,
  DIFFERENCE: 5,
};

export default class MaskElement extends ShapeElement {
  constructor(maskTargetLayer) {
    super();
    this.maskShapePaths = maskTargetLayer.masksProperties.map((maskProperty) => {
      return this.createPath(maskProperty.pt.k);
    });
    const data = maskTargetLayer.masksProperties[0];
    this.isMaskLayer = true;
    this.maskTargetLayer = maskTargetLayer;
    this.isClosed   = data.cl;
    this.isInvertedMask = data.inv;
    this.maskMode   = this.toMaskMode(data.mode);
    this.setBlendModeByMaskMode(this.maskMode);
    this.inFrame    = maskTargetLayer.inFrame;
    this.outFrame   = maskTargetLayer.outFrame;
    this.setupOpacity(data.o);
    this.fillColorHex = '0x000000';
    this.fill = { enabled: true };
  }

  static setBlendModeByMaskMode(mode) {
    switch (mode) {
    case MASK_MODE.ADDITIVE:
      this.blendMode = PIXI.BLEND_MODES.ADD;
      break;
    case MASK_MODE.SUBTRACT:
      // no match into PIXI.BLEND_MODES
      break;
    case MASK_MODE.LIGHTEN:
      this.blendMode = PIXI.BLEND_MODES.LIGHTEN;
      break;
    case MASK_MODE.DARKEN:
      this.blendMode = PIXI.BLEND_MODES.DARKEN;
      break;
    case MASK_MODE.DEFFERENCE:
      this.blendMode = PIXI.BLEND_MODES.DEFFERENCE;
      break;
    default:
      break;
    }
  }

  static toMaskMode(mode) {
    let maskMode = MASK_MODE.ADDITIVE;
    switch (mode) {
    case 'n':
      maskMode = MASK_MODE.NONE;
      break;
    case 'a':
      maskMode = MASK_MODE.ADDITIVE;
      break;
    case 's':
      maskMode = MASK_MODE.SUBTRACT;
      break;
    case 'l':
      maskMode = MASK_MODE.LIGHTEN;
      break;
    case 'd':
      maskMode = MASK_MODE.DARKEN;
      break;
    case 'f':
      maskMode = MASK_MODE.DIFFERENCE;
      break;
    default:
      break;
    }
    return maskMode;
  }

  updateAnimationFrameByBaseFrame(animBaseFrame) {
    super.updateAnimationFrameByBaseFrame(animBaseFrame);
    if (!this.maskShapePaths) return;
    this.maskShapePaths.forEach((shapePath) => {
      if (!shapePath.hasAnimatedPath) return;
      shapePath.paths.forEach((animData) => {
        animData.startFrame += animBaseFrame;
        animData.endFrame   += animBaseFrame;
      });
    });
  }

  drawMask(frame, shapePath) {
    let drawnMask   = false;
    if (shapePath.hasAnimatedPath) {
      this.isClosed = shapePath.isClosed;
      const paths     = shapePath.paths;
      if (frame < shapePath.paths[0].startFrame) {
        this.drawPath(shapePath.paths[0].fromPath);
        if (this.isInvertedMask) this.addHole();
        drawnMask = true;
      }
      shapePath.paths.some((animData) => {
        if (animData.startFrame === animData.endFrame) {
          return false;
        }
        if (animData.startFrame <= frame && frame <= animData.endFrame) {
          if (!animData.fromPath) return false;
          const animatePath = this.createAnimatePath(animData, frame);
          this.drawPath(animatePath);
          if (this.isInvertedMask) {
            this.addHole();
          }
          drawnMask = true;
          return true;
        }
        return false;
      });
      const lastPath = paths[paths.length - 2];
      if (lastPath.endFrame <= frame) {
        this.drawPath(lastPath.toPath);
        if (this.isInvertedMask) this.addHole();
        drawnMask = true;
      }
    } else if (this.inFrame <= frame && frame <= this.outFrame) {
      this.isClosed = shapePath.isClosed;

      this.drawPath(shapePath);
      if (this.isInvertedMask) {
        this.addHole();
      }
      drawnMask = true;
    }
    return drawnMask;
  }

  setupScreenSize() {
    const ae = this.root();
    this.screenWidth  = ae.width;
    this.screenHeight = ae.height;
  }

  drawAllMask(frame) {
    let drawnMask   = false;
    if (this.inFrame <= frame && frame <= this.outFrame && this.isInvertedMask) {
      if (!this.screenWidth || !this.screenHeight) {
        this.setupScreenSize();
      }
      this.beforeDraw();
      const x = -this.screenWidth  / 2;
      const y = -this.screenHeight / 2;
      const w = this.screenWidth  * 2;
      const h = this.screenHeight * 2;
      this.moveTo(x, y);
      this.lineTo(x + w, y);
      this.lineTo(x + w, y + h);
      this.lineTo(x, y + h);
      this.afterDraw();
      drawnMask = true;
    }
    this.maskShapePaths.forEach((shapePath) => {
      if (this.drawMask(frame, shapePath)) {
        drawnMask = true;
      }
    });
    return drawnMask;
  }

  __updateWithFrame(frame) {
    if (this.maskMode === MASK_MODE.NONE) return false;
    this.clear();
    return this.drawAllMask(frame);
  }
}
