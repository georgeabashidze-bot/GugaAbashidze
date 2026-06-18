import React from "react";
import { PawPrint } from "lucide-react";

export default function BrandMark({ size = "md" }) {
  const sizes = {
    sm: { wrap: "h-8", icon: "h-4 w-4", text: "text-sm" },
    md: { wrap: "h-9", icon: "h-4 w-4", text: "text-base" },
    lg: { wrap: "h-10", icon: "h-5 w-5", text: "text-lg" },
  };
  const s = sizes[size] || sizes.md;
  return (
    <div className={`inline-flex items-center gap-2 ${s.wrap}`} data-testid="brand-mark">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        <PawPrint className={s.icon} />
      </span>
      <span className={`font-serif font-semibold tracking-tight ${s.text}`}>SmartPaw</span>
    </div>
  );
}
