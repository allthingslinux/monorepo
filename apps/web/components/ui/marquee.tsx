import { cn } from "@/lib/utils";

interface MarqueeProps {
  "aria-label"?: string;
  children?: React.ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  repeat?: number;
  reverse?: boolean;
  style?: React.CSSProperties;
  vertical?: boolean;
}

export default function Marquee({
  className,
  reverse,
  pauseOnHover: _pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex gap-4 overflow-hidden p-2",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            className={cn("flex shrink-0 justify-around gap-4", {
              "animate-marquee flex-row hover:[animation-play-state:paused]":
                !vertical,
              "animate-marquee-vertical flex-col hover:[animation-play-state:paused]":
                vertical,
              "[animation-direction:reverse]": reverse,
            })}
            key={i}
          >
            {children}
          </div>
        ))}
    </div>
  );
}