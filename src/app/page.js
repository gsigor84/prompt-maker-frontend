"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import LoadingBar from "@/components/LoadingBar";

const SECTION_ORDER = [
  "ROLE / PERSONA",
  "CONTEXT",
  "TASK",
  "OUTPUT REQUIREMENTS",
  "PERMISSION TO FAIL",
];

// ---- helpers ----
function isLikelyJsonString(s) {
  if (!s || typeof s !== "string") return false;
  const t = s.trim();
  return (
    (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))
  );
}

function tryParseJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function toTitleCaseKey(key) {
  return String(key);
}

function valueToPlainText(value, indent = 0) {
  const pad = "  ".repeat(indent);

  if (value == null) return "";
  if (typeof value === "string") return pad + value;
  if (typeof value === "number" || typeof value === "boolean") return pad + String(value);

  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
          return `${pad}- ${String(v)}`;
        }
        const inner = valueToPlainText(v, indent + 1);
        return `${pad}-\n${inner}`;
      })
      .join("\n");
  }

  return Object.entries(value)
    .map(([k, v]) => {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        return `${pad}${toTitleCaseKey(k)}: ${String(v)}`;
      }
      const keyLine = `${pad}${toTitleCaseKey(k)}:`;
      const body = valueToPlainText(v, indent + 1);
      return body ? `${keyLine}\n${body}` : keyLine;
    })
    .join("\n");
}

function splitPlainPrompt(text) {
  const sections = [];
  const t = text.replace(/\r\n/g, "\n");
  const headingRegex =
    /^(ROLE \/ PERSONA|CONTEXT|TASK|OUTPUT REQUIREMENTS|PERMISSION TO FAIL)\s*:\s*$/gm;

  let match;
  const indices = [];

  while ((match = headingRegex.exec(t)) !== null) {
    indices.push({ name: match[1], index: match.index, end: headingRegex.lastIndex });
  }

  if (indices.length === 0) {
    return [{ title: "PROMPT", content: t.trim() }];
  }

  for (let i = 0; i < indices.length; i++) {
    const current = indices[i];
    const next = indices[i + 1];
    const startContent = current.end;
    const endContent = next ? next.index : t.length;
    const content = t.slice(startContent, endContent).trim();
    sections.push({ title: current.name, content });
  }

  const ordered = [];
  for (const name of SECTION_ORDER) {
    const found = sections.find((s) => s.title === name);
    if (found) ordered.push(found);
  }
  for (const s of sections) {
    if (!ordered.some((o) => o.title === s.title)) ordered.push(s);
  }
  return ordered;
}

function normalizePromptToSections(promptText) {
  if (!promptText) return { mode: "none", sections: [], raw: "" };

  if (isLikelyJsonString(promptText)) {
    const obj = tryParseJson(promptText);
    if (obj && typeof obj === "object") {
      const keys = Object.keys(obj);
      const isSectioned = keys.some((k) => SECTION_ORDER.includes(k));

      if (isSectioned) {
        const sections = [];
        for (const k of SECTION_ORDER) {
          if (k in obj) sections.push({ title: k, value: obj[k] });
        }
        for (const k of keys) {
          if (!SECTION_ORDER.includes(k)) sections.push({ title: k, value: obj[k] });
        }
        return { mode: "json_sections", sections, raw: promptText };
      }

      return {
        mode: "json_generic",
        sections: [{ title: "GENERATED PROMPT", value: obj }],
        raw: promptText,
      };
    }
  }

  return { mode: "plain_text", sections: splitPlainPrompt(promptText), raw: promptText };
}

function RenderValue({ value }) {
  if (value == null) return null;

  if (typeof value === "string") {
    return (
      <p className="whitespace-pre-wrap break-words break-all overflow-hidden text-sm leading-relaxed text-neutral-900">
        {value}
      </p>
    );
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return (
      <p className="break-words break-all overflow-hidden text-sm leading-relaxed text-neutral-900">
        {String(value)}
      </p>
    );
  }

  if (Array.isArray(value)) {
    return (
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-neutral-900">
        {value.map((item, idx) => (
          <li key={idx} className="break-words break-all overflow-hidden">
            <RenderValue value={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-2 space-y-3">
      {Object.entries(value).map(([k, v]) => (
        <div key={k} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 md:p-4">
          <div className="text-xs font-semibold tracking-widest text-neutral-500 break-words break-all">
            {toTitleCaseKey(k)}
          </div>
          <div className="mt-2">
            <RenderValue value={v} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [task, setTask] = useState("");
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const parsed = useMemo(() => normalizePromptToSections(promptText), [promptText]);

  const makePrompt = async () => {
    if (!task.trim() || loading) return;

    setLoading(true);
    setPromptText("");
    setCopied(false);
    setShowRaw(false);

    try {
      const res = await fetch("https://prompt-maker-backend.fly.dev/api/prompt/full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Backend error");
      }

      const data = await res.json();
      setPromptText(data?.prompt ?? "No prompt returned.");
    } catch {
      setPromptText("Error generating prompt. Please check backend availability.");
    } finally {
      setLoading(false);
    }
  };

  const buildCopyText = () => {
    if (!promptText) return "";

    if (parsed.mode === "json_sections" || parsed.mode === "json_generic") {
      return parsed.sections
        .map((s) => {
          const title = s.title;
          const body = valueToPlainText(s.value ?? s.content ?? "", 0).trim();
          return `${title}:\n${body}`;
        })
        .join("\n\n");
    }

    return promptText;
  };

  const copyPrompt = async () => {
    const text = buildCopyText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      return;
    } catch {
      // fallback
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);

      if (!ok) throw new Error("execCommand failed");

      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("Copy failed. Please select and copy manually.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-neutral-950 px-4 py-12 md:py-16">
      {/* background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 -top-24 h-[520px] w-[520px] rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute right-[-140px] top-10 h-[560px] w-[560px] rounded-full bg-blue-500/20 blur-[130px]" />
        <div className="absolute left-1/2 top-[55%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Image
            src="/logo_prompt.jpg"
            alt="PromptForge logo"
            width={44}
            height={44}
            priority
            style={{ width: "44px", height: "auto" }}
          />

          <div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
              PromptForge
            </h1>
            <p className="mt-2 max-w-2xl text-base md:text-lg text-white/70">
              Type a task → click Make Prompt → get a ready-to-use AI prompt.
            </p>
          </div>
        </div>

        {/* White canvas */}
        <section className="mt-8 md:mt-10 bg-neutral-50 p-5 md:p-10">
          <div className="mx-auto max-w-3xl">
            {/* Input bar */}
            <div className="flex items-center rounded-2xl md:rounded-full border border-neutral-300 bg-white px-2 py-2 transition hover:border-neutral-400">
              <button
                onClick={makePrompt}
                disabled={loading}
                className="ml-1 inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-4 text-xs font-semibold tracking-widest text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "WORKING…" : "MAKE PROMPT"}
              </button>

              {/* iOS zoom fix: text-base (16px) on mobile */}
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Type what you want the AI to do…"
                className="
                  w-full bg-transparent px-4
                  text-base md:text-sm text-neutral-900 placeholder:text-neutral-400
                  outline-none resize-none

                  h-28 py-3 leading-snug
                  md:h-10 md:py-2 md:leading-[1.25rem]
                "
              />
            </div>

            {loading && <LoadingBar />}

            {/* Output */}
            {promptText && !loading && (
              <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold tracking-widest text-neutral-500">
                    GENERATED PROMPT
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowRaw((v) => !v)}
                      className="text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:opacity-80"
                    >
                      {showRaw ? "Pretty view" : "Raw"}
                    </button>

                    <button
                      onClick={copyPrompt}
                      className="text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:opacity-80"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Raw view */}
                {showRaw ? (
                  <pre className="mt-3 whitespace-pre-wrap break-words break-all overflow-hidden text-sm leading-relaxed text-neutral-900">
                    {promptText}
                  </pre>
                ) : (
                  <div className="mt-4 space-y-5">
                    {parsed.mode === "plain_text" &&
                      parsed.sections.map((s) => (
                        <div key={s.title} className="rounded-xl border border-neutral-200 p-4 md:p-5">
                          <div className="text-xs font-semibold tracking-widest text-neutral-500">
                            {s.title}
                          </div>
                          <div className="mt-2">
                            <p className="whitespace-pre-wrap break-words break-all overflow-hidden text-sm leading-relaxed text-neutral-900">
                              {s.content}
                            </p>
                          </div>
                        </div>
                      ))}

                    {(parsed.mode === "json_sections" || parsed.mode === "json_generic") &&
                      parsed.sections.map((s) => (
                        <div key={s.title} className="rounded-xl border border-neutral-200 p-4 md:p-5">
                          <div className="text-xs font-semibold tracking-widest text-neutral-500">
                            {s.title}
                          </div>
                          <div className="mt-2">
                            <RenderValue value={s.value} />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
