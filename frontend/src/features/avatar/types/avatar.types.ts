
export type AvatarType = "male" | "female";

export type AvatarState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking";

export interface AvatarConfig {
  type: AvatarType;
  name: string;
  modelPath: string;
}

export interface AvatarModelProps {
  modelPath: string;
  state: AvatarState;
}

export interface AvatarStageProps {
  selectedAvatar: AvatarType;
  state: AvatarState;
}

export interface AvatarControlsProps {
  selectedAvatar: AvatarType;
  onSelect: (avatar: AvatarType) => void;
  disabled?: boolean;
}
