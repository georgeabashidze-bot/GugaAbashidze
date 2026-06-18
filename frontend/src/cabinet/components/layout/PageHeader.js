import React from "react";
import { useI18n } from "@/cabinet/i18n";

export default function PageHeader({ title, subtitle, action, testIdPrefix = "page" }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between" data-testid={`${testIdPrefix}-header`}>
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl" data-testid={`${testIdPrefix}-title`}>{title}</h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm text-[hsl(var(--muted-foreground))] sm:text-base" data-testid={`${testIdPrefix}-subtitle`}>{subtitle}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
