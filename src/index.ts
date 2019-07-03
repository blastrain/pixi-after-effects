/**
 * @namespace PIXI
 */

import { AfterEffects } from "./AfterEffects";
import { AEDataLoader } from "./loader";
import { AEDataInterceptor } from "./interceptor";

interface Window {
  PIXI: any;
}

declare var window: Window;
window.PIXI.AfterEffects = AfterEffects;
window.PIXI.AEDataLoader = AEDataLoader;
window.PIXI.AEDataInterceptor = AEDataInterceptor;
