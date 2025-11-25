import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> { }

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl",
                    "shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
                    className
                )}
                {...props}
            />
        );
    }
);

Card.displayName = "Card";

export { Card };
