import { useCallback, useEffect, useRef, useState } from 'react';

/** Copies text and flips `copied` true for `resetAfterMs`. Falls back to the
 *  off-screen textarea + execCommand path on browsers that withhold the async
 *  clipboard API from insecure origins — plain `file://` or LAN preview. */
export function useCopyToClipboard(resetAfterMs = 1800) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const input = document.createElement('textarea');
          input.value = text;
          input.setAttribute('readonly', '');
          input.style.position = 'absolute';
          input.style.left = '-9999px';
          document.body.appendChild(input);
          input.select();
          try {
            document.execCommand('copy');
          } finally {
            document.body.removeChild(input);
          }
        }
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), resetAfterMs);
      } catch {
        setCopied(false);
      }
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
