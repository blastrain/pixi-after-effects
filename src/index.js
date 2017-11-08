import * as PIXI from 'pixi.js';
import AfterEffects from './AfterEffects.js';
import AEDataLoader from './loader.js';
import AEDataInterceptor from './interceptor.js';

global.PIXI.AfterEffects = AfterEffects;
global.PIXI.AEDataLoader = AEDataLoader;
global.PIXI.AEDataInterceptor = AEDataInterceptor;
