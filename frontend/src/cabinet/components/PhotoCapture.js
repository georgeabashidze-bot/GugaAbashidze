import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Upload, X, Loader2, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/cabinet/i18n";
import { toast } from "sonner";

const MAX_W = 800;
const JPEG_QUALITY = 0.82;

/**
 * Resize an image File or HTMLVideoElement frame to <= MAX_W width, return base64 data URL.
 */
async function resizeToDataURL(source) {
  return new Promise((resolve, reject) => {
    try {
      const draw = (img, w, h) => {
        const scale = Math.min(1, MAX_W / w);
        const cw = Math.round(w * scale);
        const ch = Math.round(h * scale);
        const canvas = document.createElement("canvas");
        canvas.width = cw; canvas.height = ch;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, cw, ch);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => draw(img, img.naturalWidth, img.naturalHeight);
          img.onerror = reject;
          img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(source);
      } else if (source instanceof HTMLVideoElement) {
        draw(source, source.videoWidth, source.videoHeight);
      } else {
        reject(new Error("Unsupported source"));
      }
    } catch (e) { reject(e); }
  });
}

export default function PhotoCapture({ value, onChange, testIdPrefix = "photo", aspect = "square" }) {
  const { t } = useI18n();
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [captured, setCaptured] = useState(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  const onFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await resizeToDataURL(file);
      onChange?.(dataUrl);
    } catch (e) {
      toast.error("Could not read image");
    }
    setBusy(false);
  };

  const openCamera = async () => {
    setCameraOpen(true);
    setCaptured(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      toast.error(t("photo.camera_error"));
      setCameraOpen(false);
    }
  };

  const closeCamera = () => {
    stopStream();
    setCameraOpen(false);
    setCaptured(null);
  };

  const capture = async () => {
    if (!videoRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await resizeToDataURL(videoRef.current);
      setCaptured(dataUrl);
    } catch (_e) {
      toast.error("Could not capture image");
    }
    setBusy(false);
  };

  const usePhoto = () => {
    if (captured) {
      onChange?.(captured);
      closeCamera();
    }
  };

  const clear = () => onChange?.("");

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className="space-y-3" data-testid={`${testIdPrefix}-root`}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid={`${testIdPrefix}-file-input`}
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-cream">
          <img src={value} alt="" className={`w-full ${aspect === "square" ? "aspect-square" : "aspect-[4/3]"} object-cover`} />
          <button
            type="button"
            onClick={clear}
            data-testid={`${testIdPrefix}-clear`}
            aria-label="Clear photo"
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[hsl(var(--destructive))] shadow-md hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          data-testid={`${testIdPrefix}-dropzone`}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[hsl(var(--border))] bg-cream/60 px-4 py-8 text-center transition-colors hover:border-[hsl(var(--primary))] hover:bg-cream"
        >
          {busy ? <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" /> : <Upload className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />}
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t("photo.drop_or_click")}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="rounded-xl" data-testid={`${testIdPrefix}-upload-button`}>
          <Upload className="mr-2 h-4 w-4" />{t("photo.upload")}
        </Button>
        <Button type="button" variant="outline" onClick={openCamera} className="rounded-xl" data-testid={`${testIdPrefix}-camera-button`}>
          <Camera className="mr-2 h-4 w-4" />{t("photo.take_photo")}
        </Button>
      </div>

      <Dialog open={cameraOpen} onOpenChange={(o) => { if (!o) closeCamera(); }}>
        <DialogContent className="max-w-lg" data-testid={`${testIdPrefix}-camera-dialog`}>
          <DialogHeader><DialogTitle>{t("photo.take_photo")}</DialogTitle></DialogHeader>
          <div className="overflow-hidden rounded-2xl bg-black">
            {captured ? (
              <img src={captured} alt="capture" className="w-full aspect-[4/3] object-contain" />
            ) : (
              <video ref={videoRef} className="w-full aspect-[4/3] object-cover" playsInline muted />
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="ghost" onClick={closeCamera} data-testid={`${testIdPrefix}-camera-close`}>{t("photo.close")}</Button>
            {captured ? (
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCaptured(null)} data-testid={`${testIdPrefix}-camera-retake`}><RotateCcw className="mr-2 h-4 w-4" />{t("photo.retake")}</Button>
                <Button type="button" onClick={usePhoto} data-testid={`${testIdPrefix}-camera-use`}><Check className="mr-2 h-4 w-4" />{t("photo.use_photo")}</Button>
              </div>
            ) : (
              <Button type="button" onClick={capture} disabled={busy} data-testid={`${testIdPrefix}-camera-capture`}><Camera className="mr-2 h-4 w-4" />{t("photo.capture")}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
