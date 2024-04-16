import { useState, useRef, useEffect } from 'react';
import { Camera, Renderer2D, PoseDetection } from '@/engine';
import './App.css';

function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvas3dRef = useRef<HTMLCanvasElement>(null);
    const cameraRef = useRef<Camera | null>(null);
    const detectionRef = useRef<PoseDetection | null>(null);
    const render2dRef = useRef<Renderer2D | null>(null);
    const rfIdRef = useRef<number>(0);
    useEffect(() => {
        if (videoRef.current)
            Camera.setup(videoRef.current, { targetFPS: 30 }).then(async (camera) => {
                if (camera.videoElement) {
                    render2dRef.current = new Renderer2D({
                        id: 'show-2d',
                        width: camera.width,
                        height: camera.height,
                        video: camera.videoElement,
                    });
                    detectionRef.current = await new PoseDetection().createDetector();
                    cameraRef.current = camera;
                    render2dRef.current.play();
                    async function play() {
                        const detector = detectionRef.current;
                        const camera = cameraRef.current;
                        const render2d = render2dRef.current;
                        const poses = await detector!.estimatePoses(camera!.videoElement as HTMLVideoElement);
                        render2d!.updatePoses(poses);
                        requestAnimationFrame(play);
                    }
                    play();
                }
            });
    }, []);
    return (
        <div className="wrapper">
            <div className="left">
                <video id="camera" src="" ref={videoRef}></video>
                <div id="show-2d" ref={containerRef}></div>
            </div>
        </div>
    );
}

export default App;
