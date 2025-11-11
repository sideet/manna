"use client";

interface TagProps {
  children?: React.ReactNode;
  theme?: "blue" | "purple";
  className?: string;
}

export default function Button({
  children,
  theme = "blue",
  className = "",
  ...props
}: TagProps) {
  const blueStyles = "bg-blue-50 text-blue-400";
  const purpleStyles = "bg-purple-50 text-purple-500";

  const styles = theme === "blue" ? blueStyles : purpleStyles;

  return (
    <button
      className={`px-4 py-2 rounded-[4px] text-caption12-1 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
