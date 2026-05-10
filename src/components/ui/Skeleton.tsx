// src/components/ui/Skeleton.tsx


interface SkeletonProps {
  className?: string;
}

export function Skeleton({
  className = "",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`
        animate-pulse
        select-none
        rounded-lg
        bg-[#E8EDF5]

        ${className}
      `}
    />
  );
}