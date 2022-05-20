import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.114/build/three.module.js'     
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/controls/OrbitControls.js';
import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/loaders/DRACOLoader.js'
import {CSS2DObject, CSS2DRenderer} from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/renderers/CSS2DRenderer.js'
import {EffectComposer} from 'https://cdn.jsdelivr.net/npm/three@0.140.2/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'https://cdn.jsdelivr.net/npm/three@0.140.2/examples/jsm/postprocessing/RenderPass.js'
import {GlitchPass} from 'https://cdn.jsdelivr.net/npm/three@0.140.2/examples/jsm/postprocessing/GlitchPass.js'

const composer = new EffectComposer(renderer);

function animate()
{
    requestAnimationFrame(animate)
    composer.render()
}