"use client";

import { useMemo, useState } from "react";
import {
  bridgeLanguages,
  translatePseudocode,
  type BridgeLanguage,
} from "@/lib/language-bridge";

export default function LanguageBridge({ source }: { source: string }) {
  const [language, setLanguage] = useState<BridgeLanguage>("pseudocode");
  const translated = useMemo(
    () => translatePseudocode(source, language),
    [language, source],
  );

  return (
    <span className="language-bridge">
      <span className="language-bridge-toolbar">
        <span>Translation matrix</span>
        <span role="group" aria-label="Example language">
          {bridgeLanguages.map((option) => (
            <button
              type="button"
              key={option.id}
              aria-label={`Show ${option.longLabel}`}
              aria-pressed={language === option.id}
              onClick={() => setLanguage(option.id)}
            >
              {option.label}
            </button>
          ))}
        </span>
      </span>
      <code data-language={language}>{translated}</code>
      {language !== "pseudocode" ? (
        <small>
          Concept translation · real projects may choose different types and
          APIs.
        </small>
      ) : null}
    </span>
  );
}
