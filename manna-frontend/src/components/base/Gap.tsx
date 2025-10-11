interface GapProps {
  direction?: "row" | "col";
  children?: React.ReactNode | React.ReactNode[];
  gap: number;
  items?: "center" | "start" | "end";
  justify?: "center" | "start" | "end" | "between" | "around" | "evenly";
  width?: "auto" | "full" | "fit";
  height?: "auto" | "full" | "fit";
  className?: string; // 추가로 필요한 경우를 위해
}

export default function Gap({
  direction = "row",
  children,
  gap,
  items = "center",
  justify = "center",
  width = "auto",
  height = "auto",
  className,
}: GapProps) {
  const classes = [
    "flex",
    direction === "row" ? "flex-row" : "flex-col",
    items === "center" && "items-center",
    items === "start" && "items-start",
    items === "end" && "items-end",
    justify === "center" && "justify-center",
    justify === "start" && "justify-start",
    justify === "end" && "justify-end",
    justify === "between" && "justify-between",
    justify === "around" && "justify-around",
    justify === "evenly" && "justify-evenly",
    width === "full" && "w-full",
    width === "fit" && "w-fit",
    width === "auto" && "w-auto",
    height === "full" && "h-full",
    height === "fit" && "h-fit",
    height === "auto" && "h-auto",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={{ gap: `calc(${gap} * var(--spacing))` }}>
      {children}
    </div>
  );
}
