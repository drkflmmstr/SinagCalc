"use client";
// components/results/ExplainerCard.tsx
// Renders the AI explanation with language toggle, streaming typewriter
// effect, and graceful fallback states.

import { useEffect } from "react";
import clsx from "clsx";
import { useExplainer } from "@/hooks/useExplainer";
import type { CalculationResponse, ExplainLanguage } from "@/lib/types";

interface Props {
  result: CalculationResponse;
}

const LANG_OPTIONS: { value: ExplainLanguage; label: string; flag: string }[] = [
  { value: "english",  label: "English",  flag: "🇬🇧" },
  { value: "filipino", label: "Filipino", flag: "🇵🇭" },
];

export default function ExplainerCard({ result }: Props) {
  const {
    text, language, streaming, done, error,
    setLanguage, explain, reset,
  } = useExplainer();

  // When language changes mid-stream, reset so user can re-generate
  useEffect(() => {
    reset();
  }, [language, reset]);

  const idle       = !streaming && !done && !error && text === "";
  const hasContent = text.length > 0;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 overflow-hidden shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-violet-100 bg-white/60">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">✨</span>
          <div>
            <h3 className="font-serif text-base text-soil">AI Explanation</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Powered by Gemini · Plain-language summary of your results
            </p>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex rounded-xl overflow-hidden border border-violet-200 bg-white">
          {LANG_OPTIONS.map(({ value, label, flag }) => (
            <button
              key={value}
              onClick={() => setLanguage(value)}
              disabled={streaming}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                language === value
                  ? "bg-violet-600 text-white"
                  : "text-gray-500 hover:bg-violet-50 disabled:opacity-50"
              )}
            >
              <span>{flag}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">

        {/* Idle state — show the trigger button */}
        {idle && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              {language === "filipino"
                ? "Gusto mo bang ipaliwanag ng AI ang iyong mga resulta sa simpleng salita?"
                : "Want the AI to explain your results in plain, simple language?"}
            </p>
            <button
              onClick={() => explain(result)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-violet-600 text-white text-sm font-semibold
                         hover:bg-violet-700 transition-colors shadow-sm
                         shadow-violet-200"
            >
              <span>✨</span>
              {language === "filipino" ? "Ipaliwanag ang Aking Mga Resulta" : "Explain My Results"}
            </button>
          </div>
        )}

        {/* Streaming / done state — show the text */}
        {hasContent && (
          <div className="space-y-4">
            <div className="space-y-3 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
              {(paragraphs.length > 0 ? paragraphs : [text]).map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>
                  {paragraph}
                </p>
              ))}
              {/* Blinking cursor while streaming */}
              {streaming && (
                <span className="inline-block w-0.5 h-4 bg-violet-500 ml-0.5 animate-pulse align-middle" />
              )}
            </div>

            {done && (
              <div className="flex items-center justify-between pt-2 border-t border-violet-100">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span>✨</span> Powered by Google Gemini
                </p>
                <button
                  onClick={() => explain(result)}
                  className="text-xs text-violet-600 font-medium hover:underline"
                >
                  {language === "filipino" ? "Gumawa ng bagong paliwanag" : "Regenerate"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading — stream starting */}
        {streaming && !hasContent && (
          <div className="flex items-center gap-3 py-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              {language === "filipino" ? "Isinasalita ng AI ang iyong mga resulta…" : "AI is reading your results…"}
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 space-y-2">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => explain(result)}
              className="text-xs font-medium text-red-500 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
