import { LinearFilter, RGBAFormat, WebGLRenderTarget, WebGLRenderer, PerspectiveCamera, Scene, Vector3 } from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";

import { LightScatteringShader } from './LightScatteringShader';
import { MergingShader } from './MergingShader';

import { GUI } from 'dat.gui';

const MAIN_LAYER = 0;
const OCCLUSION_LAYER = 1;

export {
    MAIN_LAYER, OCCLUSION_LAYER
}

export default class CrepuscularEffect {

    private renderTargetParameters = {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        stencilBuffer: false
    };

    public scatteringUniforms;
    private occlusionComposer;
    private sceneComposer;

    private scatteringParametersFolder: GUI;

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera){

        // Target
        let target = new WebGLRenderTarget(window.innerWidth / 2, window.innerHeight / 2, this.renderTargetParameters)

        // Occlusion Composer
        this.occlusionComposer = new EffectComposer(renderer, target);
        this.occlusionComposer.addPass(new RenderPass(scene, camera));
        
        // Scattering
        let lightScatteringPass = new ShaderPass(LightScatteringShader);
        this.scatteringUniforms = lightScatteringPass.uniforms;
        this.occlusionComposer.addPass(lightScatteringPass);
        
        // Copy Shader
        this.occlusionComposer.addPass(new ShaderPass(CopyShader));
        
        // Scene Composer
        this.sceneComposer = new EffectComposer(renderer);
        this.sceneComposer.addPass(new RenderPass(scene, camera));
        
        // Merging Pass
        let mergingPass = new ShaderPass(MergingShader);
        mergingPass.uniforms.tOcclusion.value = target.texture;
        
        this.sceneComposer.addPass(mergingPass);

        this.scatteringParametersFolder = undefined as any as GUI;

    }

    render(renderer: WebGLRenderer, camera: PerspectiveCamera, color: THREE.ColorRepresentation = "#101010"){

        camera.layers.set(OCCLUSION_LAYER);
        renderer.setClearColor(color)

        this.occlusionComposer.render();
        camera.layers.set(MAIN_LAYER);
        renderer.setClearColor("#000000")

        this.sceneComposer.render();

    }

    addGUIControllers(gui: GUI){
        this.scatteringParametersFolder = gui.addFolder("Scattering Parameters");

        this.scatteringParametersFolder.add(this.scatteringUniforms.weight, "value", 0, 1, 0.01).name('Weight');
        this.scatteringParametersFolder.add(this.scatteringUniforms.exposure, "value", 0, 0.5, 0.01).name("Exposure");
        this.scatteringParametersFolder.add(this.scatteringUniforms.decay, "value", 0.8, 1, 0.01).name("Decay");
        this.scatteringParametersFolder.add(this.scatteringUniforms.density, "value", 0, 1, 0.01).name("Density");
        this.scatteringParametersFolder.add(this.scatteringUniforms.n_samples, "value", 0, 200, 1).name("Samples");

        this.scatteringParametersFolder.add(this as Record<string, unknown>, "resetDefaults").name("Reset Default");
        
    }

    cleanUp(gui: GUI){
        gui.removeFolder(this.scatteringParametersFolder);
    }

    updateShaderLightPosition(camera: PerspectiveCamera, newPos: Vector3) {
        
        let screenPosition = newPos.project(camera);
        let newX = 0.5 * (screenPosition.x + 1);
        let newY = 0.5 * (screenPosition.y + 1);
       
        this.scatteringUniforms.lightPos.value.set(newX, newY);
    }

    resetDefaults(){
        this.scatteringUniforms.exposure.value = 0.05;
        this.scatteringUniforms.decay.value = 0.99;
        this.scatteringUniforms.density.value = 0.8;
        this.scatteringUniforms.weight.value = 0.8;
        this.scatteringUniforms.n_samples.value = 150;

        this.scatteringParametersFolder.updateDisplay();

    }
}