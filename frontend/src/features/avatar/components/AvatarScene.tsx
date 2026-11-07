import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import AvatarModel, { type AvatarAnimation } from "./AvatarModel";
import type { AvatarType } from "../types/avatar.types";

interface AvatarSceneProps {
    gender: AvatarType;
    animation: AvatarAnimation;
}

function AvatarLoading() {
    return (
        <Html center>
            <div className="rounded-xl border border-sky-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                Loading assistant...
            </div>
        </Html>
    );
}

export default function AvatarScene({
    gender,
    animation,
}: AvatarSceneProps) {
    return (
        <Canvas
            camera={{
                position: [0, 0.14, 2.9],
                fov: 35,
            }}
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true }}
            className="h-full w-full"
        >
            <Suspense fallback={<AvatarLoading />}>
                {/* Studio Ambient Light */}
                <ambientLight intensity={1.3} />

                {/* Key Light */}
                <directionalLight
                    position={[2.5, 4, 3]}
                    intensity={1.8}
                    castShadow
                />

                {/* Soft Fill Light with light-blue tint */}
                <directionalLight
                    position={[-2.5, 2, 2]}
                    intensity={0.8}
                    color="#e0f2fe"
                />

                {/* Rim / Back Light to give character professional silhouette depth */}
                <directionalLight
                    position={[0, 3, -2.5]}
                    intensity={1.0}
                    color="#ffffff"
                />

                {/* The 3D Avatar Character */}
                <AvatarModel
                    gender={gender}
                    animation={animation}
                />

                {/* Standard stable kiosk framing */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    enableRotate={false}
                    target={[0, 0.10, 0]}
                />
            </Suspense>
        </Canvas>
    );
}
