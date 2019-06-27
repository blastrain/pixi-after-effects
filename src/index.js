/**
 * @namespace PIXI
 */

import * as PIXI from 'pixi.js';
import AfterEffects from './AfterEffects';
import AEDataLoader from './loader';
import AEDataInterceptor from './interceptor';
import versionHelper from './versionHelper';

PIXI.AfterEffects = AfterEffects;
PIXI.AEDataLoader = AEDataLoader;
PIXI.AEDataInterceptor = AEDataInterceptor;
