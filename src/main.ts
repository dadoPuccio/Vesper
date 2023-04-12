import './style.css';

import { WebGLRenderer, PerspectiveCamera } from 'three';
import { GUI } from 'dat.gui';

import CrepuscularEffect from './CrepuscularEffect';
import TableScene from './TableScene';
import FlyingScene from './FlyingScene';


// LOADING ANIMATION
const loadingScreen = document.getElementById('loading-screen')!;


// RENDERER
const renderer = new WebGLRenderer({
    canvas: document.getElementById('app') as HTMLCanvasElement
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// CAMERA
const mainCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500); 


// ACTIVE SCENE
var activeScene: TableScene | FlyingScene | undefined;

// CREPUSCULAR RAYS POST-PROCESSING
var crepuscolarEffect: CrepuscularEffect;


// GUI INIT
var mainGui = new GUI(); // SCENE SPECIFIC SETTINGS

const sceneGui = new GUI(); // SCENE SELECTOR
const sceneFolder = sceneGui.addFolder("Scene Selection");

const scenes = {
    "Active Scene": 0
};

sceneFolder.add(scenes, 'Active Scene', { "Table Scene": 0, "Flying Scene": 1 }).onChange(
    (value: number) => {

        loadingScreen.style.display = 'flex';

        if(activeScene != undefined){
            activeScene.cleanUp(mainGui);
            crepuscolarEffect.cleanUp(mainGui);

            activeScene = undefined;
        }

        var nextScene: TableScene | FlyingScene;

        switch ( +value ){

            case 0: 
                nextScene = new TableScene();
                break;
                
            case 1: 
                nextScene = new FlyingScene();
                break;

            default: 
                nextScene = new TableScene();
                break;
        }

        nextScene.initialize(mainCamera, renderer.domElement).then(
            () => {
                crepuscolarEffect = new CrepuscularEffect(nextScene, renderer, mainCamera);

                crepuscolarEffect.addGUIControllers(mainGui);
                nextScene.addGUIControllers(mainGui);

                activeScene = nextScene;

                loadingScreen.style.display = 'none';
            }
        );

    } 
);

// INITIAL SCENE
activeScene = new TableScene();
activeScene.initialize(mainCamera, renderer.domElement).then(
    () => {
        if(activeScene != undefined){

            crepuscolarEffect = new CrepuscularEffect(activeScene, renderer, mainCamera);

            crepuscolarEffect.addGUIControllers(mainGui);
            activeScene.addGUIControllers(mainGui);

            loadingScreen.style.display = 'none';

            animate(); // start rendering loop
        } else {
            console.error("An error has accurred!");
        }
    }
);

// RENDERING LOOP
function animate() {
    requestAnimationFrame(animate);
    if(activeScene != undefined){
        activeScene.update();
    } else {
        // console.log("Scene is loading!");
    }
}

// Allows communication from Scenes and the shader for crepuscular lights 
// (called when the sun position changes)
function updateShaderLightPosition(newPos: THREE.Vector3) {
    crepuscolarEffect.updateShaderLightPosition(mainCamera, newPos);
    crepuscolarEffect.render(renderer, mainCamera);
}

export{
    updateShaderLightPosition
}

// Responsive behavior to resize
window.addEventListener("resize", () => {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    mainCamera.aspect = window.innerWidth / window.innerHeight;
    mainCamera.updateProjectionMatrix();

    crepuscolarEffect.render(renderer, mainCamera);
});
