import { useEffect, useMemo, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import type { AnimationClip, AnimationAction } from "three";
import type { AvatarType } from "../types/avatar.types";

export type AvatarAnimation = "idle" | "talking" | "thoughtful" | "wave";

interface AvatarModelProps {
    gender: AvatarType;
    animation: AvatarAnimation;
}

const AVATAR_ASSETS = {
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

export default function AvatarModel({
    gender,
    animation,
}: AvatarModelProps) {
    const assets = AVATAR_ASSETS[gender];

    const character = useGLTF(assets.model);
    const idle = useGLTF(assets.idle);
    const talking = useGLTF(assets.talking);
    const thoughtful = useGLTF(assets.thoughtful);
    const wave = useGLTF(assets.wave);

    // Each displayed avatar gets its own skeleton instance.
    const avatarScene = useMemo(
        () => clone(character.scene),
        [character.scene]
    );

    const clips = useMemo(() => {
        const animationClips: AnimationClip[] = [
            idle.animations[0].clone(),
            talking.animations[0].clone(),
            thoughtful.animations[0].clone(),
            wave.animations[0].clone(),
        ];

        animationClips[0].name = "idle";
        animationClips[1].name = "talking";
        animationClips[2].name = "thoughtful";
        animationClips[3].name = "wave";

        return animationClips;
    }, [
        idle.animations,
        talking.animations,
        thoughtful.animations,
        wave.animations,
    ]);

    const { actions } = useAnimations(clips, avatarScene);
    const currentAction = useRef<AnimationAction | null>(null);

    useEffect(() => {
        const nextAction = actions[animation];

        if (!nextAction) {
            console.error(
                `Could not find the ${animation} animation for ${gender}.`
            );
            return;
        }

        const previousAction = currentAction.current;

        // Prepare the next animation.
        nextAction.reset();
        nextAction.setEffectiveTimeScale(1);
        nextAction.setEffectiveWeight(1);
        nextAction.play();

        // Smoothly transition from the previous animation.
        if (previousAction && previousAction !== nextAction) {
            previousAction.crossFadeTo(nextAction, 0.5, false);
        } else {
            nextAction.fadeIn(0.5);
        }

        currentAction.current = nextAction;

    }, [actions, animation, gender]);

    const isMale = gender === "male";
    // Scale and position male and female models so both have balanced headroom and stand squarely on the platform
    const modelScale = isMale ? 0.92 : 0.98;

    return (
        <group position={[0, -0.82, 0]} scale={modelScale}>
            <primitive object={avatarScene} />
        </group>
    );
}

// Preload both character models.
useGLTF.preload("/models/Business_Male_03.glb");
useGLTF.preload("/models/Business_Female_02.glb");
