import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, useAnimations, useGLTF } from "@react-three/drei";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import type { AnimationClip } from "three";

type AvatarGender = "male" | "female";
type AnimationName = "idle" | "talking" | "thoughtful" | "wave";

interface AvatarPaths {
    model: string;
    idle: string;
    talking: string;
    thoughtful: string;
    wave: string;
}

const AVATAR_PATHS: Record<AvatarGender, AvatarPaths> = {
    male: {
        model: "/models/Business_Male_03.glb",
        idle: "/models/animations/male/m_idle_neutral_01.glb",
        talking: "/models/animations/male/m_gestic_talk_neutral_01.glb",
        thoughtful: "/models/animations/male/m_gestic_thoughtful_01.glb",
        wave: "/models/animations/male/m_wave_01.glb",
    },
    female: {
        model: "/models/Business_Female_02.glb",
        idle: "/models/animations/female/f_idle_neutral_01.glb",
        talking: "/models/animations/female/f_gestic_talk_neutral_01.glb",
        thoughtful: "/models/animations/female/f_gestic_thoughtful_01.glb",
        wave: "/models/animations/female/f_wave_01.glb",
    },
};

const ANIMATION_LABELS: Record<AnimationName, string> = {
    idle: "Idle",
    talking: "Talking",
    thoughtful: "Thoughtful",
    wave: "Wave",
};

interface AnimatedAvatarProps {
    gender: AvatarGender;
    animation: AnimationName;
}

function AnimatedAvatar({ gender, animation }: AnimatedAvatarProps) {
    const paths = AVATAR_PATHS[gender];

    const character = useGLTF(paths.model);
    const idle = useGLTF(paths.idle);
    const talking = useGLTF(paths.talking);
    const thoughtful = useGLTF(paths.thoughtful);
    const wave = useGLTF(paths.wave);

    // Clone the character so its skeleton can be animated independently.
    const avatarScene = useMemo(
        () => clone(character.scene),
        [character.scene]
    );

    // Give every animation a unique name.
    const animationClips = useMemo(() => {
        const clips: AnimationClip[] = [
            idle.animations[0].clone(),
            talking.animations[0].clone(),
            thoughtful.animations[0].clone(),
            wave.animations[0].clone(),
        ];

        clips[0].name = "idle";
        clips[1].name = "talking";
        clips[2].name = "thoughtful";
        clips[3].name = "wave";

        return clips;
    }, [
        idle.animations,
        talking.animations,
        thoughtful.animations,
        wave.animations,
    ]);

    const { actions } = useAnimations(animationClips, avatarScene);

    useEffect(() => {
        const selectedAction = actions[animation];

        if (!selectedAction) {
            console.error(
                `Animation "${animation}" could not be loaded for ${gender}.`
            );
            return;
        }

        // Stop any previously playing animation.
        Object.values(actions).forEach((action) => {
            action?.stop();
        });

        // Start the selected animation.
        selectedAction.reset();
        selectedAction.fadeIn(0.3);
        selectedAction.play();

        console.log(`${gender}: Playing ${animation}`);

        return () => {
            selectedAction.fadeOut(0.2);
        };
    }, [actions, animation, gender]);

    return (
        <>
            <group position={[0, -0.5, 0]}>
                <primitive object={avatarScene} />
            </group>

            <ambientLight intensity={1.5} />
            <directionalLight position={[3, 5, 5]} intensity={2} />
            <directionalLight position={[-3, 2, -3]} intensity={0.8} />
        </>
    );
}

interface AvatarPreviewProps {
    gender: AvatarGender;
    animation: AnimationName;
}

function AvatarPreview({ gender, animation }: AvatarPreviewProps) {
    return (
        <div className="h-[480px] overflow-hidden rounded-xl bg-gradient-to-b from-slate-200 to-slate-100">
            <Canvas camera={{ position: [0, 0.5, 6], fov: 35 }}>
                <Suspense
                    fallback={
                        <Html center>
                            <p className="text-sm text-slate-700">Loading avatar...</p>
                        </Html>
                    }
                >
                    <AnimatedAvatar gender={gender} animation={animation} />
                </Suspense>
            </Canvas>
        </div>
    );
}

function AvatarAnimationTest() {
    const [gender, setGender] = useState<AvatarGender>("male");
    const [animation, setAnimation] = useState<AnimationName>("idle");

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">
                        3D Avatar Animation Test
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Test the character models and their animation clips.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="font-semibold text-slate-900">
                                {gender === "male" ? "Male Assistant" : "Female Assistant"}
                            </h2>

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                Animation Test
                            </span>
                        </div>

                        <AvatarPreview gender={gender} animation={animation} />

                        <div className="mt-4 text-center">
                            <p className="text-sm font-medium text-slate-800">
                                Current animation: {ANIMATION_LABELS[animation]}
                            </p>
                        </div>
                    </section>

                    <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div>
                            <h2 className="mb-3 font-semibold text-slate-900">
                                Select Avatar
                            </h2>

                            <div className="grid grid-cols-2 gap-2">
                                {(["male", "female"] as const).map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setGender(option)}
                                        className={`rounded-lg border px-3 py-3 text-sm font-medium capitalize transition ${gender === option
                                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-3 font-semibold text-slate-900">
                                Animation Controls
                            </h2>

                            <div className="space-y-2">
                                {(Object.keys(ANIMATION_LABELS) as AnimationName[]).map(
                                    (option) => (
                                        <button
                                            key={option}
                                            onClick={() => setAnimation(option)}
                                            className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${animation === option
                                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            {ANIMATION_LABELS[option]}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                            <h3 className="text-sm font-semibold text-slate-800">
                                Testing instructions
                            </h3>

                            <ul className="mt-2 list-inside list-disc space-y-2 text-xs leading-5 text-slate-600">
                                <li>Test all four animations.</li>
                                <li>Check whether the hands and arms move correctly.</li>
                                <li>Look for unexpected body or facial movements.</li>
                                <li>Switch between male and female avatars.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default AvatarAnimationTest;