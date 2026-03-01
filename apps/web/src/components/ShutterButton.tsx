interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export default function ShutterButton({ onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="写真を撮る"
      className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/80 transition-transform active:scale-90 disabled:opacity-40"
    >
      <div className="h-16 w-16 rounded-full bg-white" />
    </button>
  );
}
