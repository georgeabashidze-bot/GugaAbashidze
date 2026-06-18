import React, { useRef, useState } from "react";
import { File, FileText, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/cabinet/i18n";
import { toast } from "sonner";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB cap
const IMG_MAX_W = 1400;
const IMG_QUALITY = 0.85;

async function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, IMG_MAX_W / img.naturalWidth);
        const cw = Math.round(img.naturalWidth * scale);
        const ch = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement("canvas");
        canvas.width = cw; canvas.height = ch;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, cw, ch);
        resolve({ dataUrl: canvas.toDataURL("image/jpeg", IMG_QUALITY), name: file.name, type: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function pdfToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ dataUrl: reader.result, name: file.name, type: file.type });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FileUpload({ value, onChange, testIdPrefix = "file", accept = "image/*,application/pdf", maxBytes = MAX_BYTES }) {
  const { t } = useI18n();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const isPdf = typeof value === "string" && value.startsWith("data:application/pdf");
  const isImage = typeof value === "string" && value.startsWith("data:image/");

  const onFile = async (file) => {
    if (!file) return;
    if (file.size > maxBytes) {
      toast.error(`File too large (max ${Math.round(maxBytes / 1024 / 1024)} MB)`);
      return;
    }
    setBusy(true);
    try {
      let out;
      if (file.type.startsWith("image/")) {
        out = await resizeImageFile(file);
      } else if (file.type === "application/pdf") {
        out = await pdfToDataUrl(file);
      } else {
        toast.error("Only image or PDF allowed");
        setBusy(false);
        return;
      }
      onChange?.(out.dataUrl, out);
    } catch (e) {
      toast.error("Could not read file");
    }
    setBusy(false);
  };

  const clear = () => onChange?.("", null);

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className="space-y-2" data-testid={`${testIdPrefix}-root`}>
      <input ref={fileRef} type="file" accept={accept} className="hidden" data-testid={`${testIdPrefix}-input`} onChange={(e) => onFile(e.target.files?.[0])} />
      {value ? (
        <div className="relative flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-paper p-3">
          {isImage ? (
            <img src={value} alt="" className="h-16 w-16 rounded-xl object-cover" />
          ) : isPdf ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><FileText className="h-7 w-7" /></div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><File className="h-7 w-7" /></div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{isPdf ? "PDF" : isImage ? "Image" : "File"}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{Math.round(value.length / 1024)} KB</div>
          </div>
          <button type="button" onClick={clear} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10" aria-label="Clear" data-testid={`${testIdPrefix}-clear`}><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()} role="button" tabIndex={0} data-testid={`${testIdPrefix}-dropzone`} className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[hsl(var(--border))] bg-cream/60 px-4 py-6 text-center transition-colors hover:border-[hsl(var(--primary))] hover:bg-cream">
          {busy ? <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))]" /> : <Upload className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />}
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t("file.upload_hint")}</p>
        </div>
      )}
    </div>
  );
}
