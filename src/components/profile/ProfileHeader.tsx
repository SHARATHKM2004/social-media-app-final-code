"use client";

export default function ProfileHeader({
  title,
  onOpenSettings,
  disabled,
}: {
  title: string;
  onOpenSettings: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-brand-gray">Mini Social</p>
      </div>

      <button
        onClick={() => {
          if (disabled) return;
          onOpenSettings();
        }}
        disabled={disabled}
        className={`rounded-xl p-2 ${
          disabled ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
        }`}
        title="Settings"
        aria-label="Settings"
      >
        ⚙️
      </button>
    </div>
  );
}