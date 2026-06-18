import React from "react";
import { useI18n } from "@/cabinet/i18n";
import { Button } from "@/components/ui/button";

export default function LanguageToggle({ className = "", testId = "language-toggle" }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="language"
      data-testid={testId}
      className={`inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-paper p-1 ${className}`}
    >
      <Button
        type="button"
        onClick={() => setLang("ka")}
        variant="ghost"
        size="sm"
        data-testid={`${testId}-ka`}
        className={`h-7 rounded-full px-3 text-xs font-medium ${lang === "ka" ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"}`}
      >
        KA
      </Button>
      <Button
        type="button"
        onClick={() => setLang("en")}
        variant="ghost"
        size="sm"
        data-testid={`${testId}-en`}
        className={`h-7 rounded-full px-3 text-xs font-medium ${lang === "en" ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"}`}
      >
        EN
      </Button>
    </div>
  );
}
