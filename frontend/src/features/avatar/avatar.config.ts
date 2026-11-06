
import type {
  AvatarConfig,
  AvatarType,
} from "./types/avatar.types";

export const AVATAR_CONFIGS: Record<AvatarType, AvatarConfig> = {
  male: {
    type: "male",
    name: "Alex",
    modelPath: "/models/male-assistant.glb",
  },

  female: {
    type: "female",
    name: "Sophia",
    modelPath: "/models/female-assistant.glb",
  },
};
