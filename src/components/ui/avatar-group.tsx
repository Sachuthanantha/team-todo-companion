
import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
}

export function AvatarGroup({
  children,
  className,
  max = 5,
  ...props
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const showCount = childrenArray.length > max;
  const visibleAvatars = showCount ? childrenArray.slice(0, max) : childrenArray;
  const remainingCount = childrenArray.length - max;

  return (
    <div
      className={cn("flex -space-x-2", className)}
      {...props}
    >
      {visibleAvatars}
      {showCount && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium overflow-hidden border-2 border-background">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
