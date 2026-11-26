import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  "🧒": "",
  "📖": "",
  "💻": "",
  "📚": "",
  "⚖": "",
  "🎯": "",
  "🪤": "",
  "📝": "",
  "🔁": "",
};

const TONES: Record<string, string> = {
  blue: "bg-sky-400/[0.07]",
  yellow: "bg-yellow-400/[0.07]",
  purple: "bg-violet-400/[0.07]",
  gray: "bg-slate-500/[0.07]",
  green: "bg-emerald-400/[0.07]",
  red: "bg-red-400/[0.07]",
  orange: "bg-orange-400/[0.07]",
  pink: "bg-pink-400/[0.07]",
  brown: "bg-amber-700/[0.07]",
  default: "bg-slate-500/[0.07]",
};

function firstChild(children: ReactNode): ReactNode {
  return Children.toArray(children)[0];
}

/** Does this text start with a note-writer section emoji ("🧒 LIKE I'M 5", ...)? */
function isSectionLabel(node: ReactNode): boolean {
  if (typeof node !== "string" || !node) return false;
  return LABELS[String.fromCodePoint(node.codePointAt(0) ?? 0)] !== undefined;
}

/** Body text size, shared by every block so all study pages read the same. */
const BODY = "text-[0.9375rem] leading-[1.7]";

/** Small uppercase style for a section label that sits on its own line. */
const LABEL = "nb-label mt-6 text-xs font-semibold uppercase leading-5 tracking-wider text-slate-400";

const components: Components = {
  h1: ({ node, ...props }) => (
    <h1 {...props} className="mt-8 mb-3 scroll-mt-20 font-body text-[1.5rem] font-semibold leading-tight tracking-tight text-slate-50" />
  ),
  h2: ({ node, ...props }) => (
    <h2
      {...props}
      className="mt-11 mb-3 scroll-mt-20 font-body text-[1.375rem] font-semibold leading-tight tracking-tight text-slate-50"
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      {...props}
      className="mt-8 mb-2 scroll-mt-20 font-body text-[1.125rem] font-semibold leading-snug tracking-tight text-slate-100"
    />
  ),
  h4: ({ node, children, ...props }) =>
    // A section label written as a heading looks the same as one written as a plain line.
    isSectionLabel(firstChild(children)) ? (
      <p className={LABEL}>{children}</p>
    ) : (
      <h4 {...props} className="mt-6 mb-2 scroll-mt-20 font-body text-base font-semibold text-slate-100">
        {children}
      </h4>
    ),
  p: ({ node, children, ...props }) => {
    const first = firstChild(children);

    // Section labels written by the note writer: "🧒 LIKE I'M 5", "📖 EXPLAINED SIMPLY", ...
    if (isSectionLabel(first)) {
      // Label on its own line, body in the next block.
      if (Children.count(children) === 1 && (first as string).length < 48) {
        return <p {...props} className={LABEL}>{children}</p>;
      }
      // Label and body in one block: only the first line is the label.
      return (
        <p
          {...props}
          className={cn(
            "mt-6 mb-2 text-slate-200 [&::first-line]:text-xs [&::first-line]:font-semibold [&::first-line]:uppercase [&::first-line]:tracking-wider [&::first-line]:text-slate-400",
            BODY
          )}
        >
          {children}
        </p>
      );
    }

    // "Answer: A. ..." lines under practice questions
    if (isValidElement(first)) {
      const inner = (first.props as { children?: ReactNode }).children;
      if (typeof inner === "string" && /^Answer\b/i.test(inner)) {
        return (
          <p
            {...props}
            className={cn("my-3 rounded-xl bg-emerald-400/10 px-4 py-2.5 text-slate-200", BODY)}
          >
            {children}
          </p>
        );
      }
    }

    return <p {...props} className={cn("my-3 text-slate-200", BODY)}>{children}</p>;
  },
  ul: ({ node, className, ...props }) => {
    const isTasks = typeof className === "string" && className.includes("contains-task-list");
    return (
      <ul
        {...props}
        className={cn(
          "my-3 space-y-1 text-slate-200",
          BODY,
          isTasks ? "list-none pl-0" : "list-disc pl-6 marker:text-slate-500"
        )}
      />
    );
  },
  ol: ({ node, ...props }) => (
    <ol {...props} className={cn("my-3 list-decimal space-y-1 pl-6 text-slate-200 marker:text-slate-500", BODY)} />
  ),
  li: ({ node, className, ...props }) => (
    <li
      {...props}
      className={cn("leading-relaxed", typeof className === "string" && className.includes("task-list-item") && "flex items-start gap-2")}
    />
  ),
  input: ({ node, type, checked }) =>
    type === "checkbox" ? (
      <span aria-label={checked ? "done" : "not done"} className="mt-0.5 select-none">
        {checked ? "✅" : "⬜"}
      </span>
    ) : null,
  a: ({ node, href = "", children, ...props }) =>
    href.startsWith("/") ? (
      <Link href={href} className="text-sky-300 underline decoration-sky-300/40 underline-offset-[3px] hover:decoration-sky-300">
        {children}
      </Link>
    ) : (
      <a {...props} href={href} target="_blank" rel="noopener noreferrer" className="text-sky-300 underline decoration-sky-300/40 underline-offset-[3px] hover:decoration-sky-300">
        {children}
      </a>
    ),
  strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-slate-100" />,
  b: ({ node, ...props }) => <b {...props} className="font-semibold text-slate-100" />,
  em: ({ node, ...props }) => <em {...props} className="text-slate-200" />,
  hr: () => <hr className="my-10 border-slate-700/60" />,
  blockquote: ({ node, ...props }) => (
    <blockquote {...props} className="my-5 rounded-xl bg-slate-800/40 px-4 py-3 text-slate-300" />
  ),
  code: ({ node, className, children, ...props }) => {
    const isBlock = typeof className === "string" && className.includes("language-");
    return isBlock ? (
      <code {...props} className={cn(className, "font-code text-[0.8125rem]")}>{children}</code>
    ) : (
      <code {...props} className="rounded-md border border-slate-700/60 bg-slate-800/70 px-1.5 py-px font-code text-[0.88em] text-slate-100">
        {children}
      </code>
    );
  },
  pre: ({ node, ...props }) => (
    <pre {...props} className="my-4 overflow-x-auto rounded-lg border border-slate-700/60 bg-slate-950 p-4 text-slate-200" />
  ),
  table: ({ node, ...props }) => (
    <div className="my-5 overflow-x-auto rounded-lg border border-slate-700/60">
      <table {...props} className="w-full min-w-[32rem] border-collapse text-left text-sm leading-relaxed" />
    </div>
  ),
  thead: ({ node, ...props }) => <thead {...props} className="bg-slate-800/50 text-slate-100" />,
  th: ({ node, ...props }) => <th {...props} className="border-b border-slate-700/60 px-3 py-2 font-semibold" />,
  td: ({ node, ...props }) => (
    <td {...props} className="border-b border-slate-800 px-3 py-2 align-top text-slate-300" />
  ),
  div: ({ node, className, children, ...props }) => {
    if (typeof className === "string" && className.includes("nb-callout")) {
      const p = (node?.properties ?? {}) as Record<string, unknown>;
      const icon = String(p.dataIcon ?? "💡");
      const tone = TONES[String(p.dataTone ?? "default")] ?? TONES.default;
      return (
        <div className={cn("my-6 flex gap-3 rounded-xl border border-slate-700/50 px-4 py-3", tone)}>
          {icon ? (
            <span className="text-lg leading-6" aria-hidden>
              {icon}
            </span>
          ) : null}
          <div className={cn("min-w-0 flex-1 [&>p]:my-1 [&>p]:text-slate-200", BODY)}>{children}</div>
        </div>
      );
    }
    return (
      <div {...props} className={className}>
        {children}
      </div>
    );
  },
};

/** Drawn checkbox for pages shown without emoji. */
const plainComponents: Components = {
  ...components,
  input: ({ node, type, checked }) =>
    type === "checkbox" ? (
      <span
        role="img"
        aria-label={checked ? "done" : "not done"}
        className={cn(
          "mt-[0.3rem] inline-flex h-3.5 w-3.5 shrink-0 select-none items-center justify-center rounded border text-[0.625rem] leading-none",
          checked ? "border-emerald-400 text-emerald-300" : "border-slate-600"
        )}
      >
        {checked ? "✓" : null}
      </span>
    ) : null,
};

export function Markdown({ children, noEmoji = false }: { children: string; noEmoji?: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSlug]}
      disallowedElements={["script", "style", "iframe", "object", "embed"]}
      components={noEmoji ? plainComponents : components}
    >
      {children}
    </ReactMarkdown>
  );
}
