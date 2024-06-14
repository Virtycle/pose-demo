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
    SkeletonHelper,
    Bone,
    Vector3,
    Quaternion,
    AxesHelper,
    Skeleton,
    SkinnedMesh,
    Matrix4,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Keypoint } from '@tensorflow-models/pose-detection';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { PoseDetection } from './Pose-detection';

const rendererParam = { antialias: true, alpha: true };

const _vec3 = new Vector3();
const _matrix4 = new Matrix4();
const _quater = new Quaternion();

const defaultCameraLocation = {
    x: -2,
    y: 4,
    z: 6,
};

export enum PoseToboneMap {
    'mixamorigLeftShoulder' = 11,
    'mixamorigLeftArm' = 13,
    'mixamorigLeftHand' = 15,
    'mixamorigRightShoulder' = 12,
    'mixamorigRightArm' = 14,
    'mixamorigRightHand' = 16,
    'mixamorigLeftUpLeg' = 23,
    'mixamorigLeftLeg' = 25,
    'mixamorigLeftFoot' = 27,
    'mixamorigRightUpLeg' = 24,
    'mixamorigRightLeg' = 26,
    'mixamorigRightFoot' = 28,
}

export enum PoseIndexMap {
    'left_shoulder' = 11,
    'left_elbow' = 13,
    'left_wrist' = 15,
    'right_shoulder' = 12,
    'right_elbow' = 14,
    'right_wrist' = 16,
    'left_hip' = 23,
    'left_knee' = 25,
    'left_ankle' = 27,
    'right_hip' = 24,
    'right_knee' = 26,
    'right_ankle' = 28,
}

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

    private skeleton!: Skeleton;

    private boneMap: { [key in PoseToboneMap]: { bone: Bone; vec: Vector3; originVec: Vector3; index: number } } =
        {} as {
            [key in PoseToboneMap]: { bone: Bone; vec: Vector3; originVec: Vector3; index: number };
        };

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

        const axesHelper = new AxesHelper(3);
        this.wrappedScene.add(axesHelper);
        // const matrix3 = new Matrix3().set(0, 0, 1, 1, 0, 0, 0, 1, 0).transpose();
        // const matrix4 = new Matrix4().setFromMatrix3(matrix3);
        // this.matrix.copy(matrix3);
        // const qua = new Quaternion().setFromRotationMatrix(matrix4);
        // this.quater.copy(qua);
        // console.log(qua, this.quater);
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
            const skinnedMesh = model.getObjectByName('Beta_Joints') as SkinnedMesh;
            _self.skeleton = skinnedMesh.skeleton;
            // const animations = gltf.animations;
            const helper = new SkeletonHelper(model);
            _self.wrappedScene.add(model);
            _self.wrappedScene.add(helper);
            model.traverse(function (object) {
                if ((object as Mesh).isMesh) object.castShadow = true;
            });
            const bones = _self.skeleton.bones;
            bones[0].updateWorldMatrix(true, true);
            for (let index = 0; index < bones.length; index++) {
                const bone = bones[index];
                _vec3.set(0, 0, 0);
                bone.updateMatrix();
                _vec3.applyMatrix4(bone.matrix).normalize();
                if (PoseToboneMap.hasOwnProperty(bone.name)) {
                    _self.boneMap[PoseToboneMap[bone.name as keyof typeof PoseToboneMap]] = {
                        bone,
                        vec: new Vector3(),
                        originVec: _vec3.clone(),
                        index,
                    };
                }
            }
        });
    }

    public render() {
        if (this.modelLoaded) this.renderer.render(this.wrappedScene, this.camera);
    }

    public updatePoses(poses?: Keypoint[]) {
        if (!poses || !this.modelLoaded) return;
        for (let index = 0; index < poses.length; index++) {
            const pose = poses[index];
            if (pose.name && pose.score && PoseToboneMap.hasOwnProperty(pose.name)) {
                if (pose.score >= PoseDetection.threshold) {
                    this.boneMap[PoseToboneMap[pose.name as keyof typeof PoseToboneMap]].vec.set(
                        pose.x,
                        pose.y,
                        pose.z as number,
                    );
                } else {
                    this.boneMap[PoseToboneMap[pose.name as keyof typeof PoseToboneMap]].vec.set(0, 0, 0);
                }
            }
        }
        // poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.BlazePose).forEach(([i, j]) => {
        //     const kp1 = poses[i];
        //     const kp2 = poses[j];
        //     const name1 = kp1.name;
        //     const name2 = kp2.name;
        //     const score1 = kp1.score;
        //     const score2 = kp2.score;
        //     if (
        //         !name1 ||
        //         !name2 ||
        //         !score1 ||
        //         (score1 && score1 < PoseDetection.threshold) ||
        //         !score2 ||
        //         (score2 && score2 < PoseDetection.threshold)
        //     )
        //         return;
        //     console.log(name2, name1);
        //     _vec3.set(kp2.x - kp1.x, kp2.y - kp1.y, (kp2.z as number) - (kp1.z as number)).normalize();
        //     if (this.boneMap[j as PoseToboneMap]) {
        //         // console.log(name1, _vec3.x, _vec3.y, _vec3.z);
        //         this.boneMap[j as PoseToboneMap].vec.copy(_vec3);
        //         if (j === 12 && i === 11) {
        //             this.boneMap[j as PoseToboneMap].vec.copy(_vec3);
        //             this.boneMap[i as PoseToboneMap].vec.copy(_vec3.multiplyScalar(-1));
        //         }
        //     }
        // });
        this.updateBones();
    }

    private updateBones() {
        for (const key in this.boneMap) {
            const boneWrap = this.boneMap[key as unknown as PoseToboneMap];
            if (boneWrap.vec.length() === 0) continue;
            boneWrap.vec.applyMatrix4(_matrix4.copy(this.skeleton.boneInverses[boneWrap.index]));
            _quater.setFromUnitVectors(boneWrap.originVec, boneWrap.vec);
            boneWrap.bone.quaternion.multiply(_quater);
        }
        // for (const key in this.boneMap) {
        //     const boneWrap = this.boneMap[key as unknown as PoseToboneMap];
        //     boneWrap.vec.set(0, 0, 0);
        // }
        // for (const key in this.boneMap) {
        //     const boneWrap = this.boneMap[key as unknown as PoseToboneMap];
        // }
    }
}
