"use client";

import { useState, useCallback } from "react";

interface CsvDropzoneProps {
  onFileLoaded: (text: string, fileName: string) => void;
}

export default function CsvDropzone({ onFileLoaded }: CsvDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileLoaded(text, file.name);
      };
      // Try Shift_JIS first (common for Japanese financial CSVs), fallback to UTF-8
      reader.readAsText(file, "Shift_JIS");
    },
    [onFileLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
        isDragging
          ? "border-blue-400 bg-blue-500/10"
          : "border-gray-700 hover:border-gray-500 bg-[#1a1d27]"
      }`}
      onClick={() => document.getElementById("csv-input")?.click()}
    >
      <input
        id="csv-input"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileInput}
      />
      <div className="text-4xl mb-3">📄</div>
      {fileName ? (
        <p className="text-green-400 font-medium">{fileName} を読み込みました</p>
      ) : (
        <>
          <p className="text-gray-300 font-medium">CSVファイルをドラッグ&ドロップ</p>
          <p className="text-gray-500 text-sm mt-1">またはクリックしてファイルを選択</p>
        </>
      )}
    </div>
  );
}
