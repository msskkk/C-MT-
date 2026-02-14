"use client";

import { useState } from "react";
import { AppIdea } from "@/data/apps";

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
    </div>
  );
}

export default function DemoArea({ app }: { app: AppIdea }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleProcess = () => {
    setIsProcessing(true);
    setShowResults(false);
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          {app.demoConfig.inputLabel}
        </h3>

        {app.demoType === "image-upload" || app.demoType === "file-upload" ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
            <div className="text-4xl mb-3">
              {app.demoType === "image-upload" ? "📷" : "📎"}
            </div>
            <p className="text-sm text-gray-500 mb-3">
              クリックまたはドラッグ&ドロップ
            </p>
            <input
              type="file"
              className="hidden"
              id={`file-${app.slug}`}
              accept={
                app.demoType === "image-upload"
                  ? "image/*"
                  : ".pdf,.doc,.docx,.txt"
              }
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFileName(file.name);
              }}
            />
            <label
              htmlFor={`file-${app.slug}`}
              className={`inline-block px-4 py-2 rounded-lg text-sm font-medium cursor-pointer bg-gradient-to-r ${app.color} text-white hover:opacity-90 transition-opacity`}
            >
              ファイルを選択
            </label>
            {fileName && (
              <p className="text-sm text-green-600 mt-2">
                選択済み: {fileName}
              </p>
            )}
          </div>
        ) : app.demoType === "text-input" ? (
          <textarea
            className="w-full border border-gray-300 rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            rows={4}
            placeholder={app.demoConfig.inputPlaceholder}
          />
        ) : (
          <div className="space-y-3">
            {app.demoConfig.fields?.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {field.name}
                </label>
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className={`mt-4 w-full py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r ${app.color} hover:opacity-90 transition-opacity disabled:opacity-50`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingDots /> AIが処理中...
            </span>
          ) : (
            `${app.emoji} AIで処理する`
          )}
        </button>
      </div>

      {/* Results Area */}
      {showResults && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {app.demoConfig.outputLabel}
          </h3>
          <div className="space-y-3">
            {app.demoConfig.mockResults.map((result, i) => (
              <div
                key={i}
                className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {result}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              📋 コピー
            </button>
            <button className="px-4 py-2 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              💾 ダウンロード
            </button>
            <button className="px-4 py-2 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              🔄 再生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
