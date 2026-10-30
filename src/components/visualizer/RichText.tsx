import { Fragment } from "react";
import { cn } from "@/lib/utils";

/** Text with `backtick` spans rendered as inline code. */
export function RichText({ text, codeClassName }: { text: string; codeClassName?: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
          <code key={index} className={cn("rounded bg-slate-950/70 px-1 py-0.5 font-code text-[0.92em] text-cyan-100", codeClassName)}>
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
