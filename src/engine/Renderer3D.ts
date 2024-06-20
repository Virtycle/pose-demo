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
    Vector4,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Keypoint } from '@tensorflow-models/pose-detection';
import { PoseDetection } from './Pose-detection';
// import * as poseDetection from '@tensorflow-models/pose-detection';

const rendererParam = { antialias: true, alpha: true };

const _vec3 = new Vector3();
const _vec3_2 = new Vector3();
const _vec4 = new Vector4();
const _matrix4 = new Matrix4();
const _quater = new Quaternion();

const defaultCameraLocation = {
    x: -2,
    y: 4,
    z: 6,
};

type ValueOf<T> = T[keyof T];

export const BoneIndexMap = {
    mixamorigLeftShoulder: 11,
    mixamorigLeftArm: 13,
    mixamorigLeftForeArm: 15,
    // mixamorigLeftHand: 15,
    mixamorigRightShoulder: 12,
    mixamorigRightArm: 14,
    mixamorigRightForeArm: 16,
    // mixamorigRightHand: 16,
    mixamorigLeftUpLeg: 23,
    mixamorigLeftLeg: 25,
    mixamorigLeftFoot: 27,
    mixamorigRightUpLeg: 24,
    mixamorigRightLeg: 26,
    mixamorigRightFoot: 28,
} as const;

export type BoneIndexMapKeyType = keyof typeof BoneIndexMap;

export const PoseIndexMap = {
    left_shoulder: 11,
    left_elbow: 13,
    left_wrist: 15,
    right_shoulder: 12,
    right_elbow: 14,
    right_wrist: 16,
    left_hip: 23,
    left_knee: 25,
    left_ankle: 27,
    right_hip: 24,
    right_knee: 26,
    right_ankle: 28,
} as const;

export type PoseIndexMapKeyType = keyof typeof PoseIndexMap;

type PoseIndexType = ValueOf<typeof PoseIndexMap>;

type BoneWrap = {
    bone: Bone;
    originVec: Vector3;
    originQuater: Quaternion;
    index: number;
    parentIndex: number;
};

type IndexPoseMap = {
    [key in PoseIndexType]: {
        vec: Vector3;
    };
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

    private skeleton!: Skeleton;

    private indexPoseMap: IndexPoseMap = {} as IndexPoseMap;

    private boneWrapArr: BoneWrap[] = [];

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

        const keys = Object.keys(PoseIndexMap);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            this.indexPoseMap[PoseIndexMap[key as PoseIndexMapKeyType]] = {
                vec: new Vector3(),
            };
        }
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
            for (let index = 0; index < bones.length; index++) {
                const bone = bones[index];
                _vec3.set(0, 0, 0);
                bone.updateMatrix();
                _vec3.applyMatrix4(bone.matrix).normalize();
                let parentIndex = -1;
                if (bone.parent && bone.parent.type === 'Bone') {
                    parentIndex = bones.findIndex((b) => b.name === bone.parent?.name);
                }
                _self.boneWrapArr.push({
                    bone,
                    originVec: _vec3.clone(),
                    originQuater: bone.quaternion.clone(),
                    index,
                    parentIndex,
                });
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
            if (pose.name && pose.score && PoseIndexMap.hasOwnProperty(pose.name)) {
                if (pose.score >= PoseDetection.threshold) {
                    this.indexPoseMap[PoseIndexMap[pose.name as keyof typeof PoseIndexMap]].vec.set(
                        pose.x,
                        -pose.y,
                        -(pose.z as number),
                    );
                } else {
                    this.indexPoseMap[PoseIndexMap[pose.name as keyof typeof PoseIndexMap]].vec.set(0, 0, 0);
                }
            }
        }
        this.updateBones();
    }

    private updateBones() {
        for (let i = 0; i < this.boneWrapArr.length; i++) {
            const boneWrap = this.boneWrapArr[i];
            if (!BoneIndexMap.hasOwnProperty(boneWrap.bone.name) || boneWrap.parentIndex === -1) continue;
            const mapVec = this.indexPoseMap[BoneIndexMap[boneWrap.bone.name as BoneIndexMapKeyType]];
            if (mapVec.vec.length() === 0) continue;
            const parentMapVec = this.indexPoseMap[BoneIndexMap[boneWrap.bone.parent?.name as BoneIndexMapKeyType]];
            if (!parentMapVec || parentMapVec.vec.length() === 0) continue;
            _vec3.subVectors(mapVec.vec, parentMapVec.vec);
            _vec4
                .set(_vec3.x, _vec3.y, _vec3.z, 0)
                .applyMatrix4(_matrix4.copy(this.skeleton.boneInverses[boneWrap.parentIndex]))
                .normalize();
            _vec3_2.set(_vec4.x, _vec4.y, _vec4.z);
            _quater.setFromUnitVectors(boneWrap.originVec, _vec3_2);
            boneWrap.bone.quaternion.multiplyQuaternions(boneWrap.originQuater, _quater);
        }
        for (const key in this.indexPoseMap) {
            const mapItem = this.indexPoseMap[key as unknown as PoseIndexType];
            mapItem.vec.set(0, 0, 0);
        }
    }
}
