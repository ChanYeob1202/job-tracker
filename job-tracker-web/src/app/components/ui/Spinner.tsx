type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
};

function Spinner({ size = "md", label }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-2"
    >
      <div
        className={`${sizeMap[size]} animate-spin rounded-full border-gray-300 border-t-gray-700`}
      />
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default Spinner;
