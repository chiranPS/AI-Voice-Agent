import { Suspense } from "react";
import AvatarScene from "./AvatarScene";
import type { AvatarType } from "../types/avatar.types";
import type { AvatarAnimation } from "./AvatarModel";

export type AvatarAgentState =
    | "idle"
    | "listening"
    | "thinking"
    | "speaking"
    | "waving";

interface AvatarStageProps {
    gender: AvatarType;
    state: AvatarAgentState;
}

const getAnimation = (state: AvatarAgentState): AvatarAnimation => {
    switch (state) {
        case "waving":
            return "wave";

        case "speaking":
            return "talking";

        case "thinking":
            return "thoughtful";

        case "listening":
        case "idle":
        default:
            return "idle";
    }
};

export default function AvatarStage({
    gender,
    state,
}: AvatarStageProps) {
    const animation = getAnimation(state);

    return (
        <div className="relative h-full w-full min-h-[280px] sm:min-h-[350px] lg:min-h-[440px] overflow-hidden select-none">
            <Suspense fallback={null}>
                <AvatarScene
                    gender={gender}
                    animation={animation}
                />
            </Suspense>
        </div>
    );
}
