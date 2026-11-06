
import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import { Bone, PropertyBinding, type Object3D } from "three";

type AvatarGender = "male" | "female";

interface ProbeReport {
    gender: AvatarGender;
    character: string;
    idleAnimation: string;
    talkingAnimation: string;
    boneCount: number;
    characterNodeCount: number;
    idleMatches: number;
    idleTotal: number;
    idleMissing: string[];
    talkingMatches: number;
    talkingTotal: number;
    talkingMissing: string[];
    status: "passed" | "partial" | "failed";
}

interface ProbeProps {
    gender: AvatarGender;
    onReport: (report: ProbeReport) => void;
}

const MODEL_PATHS = {
    male: {
        model: "/models/Business_Male_03.glb",
        idle: "/models/animations/male/m_idle_neutral_01.glb",
        talking: "/models/animations/male/m_gestic_talk_neutral_01.glb",
    },
    female: {
        model: "/models/Business_Female_02.glb",
        idle: "/models/animations/female/f_idle_neutral_01.glb",
        talking: "/models/animations/female/f_gestic_talk_neutral_01.glb",
    },
};

const CompatibilityProbe = ({ gender, onReport }: ProbeProps) => {
    const paths = MODEL_PATHS[gender];

    const character = useGLTF(paths.model);
    const idle = useGLTF(paths.idle);
    const talking = useGLTF(paths.talking);

    useEffect(() => {
        const nodeNames = new Set<string>();
        const boneNames: string[] = [];

        character.scene.traverse((object: Object3D) => {
            nodeNames.add(object.name);

            if (object instanceof Bone) {
                boneNames.push(object.name);
            }
        });

        const inspectClip = (clip: (typeof idle.animations)[number]) => {
            const missing: string[] = [];
            let matches = 0;

            for (const track of clip.tracks) {
                const parsed = PropertyBinding.parseTrackName(track.name);
                const target = PropertyBinding.findNode(
                    character.scene,
                    parsed.nodeName
                );

                if (target) {
                    matches++;
                } else {
                    missing.push(track.name);
                }
            }

            return {
                matches,
                total: clip.tracks.length,
                missing,
            };
        };

        const idleClip = idle.animations[0];
        const talkingClip = talking.animations[0];

        if (!idleClip || !talkingClip) {
            console.error(`${gender}: Animation clip missing.`);
            return;
        }

        const idleResult = inspectClip(idleClip);
        const talkingResult = inspectClip(talkingClip);

        const totalTracks = idleResult.total + talkingResult.total;
        const matchedTracks = idleResult.matches + talkingResult.matches;

        const report: ProbeReport = {
            gender,
            character: paths.model,
            idleAnimation: idleClip.name,
            talkingAnimation: talkingClip.name,
            boneCount: boneNames.length,
            characterNodeCount: nodeNames.size,
            idleMatches: idleResult.matches,
            idleTotal: idleResult.total,
            idleMissing: idleResult.missing.slice(0, 10),
            talkingMatches: talkingResult.matches,
            talkingTotal: talkingResult.total,
            talkingMissing: talkingResult.missing.slice(0, 10),
            status:
                matchedTracks === totalTracks
                    ? "passed"
                    : matchedTracks === 0
                        ? "failed"
                        : "partial",
        };

        console.group(`${gender.toUpperCase()} AVATAR COMPATIBILITY`);
        console.log("Character nodes:", [...nodeNames]);
        console.log("Character bones:", boneNames);
        console.log("Idle animation:", idleClip.name, idleResult);
        console.log("Talking animation:", talkingClip.name, talkingResult);
        console.log("Overall status:", report.status);
        console.groupEnd();

        onReport(report);
    }, [
        character.scene,
        idle.animations,
        talking.animations,
        gender,
        paths.model,
        onReport,
    ]);

    return (
        <>
            <group position={[0, -0.5, 0]}>
                <primitive object={character.scene} />
            </group>

            <ambientLight intensity={1.5} />
            <directionalLight position={[3, 5, 5]} intensity={2} />

            <Html position={[0, 2.1, 0]} center>
                <div className="rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-white">
                    {gender.toUpperCase()} MODEL
                </div>
            </Html>
        </>
    );
};

const AvatarCompatibilityCheck = () => {
    const [reports, setReports] = useState<
        Partial<Record<AvatarGender, ProbeReport>>
    >({});

    const handleReport = (report: ProbeReport) => {
        setReports((previous) => ({
            ...previous,
            [report.gender]: report,
        }));
    };

    const renderReport = (gender: AvatarGender) => {
        const report = reports[gender];

        if (!report) {
            return <p className="text-sm text-slate-500">Loading assets...</p>;
        }

        return (
            <div className="space-y-2 text-sm">
                <p>
                    Status:{" "}
                    <strong
                        className={
                            report.status === "passed"
                                ? "text-green-600"
                                : report.status === "partial"
                                    ? "text-amber-600"
                                    : "text-red-600"
                        }
                    >
                        {report.status.toUpperCase()}
                    </strong>
                </p>

                <p>Character nodes: {report.characterNodeCount}</p>
                <p>Character bones: {report.boneCount}</p>

                <div>
                    <strong>Idle animation</strong>
                    <p>
                        {report.idleAnimation}: {report.idleMatches}/
                        {report.idleTotal} matching tracks
                    </p>
                </div>

                <div>
                    <strong>Talking animation</strong>
                    <p>
                        {report.talkingAnimation}: {report.talkingMatches}/
                        {report.talkingTotal} matching tracks
                    </p>
                </div>

                {report.idleMissing.length > 0 && (
                    <div>
                        <strong>Missing idle targets</strong>
                        <ul className="list-inside list-disc">
                            {report.idleMissing.map((name) => (
                                <li key={name}>{name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {report.talkingMissing.length > 0 && (
                    <div>
                        <strong>Missing talking targets</strong>
                        <ul className="list-inside list-disc">
                            {report.talkingMissing.map((name) => (
                                <li key={name}>{name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-2 text-2xl font-bold text-slate-900">
                    Avatar Compatibility Test
                </h1>

                <p className="mb-6 text-sm text-slate-600">
                    Checking character skeletons against their separate animation clips.
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                    {(["male", "female"] as const).map((gender) => (
                        <section
                            key={gender}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                            <div className="h-[420px] bg-gradient-to-b from-slate-200 to-slate-100">
                                <Canvas camera={{ position: [0, 0.5, 6], fov: 35 }}>
                                    <Suspense
                                        fallback={
                                            <Html center>
                                                <p className="text-sm">Loading model...</p>
                                            </Html>
                                        }
                                    >
                                        <CompatibilityProbe
                                            gender={gender}
                                            onReport={handleReport}
                                        />
                                    </Suspense>
                                </Canvas>
                            </div>

                            <div className="space-y-3 p-5">
                                <h2 className="text-lg font-semibold capitalize">
                                    {gender} assistant
                                </h2>

                                {renderReport(gender)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default AvatarCompatibilityCheck;
