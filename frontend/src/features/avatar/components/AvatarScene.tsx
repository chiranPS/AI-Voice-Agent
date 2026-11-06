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

/**
 * Clean circular podium platform to ground the 3D character in space.
 */
function PedestalPlatform() {
    return (
        <group position={[0, -0.82, 0]}>
            {/* Upper Platform Disc */}
            <mesh position={[0, -0.015, 0]} receiveShadow>
                <cylinderGeometry args={[0.72, 0.76, 0.03, 48]} />
                <meshStandardMaterial
                    color="#f1f5f9"
                    metalness={0.4}
                    roughness={0.3}
                />
            </mesh>

            {/* Glowing Light Blue Rim Accent */}
            <mesh position={[0, 0.001, 0]}>
                <ringGeometry args={[0.68, 0.72, 48]} />
                <meshBasicMaterial color="#38bdf8" toneMapped={false} />
            </mesh>

            {/* Soft Ambient Ground Halo */}
            <mesh position={[0, -0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.95, 32]} />
                <meshBasicMaterial color="#0284c7" transparent opacity={0.12} />
            </mesh>
        </group>
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
                {/* Studio Lighting */}
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

                {/* Rim / Back Light to separate silhouette from background */}
                <directionalLight
                    position={[0, 3, -2.5]}
                    intensity={1.0}
                    color="#ffffff"
                />

                {/* Grounding Podium */}
                <PedestalPlatform />

                {/* The 3D Avatar Character */}
                <AvatarModel
                    gender={gender}
                    animation={animation}
                />

                {/* Locked / Polished kiosk angle */}
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
