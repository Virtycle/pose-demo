import { useState, useRef, useEffect } from 'react';
import { Camera, Renderer2D } from '@/engine';
import './App.css';

function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvas3dRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (videoRef.current)
            Camera.setup(videoRef.current, { targetFPS: 30 }).then((camera) => {
                if (camera.videoElement) {
                    const render2d = new Renderer2D({
                        id: 'show-2d',
                        width: camera.width,
                        height: camera.height,
                        video: camera.videoElement,
                    });
                    render2d.play();
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
