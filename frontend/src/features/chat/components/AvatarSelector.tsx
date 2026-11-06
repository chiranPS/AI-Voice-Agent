import { Check } from "lucide-react";

export type AvatarType = "male" | "female";

interface AvatarSelectorProps {
  selectedAvatar: AvatarType;
  onSelect: (avatar: AvatarType) => void;
}

const avatars: {
  id: AvatarType;
  name: string;
  description: string;
  emoji: string;
}[] = [
  {
    id: "female",
    name: "Female Assistant",
    description: "Friendly virtual assistant",
    emoji: "👩🏻‍💼",
  },
  {
    id: "male",
    name: "Male Assistant",
    description: "Friendly virtual assistant",
    emoji: "👨🏻‍💼",
  },
];

const AvatarSelector = ({
  selectedAvatar,
  onSelect,
}: AvatarSelectorProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-1 font-semibold text-slate-900">
        Choose Your Assistant
      </h3>

      <p className="mb-4 text-sm text-slate-500">
        Select the virtual assistant you prefer.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {avatars.map((avatar) => {
          const isSelected = selectedAvatar === avatar.id;

          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar.id)}
              aria-pressed={isSelected}
              className={`relative flex flex-col items-center rounded-xl border p-4 transition ${
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              {isSelected && (
                <span className="absolute right-2 top-2 text-blue-600">
                  <Check size={17} />
                </span>
              )}

              <span className="mb-2 text-4xl" aria-hidden="true">
                {avatar.emoji}
              </span>

              <span className="text-sm font-semibold text-slate-800">
                {avatar.name}
              </span>

              <span className="mt-1 text-center text-xs text-slate-500">
                {avatar.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default AvatarSelector;