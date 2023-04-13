import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OCCLUSION_LAYER } from './CrepuscularEffect';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { GUI } from 'dat.gui';
import { updateShaderLightPosition } from './main';

import chandelier_black from '../models/chandelier_black/scene.gltf';
import simple_dining_table from '../models/simple_dining_table/scene.gltf';

export default class TableScene extends THREE.Scene {

    private orbitControls: OrbitControls;

    private readonly loader = new GLTFLoader();
    private defaultSunPosition = {"x": 0, "y": 22, "z": 0};
    private sunPosition;

    private sceneColors = {
        backgroundColor: "#101010",
        sunColor: "#8888ff"
    };

    private floorSettings = {
        visible: true
    }

    private sceneFolder: GUI;

    private ambientLight: THREE.AmbientLight;
    private sun: THREE.Mesh;
    private pointLight: THREE.PointLight;

    private floor: THREE.Mesh;
    private occlusionFloor: THREE.Mesh;

    constructor(){
        super();

        this.orbitControls = undefined as any as OrbitControls;

        this.sunPosition = {"x": this.defaultSunPosition.x, "y": this.defaultSunPosition.y, "z": this.defaultSunPosition.z};

        this.ambientLight = undefined as any as THREE.AmbientLight;
        this.sun = undefined as any as THREE.Mesh;
        this.pointLight = undefined as any as THREE.PointLight;

        this.floor = undefined as any as THREE.Mesh;
        this.occlusionFloor = undefined as any as THREE.Mesh;

        this.sceneFolder = undefined as any as GUI;
    }

    async initialize(camera: THREE.PerspectiveCamera, domElement: HTMLCanvasElement){

        this.background = new THREE.Color(this.sceneColors.backgroundColor);

        this.ambientLight = new THREE.AmbientLight(this.sceneColors.sunColor, 1);
        this.add(this.ambientLight);
        
        this.pointLight = new THREE.PointLight(this.sceneColors.sunColor, 1.5);
        this.pointLight.position.set(this.defaultSunPosition.x, this.defaultSunPosition.y, this.defaultSunPosition.z);
        this.add(this.pointLight);
        
        // SUN
        this.sun = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32),  new THREE.MeshBasicMaterial({color: this.sceneColors.sunColor}));
        this.sun.position.set(this.defaultSunPosition.x, this.defaultSunPosition.y, this.defaultSunPosition.z);
        this.sun.layers.set(OCCLUSION_LAYER);
        this.add(this.sun);

        // CHANDELIER
        const chandelier = await this.loader.loadAsync(chandelier_black);
        chandelier.scene.traverse(function (obj: any) {
            if (obj instanceof THREE.Mesh) {
                let material = new THREE.MeshBasicMaterial({ color: "#000000" });
                let occlusionObject = new THREE.Mesh(obj.geometry, material);
                occlusionObject.layers.set(OCCLUSION_LAYER)
                if (obj.parent != null) {
                    obj.parent.add(occlusionObject)
                }
            }
        })
        chandelier.scene.position.set(0, 20, 0);
        chandelier.scene.scale.set(0.07, 0.07, 0.07);
        this.add(chandelier.scene);
        
        // TABLE
        const table = await this.loader.loadAsync(simple_dining_table);
        table.scene.traverse(function (obj) {
            if (obj instanceof THREE.Mesh) {
                let material = new THREE.MeshBasicMaterial({ color: "#000000" });
                let occlusionObject = new THREE.Mesh(obj.geometry, material);
                occlusionObject.layers.set(OCCLUSION_LAYER)
                if (obj.parent != null) {
                    obj.parent.add(occlusionObject)
                }
            }
        })
        table.scene.position.set(0, 0, 0);
        table.scene.scale.set(0.01, 0.01, 0.01);
        this.add(table.scene);

        // FLOOR
        const floorGeometry = new THREE.BoxGeometry( 50, 50, 0.05 );
        const floorMaterial = new THREE.MeshStandardMaterial( { color: "#d0d0d0" } )
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.set(-Math.PI / 2, 0, 0);
       
        this.occlusionFloor = new THREE.Mesh(floorGeometry, new THREE.MeshBasicMaterial({ color: "#000000" }));
        this.occlusionFloor.layers.set(OCCLUSION_LAYER)
        this.occlusionFloor.rotation.set( - Math.PI / 2, 0, 0);

        this.floor.visible = this.floorSettings.visible;
        this.occlusionFloor.visible = this.floorSettings.visible;
    
        this.add(this.floor);
        this.add(this.occlusionFloor);
        
        console.log("3D models loaded successfully");

        this.initControls(camera, domElement);
        console.log("Controls initialized successfully");

        this.initCamera(camera);
        console.log("Camera initialized successfully");
        
    }

    private initControls(camera: THREE.PerspectiveCamera, domElement: HTMLCanvasElement){
        this.orbitControls = new OrbitControls(camera, domElement);
        this.orbitControls.target.set(0, 10, 0);

        this.orbitControls.addEventListener("change", () => {
            updateShaderLightPosition(new THREE.Vector3(this.sunPosition.x, this.sunPosition.y, this.sunPosition.z));
        });

    }

    private initCamera(camera: THREE.PerspectiveCamera){
        camera.position.set(0, 20, 40);
        camera.lookAt(0,10,0);
    }


    update() {
        updateShaderLightPosition(new THREE.Vector3(this.sunPosition.x, this.sunPosition.y, this.sunPosition.z));
    }

    addGUIControllers(gui: GUI){
        this.sceneFolder = gui.addFolder("Scene Settings");

        this.sceneFolder.add(this.floorSettings, "visible").name("Show Floor").onChange(
            (value: boolean) => {
                this.floor.visible = value;
                this.occlusionFloor.visible = value;
            }
        )

        this.sceneFolder.add(this as Record<string, unknown>, "resetDefaultColors").name("Reset Colors");

        this.sceneFolder.addColor(this.sceneColors, "sunColor").name("Sun Color").onChange(
            (value: string) => {
                this.ambientLight.color.set(value);
                this.pointLight.color.set(value);
                this.sun.material = new THREE.MeshBasicMaterial({color: value});
            }
        );

        this.sceneFolder.addColor(this.sceneColors, "backgroundColor").name("Background Color").onChange(
            (value: string) => {
                this.background = new THREE.Color(value);
            }
        );

    }

    resetDefaultColors(){
        this.sceneColors.backgroundColor = "#101010";
        this.sceneColors.sunColor = "#8888ff";

        this.ambientLight.color.set(this.sceneColors.sunColor);
        this.pointLight.color.set(this.sceneColors.sunColor);
        this.sun.material = new THREE.MeshBasicMaterial({color: this.sceneColors.sunColor});

        this.background = new THREE.Color(this.sceneColors.backgroundColor);

        this.sceneFolder.updateDisplay();
    }

    cleanUp(gui: GUI){
        this.orbitControls.dispose();
        gui.removeFolder(this.sceneFolder);
    }

}