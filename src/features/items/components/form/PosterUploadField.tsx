//src/features/items/components/form/PosterUploadField.tsx
"use client";

import * as React from "react";
import { ImagePlus, X, UploadCloud } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface PosterUploadFieldProps {
  value: File | string | null;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
  disabled?: boolean;
}

export function PosterUploadField({
  value,
  onChange,
  onRemoveExisting,
  disabled,
}: PosterUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Handle local preview without uploading
  React.useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    if (typeof value === "string") {
      setPreviewUrl(value); // Existing image URL from DB
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url); // Cleanup memory
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onChange(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof value === "string" && onRemoveExisting) {
      onRemoveExisting();
    }
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {previewUrl ? (
        <div className="relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden border border-border/80 group bg-muted/30 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Poster preview"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110"
              title="Change Image"
            >
              <UploadCloud className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="w-11 h-11 rounded-full bg-red-500/80 hover:bg-red-500 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110"
              title="Remove Image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full h-36 rounded-3xl border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 text-muted-foreground hover:text-primary shadow-sm",
            disabled && "opacity-50 pointer-events-none",
          )}
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ImagePlus className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            Add poster (optional)
          </span>
        </div>
      )}
    </div>
  );
}
