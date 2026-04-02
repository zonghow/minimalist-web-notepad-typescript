"use client";

import { useEffect, useRef, useState } from "react";

type NotepadProps = {
  initialContent: string;
  maxNoteLengthBytes: number;
  note: string;
};

type SaveState = "idle" | "saving" | "success" | "error";

const MINIMUM_PROGRESS_VISIBILITY_MS = 400;
const SUCCESS_PROGRESS_VISIBILITY_MS = 220;
const ERROR_PROGRESS_VISIBILITY_MS = 700;
const textEncoder = new TextEncoder();

function getByteLength(text: string): number {
  return textEncoder.encode(text).length;
}

export function Notepad({ initialContent, maxNoteLengthBytes, note }: NotepadProps) {
  const [value, setValue] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const printableRef = useRef<HTMLPreElement>(null);
  const savedContentRef = useRef(initialContent);
  const valueRef = useRef(initialContent);
  const progressStartedAtRef = useRef(0);
  const hideProgressTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    valueRef.current = value;

    if (printableRef.current) {
      printableRef.current.textContent = value;
    }
  }, [value]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const clearHideProgressTimeout = () => {
      if (hideProgressTimeoutRef.current) {
        clearTimeout(hideProgressTimeoutRef.current);
        hideProgressTimeoutRef.current = undefined;
      }
    };

    const showProgress = () => {
      clearHideProgressTimeout();
      progressStartedAtRef.current = Date.now();
      setSaveState("saving");
    };

    const finishProgress = (nextState: Exclude<SaveState, "idle" | "saving">) => {
      const minimumVisibleForRequest = Math.max(MINIMUM_PROGRESS_VISIBILITY_MS - (Date.now() - progressStartedAtRef.current), 0);
      const feedbackVisibleForState = nextState === "success" ? SUCCESS_PROGRESS_VISIBILITY_MS : ERROR_PROGRESS_VISIBILITY_MS;

      hideProgressTimeoutRef.current = setTimeout(() => {
        setSaveState(nextState);

        hideProgressTimeoutRef.current = setTimeout(() => {
          setSaveState("idle");
          hideProgressTimeoutRef.current = undefined;
        }, feedbackVisibleForState);
      }, minimumVisibleForRequest);
    };

    const scheduleNext = () => {
      timeoutId = setTimeout(syncContent, 1000);
    };

    const syncContent = async () => {
      const nextValue = valueRef.current;

      if (savedContentRef.current !== nextValue) {
        if (getByteLength(nextValue) > maxNoteLengthBytes) {
          clearHideProgressTimeout();
          setSaveState("idle");
          scheduleNext();
          return;
        }

        showProgress();
        setSaveErrorMessage(null);

        try {
          const response = await fetch(`/api/${encodeURIComponent(note)}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: `text=${encodeURIComponent(nextValue)}`,
          });

          if (response.ok) {
            savedContentRef.current = nextValue;
            finishProgress("success");
          } else {
            if (response.status === 413) {
              setSaveErrorMessage(await response.text());
            }

            finishProgress("error");
          }
        } catch {
          finishProgress("error");
        }
      }

      scheduleNext();
    };

    scheduleNext();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      clearHideProgressTimeout();
    };
  }, [maxNoteLengthBytes, note]);

  const currentByteLength = getByteLength(value);
  const isOverLimit = currentByteLength > maxNoteLengthBytes;
  const byteCounterClassName = isOverLimit
    ? "byte-counter is-over-limit"
    : currentByteLength >= maxNoteLengthBytes * 0.9
      ? "byte-counter is-near-limit"
      : "byte-counter";
  const byteCounterText = `${currentByteLength} / ${maxNoteLengthBytes} 字节`;
  const saveMessage = isOverLimit
    ? `已超过 ${maxNoteLengthBytes} 字节，已暂停自动保存。恢复到限制内后会自动继续保存。`
    : saveErrorMessage;
  const progressClassName = saveState === "idle" ? "save-progress" : `save-progress is-visible is-${saveState}`;

  return (
    <>
      <div aria-hidden="true" className={progressClassName}>
        <div className="save-progress-bar" />
      </div>
      {saveMessage ? (
        <p aria-live="polite" className="save-message" role="alert">
          {saveMessage}
        </p>
      ) : null}
      <div className="container">
        <div aria-live="polite" className={byteCounterClassName}>
          {byteCounterText}
        </div>
        <textarea id="content" onChange={(event) => setValue(event.target.value)} ref={textareaRef} value={value} />
      </div>
      <pre id="printable" ref={printableRef} />
    </>
  );
}
