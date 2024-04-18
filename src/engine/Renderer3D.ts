import {
    PerspectiveCamera,
    WebGLRenderer,
    Scene,
    HemisphereLight,
    DirectionalLight,
    Color,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
    Fog,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const rendererParam = { antialias: true, alpha: true };

const defaultCameraLocation = {
    x: -2,
    y: 4,
    z: 6,
};
export class Renderer3D {
    protected camera: PerspectiveCamera;

    protected parent: HTMLDivElement;

    protected renderer: WebGLRenderer;

    private loader = new GLTFLoader();

    private controls: OrbitControls;

    width = 0;

    height = 0;

    protected wrappedScene = new Scene();

    private modelLoaded = false;

    constructor(params: { div: HTMLDivElement }) {
        const divEle = params.div;
        this.renderer = new WebGLRenderer(rendererParam);
        this.renderer.shadowMap.enabled = true;
        this.parent = divEle;
        this.parent.appendChild(this.renderer.domElement);
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        const width = divEle.clientWidth;
        const height = divEle.clientHeight;
        const radio = width / height;
        this.camera = new PerspectiveCamera(15, radio, 0.1, 2000);
        this.camera.position.set(defaultCameraLocation.x, defaultCameraLocation.y, defaultCameraLocation.z);
        this.resize(width, height);
        this.wrappedScene.background = new Color(0xa0a0a0);
        this.wrappedScene.fog = new Fog(0xa0a0a0, 10, 50);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.enablePan = false;
        // this.controls.enableZoom = false;
        this.controls.target.set(0, 1, 0);
        this.controls.update();
        const hemiLight = new HemisphereLight(0xffffff, 0x8d8d8d, 3);
        hemiLight.position.set(0, 20, 0);
        this.wrappedScene.add(hemiLight);
        const dirLight = new DirectionalLight(0xffffff, 3);
        dirLight.position.set(3, 10, 10);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 2;
        dirLight.shadow.camera.bottom = -2;
        dirLight.shadow.camera.left = -2;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40;
        this.wrappedScene.add(dirLight);

        // ground

        const mesh = new Mesh(
            new PlaneGeometry(100, 100),
            new MeshPhongMaterial({ color: '#ffd8b1', depthWrite: false }),
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        this.wrappedScene.add(mesh);
    }

    public resize(width: number, height: number, resizeRenderer = true): void {
        if (!this.camera || !this.renderer) {
            throw Error('Not initialized.');
        }
        this.width = width;
        this.height = height;
        const aspect = width / height;
        if (this.camera instanceof PerspectiveCamera) {
            this.camera.aspect = aspect;
        }
        this.camera.updateProjectionMatrix();
        if (resizeRenderer) {
            this.renderer.setSize(width, height);
        }
    }

    public loadModel() {
        const _self = this;
        this.loader.load('/Xbot.glb', function (gltf) {
            _self.modelLoaded = true;
            const model = gltf.scene;
            _self.wrappedScene.add(model);
            model.traverse(function (object) {
                if ((object as Mesh).isMesh) object.castShadow = true;
            });
            console.log(model);
        });
    }

    public render() {
        if (this.modelLoaded) this.renderer.render(this.wrappedScene, this.camera);
    }
}
