import * as THREE from 'three';
import * as YUKA from 'yuka';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OCCLUSION_LAYER } from './CrepuscularEffect';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

import { GUI } from 'dat.gui';
import { updateShaderLightPosition } from './main';

import heightMap from "../images/heightmap.png";

import x_wing from '../models/x_wing/scene.gltf';
import star_wars_tie_fighter from '../models/star_wars_tie_fighter/scene.gltf';

export default class FlyingScene extends THREE.Scene {

    private orbitControls: OrbitControls;
    private firstPersonControls: FirstPersonControls;

    private readonly loader = new GLTFLoader();
    private defaultSunPosition  = {"x": 0, "y": 50, "z": 0};
    private sunPosition;

    private sunColor = "#fed8b1";

    private sunPositionFolder: GUI;
    private movementFolder: GUI;

    private sun: THREE.Mesh;
    private pointLight: THREE.PointLight;

    private xwingBehavior: YUKA.FollowPathBehavior;
    private tieBehavior: YUKA.PursuitBehavior;

    private entityManager: YUKA.EntityManager;
    private time: YUKA.Time;

    private movementSettings = {
        enabled: true,
        speed: 50
    };

    private xwingVehicle: YUKA.Vehicle;
    private tieVehicle: YUKA.Vehicle;

    constructor(){
        super();

        this.orbitControls = undefined as any as OrbitControls;
        this.firstPersonControls = undefined as any as FirstPersonControls;

        this.sunPosition = {"x": this.defaultSunPosition.x, "y": this.defaultSunPosition.y, "z": this.defaultSunPosition.z};

        this.sun = undefined as any as THREE.Mesh;
        this.pointLight = undefined as any as THREE.PointLight;

        this.sunPositionFolder = undefined as any as GUI;
        this.movementFolder = undefined as any as GUI;

        this.entityManager = new YUKA.EntityManager();
        this.time = new YUKA.Time();

        this.xwingBehavior = undefined as any as YUKA.FollowPathBehavior;
        this.tieBehavior = undefined as any as YUKA.PursuitBehavior;

        this.xwingVehicle = undefined as any as YUKA.Vehicle;
        this.tieVehicle = undefined as any as YUKA.Vehicle;
    }

    async initialize(camera: THREE.PerspectiveCamera, domElement: HTMLCanvasElement){

        // this.background = new THREE.Color("#0e0806");

        const ambientLight = new THREE.AmbientLight(this.sunColor, 2);
        this.add(ambientLight);
        
        this.pointLight = new THREE.PointLight(this.sunColor, 2);
        this.pointLight.position.set(this.defaultSunPosition.x, this.defaultSunPosition.y, this.defaultSunPosition.z);
        this.add(this.pointLight);
        
        // SUN
        this.sun = new THREE.Mesh(new THREE.SphereGeometry(5, 100, 100),  new THREE.MeshBasicMaterial({color: this.sunColor}));
        this.sun.position.set(this.defaultSunPosition.x, this.defaultSunPosition.y, this.defaultSunPosition.z);
        this.sun.layers.set(OCCLUSION_LAYER);
        this.add(this.sun);
        
        // TIE FIGHTER
        const tie = await this.loader.loadAsync(star_wars_tie_fighter);
        tie.scene.traverse(function (obj) {
            if (obj instanceof THREE.Mesh) {
                let material = new THREE.MeshBasicMaterial({ color: "#000000" });
                let occlusionObject = new THREE.Mesh(obj.geometry, material);
                occlusionObject.layers.set(OCCLUSION_LAYER)
                if (obj.parent != null) {
                    obj.parent.add(occlusionObject)
                }
            }
        })
        tie.scene.matrixAutoUpdate = false;
        this.add(tie.scene);

        // X-WING
        const xwing = await this.loader.loadAsync(x_wing);
        xwing.scene.traverse(function (obj) {
            if (obj instanceof THREE.Mesh) {
                let material = new THREE.MeshBasicMaterial({ color: "#000000" });
                let occlusionObject = new THREE.Mesh(obj.geometry, material);
                occlusionObject.layers.set(OCCLUSION_LAYER)
                if (obj.parent != null) {
                    obj.parent.add(occlusionObject)
                }
            }
        })
        xwing.scene.matrixAutoUpdate = false;
        this.add(xwing.scene);

        this.initYuka(xwing, tie);
        console.log("Motion Initialized successfully");

        //MAP 
        const groundGeometry = new THREE.PlaneGeometry(500, 500, 90, 90);
        let disMap = new THREE.TextureLoader().load(heightMap);
        disMap.wrapS = disMap.wrapT = THREE.RepeatWrapping;
        disMap.repeat.set(10, 10);

        const groundMaterial = new THREE.MeshStandardMaterial(
            {
                color: "#371d10",
                // wireframe: true,
                displacementMap: disMap,
                displacementScale: 10
            }
        )

        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.set(-Math.PI / 2, 0, 0)
        this.add(groundMesh);

        const occlusionGround = new THREE.Mesh(groundGeometry, new THREE.MeshBasicMaterial({ color: "#000000" }));
        occlusionGround.layers.set(OCCLUSION_LAYER);
        occlusionGround.rotation.set( - Math.PI / 2, 0, 0);
        this.add(occlusionGround);
        
        console.log("3D model loaded successfully");

        this.initControls(camera, domElement);
        console.log("Controls initialized successfully");

        this.initCamera(camera);
        console.log("Camera initialized successfully");

        document.getElementById("info")!.style.display = "block";

    }

    private initControls(camera: THREE.PerspectiveCamera, domElement: HTMLCanvasElement){
        this.orbitControls = new OrbitControls(camera, domElement);
        this.orbitControls.maxPolarAngle = Math.PI * 11 / 24;

        
        this.orbitControls.addEventListener("change", () => {
            updateShaderLightPosition(new THREE.Vector3(this.sunPosition.x, this.sunPosition.y, this.sunPosition.z));
        });
        
        this.firstPersonControls = new FirstPersonControls(camera, domElement);
        this.firstPersonControls.enabled = false;

        domElement.addEventListener('dblclick', () => {
            if(this.orbitControls.enabled){
                this.orbitControls.enabled = false;
                this.firstPersonControls.enabled = true;
            } else {
                this.orbitControls.enabled = true;
                this.firstPersonControls.enabled = false;
                this.initCamera(camera);
            }
        });

    }

    private initCamera(camera: THREE.PerspectiveCamera){
        camera.position.set(0, 20, 100);
        camera.lookAt(0,0,0);
    }

    private sync(entity: any, renderComponent: any) {
        renderComponent.matrix.copy(entity.worldMatrix);
    }

    private initYuka(xwing: any, tie: any){
        this.xwingVehicle = new YUKA.Vehicle();
        this.xwingVehicle.setRenderComponent(xwing.scene, this.sync);
        this.xwingVehicle.maxSpeed = this.movementSettings.speed;

        this.tieVehicle = new YUKA.Vehicle();
        this.tieVehicle.setRenderComponent(tie.scene, this.sync);
        this.tieVehicle.maxSpeed = this.movementSettings.speed;

        const path = new YUKA.Path();
        
        path.add(new YUKA.Vector3(0, 10, 0));
        path.add(new YUKA.Vector3(50, 30, 100));
        path.add(new YUKA.Vector3(100, 50, 100));
        path.add(new YUKA.Vector3(100, 30, 50));

        path.add(new YUKA.Vector3(0, 30, 0));
        path.add(new YUKA.Vector3(-100, 10, -50));
        path.add(new YUKA.Vector3(-100, 20, -100));
        path.add(new YUKA.Vector3(-50, 40, -100));

        path.add(new YUKA.Vector3(0, 20, 0));
        path.add(new YUKA.Vector3(-50, 40, 100));
        path.add(new YUKA.Vector3(-100, 20, 100));
        path.add(new YUKA.Vector3(-100, 30, 50));

        path.add(new YUKA.Vector3(0, 10, 0));
        path.add(new YUKA.Vector3(100, 30, -50));
        path.add(new YUKA.Vector3(100, 50, -100));
        path.add(new YUKA.Vector3(50, 30, -100));
        
        path.add(new YUKA.Vector3(0, 10, 0));
        path.add(new YUKA.Vector3(0, 20, 70));
        path.add(new YUKA.Vector3(0, 60, 110));
        path.add(new YUKA.Vector3(0, 100, 70));
        path.add(new YUKA.Vector3(0, 60, 30));
        
        path.add(new YUKA.Vector3(-50, 40, 100));
        path.add(new YUKA.Vector3(-100, 20, 100));
        path.add(new YUKA.Vector3(-100, 30, 50));

        path.loop = true;

        this.xwingVehicle.scale.set(0.1, 0.1, 0.1);

        this.xwingVehicle.position.set(0, 20, 0);
        this.tieVehicle.position.set(-50, 20, -50);

        this.xwingBehavior = new YUKA.FollowPathBehavior(path, 20);
        this.tieBehavior = new YUKA.PursuitBehavior(this.xwingVehicle);
        this.xwingVehicle.steering.add(this.xwingBehavior);
        this.tieVehicle.steering.add(this.tieBehavior);

        this.entityManager.add(this.xwingVehicle);
        this.entityManager.add(this.tieVehicle);

    }

    update() {
        this.sun.position.set(this.sunPosition.x, this.sunPosition.y, this.sunPosition.z);
        this.pointLight.position.set(this.sunPosition.x, this.sunPosition.y, this.sunPosition.z);

        updateShaderLightPosition(new THREE.Vector3(this.sunPosition.x, this.sunPosition.y, this.sunPosition.z));

        let delta = this.time.update().getDelta();
        if(delta > 1) /* on the first call to update() delta is very large,
                         as YUKA.time object is created on the constructor, and update() is called much later */      
            delta = 0;
        this.entityManager.update(delta);

        if(this.firstPersonControls.enabled){
            this.firstPersonControls.update(1);
        } else {
            this.orbitControls.update();
        }        

    }

    addGUIControllers(gui: GUI){
        
        this.sunPositionFolder = gui.addFolder("Sun Position");

        this.sunPositionFolder.add(this.sunPosition, "x", -100, 100).name("x");
        this.sunPositionFolder.add(this.sunPosition, "y", 10, 100).name("y");
        this.sunPositionFolder.add(this.sunPosition, "z", -100, 100).name("z");

        this.sunPositionFolder.add(this as Record<string, unknown>, "resetDefaultSunPosition").name("Reset Position");

        
        this.movementFolder = gui.addFolder("Fly Settings");
        this.movementFolder.add(this.movementSettings, "enabled").name("Active").onChange(
            (value: boolean) => {
                
                this.xwingBehavior.active = value;
                this.tieBehavior.active = value;

                if(!value){
                    this.xwingVehicle.velocity = new YUKA.Vector3(0, 0, 0);
                    this.tieVehicle.velocity = new YUKA.Vector3(0, 0, 0);
                }

            }
        )
        this.movementFolder.add(this.movementSettings, "speed", 20, 70).name("Max Speed").onChange(
            (value: number) => {
                this.xwingVehicle.maxSpeed = value;
                this.tieVehicle.maxSpeed = value;
            }
        )
    }

    resetDefaultSunPosition(){
        this.sunPosition.x = this.defaultSunPosition.x;
        this.sunPosition.y = this.defaultSunPosition.y;
        this.sunPosition.z = this.defaultSunPosition.z;

        this.sunPositionFolder.updateDisplay();
    }

    cleanUp(gui: GUI){
        this.orbitControls.dispose();
        this.firstPersonControls.dispose();

        gui.removeFolder(this.sunPositionFolder);
        gui.removeFolder(this.movementFolder);

        document.getElementById("info")!.style.display = "none";
    }

}