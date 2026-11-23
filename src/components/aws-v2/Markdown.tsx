import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  "🧒": "border-pink-400/70 bg-pink-400/5",
  "📖": "border-sky-400/70 bg-sky-400/5",
  "📚": "border-violet-400/70 bg-violet-400/5",
  "⚖": "border-amber-400/70 bg-amber-400/5",
  "🎯": "border-emerald-400/70 bg-emerald-400/5",
  "🪤": "border-red-400/70 bg-red-400/5",
  "📝": "border-cyan-400/70 bg-cyan-400/5",
  "🔁": "border-slate-400/70 bg-slate-400/5",
};

const TONES: Record<string, string> = {
  blue: "border-sky-400/70 bg-sky-400/5",
  yellow: "border-yellow-400/70 bg-yellow-400/5",
  purple: "border-violet-400/70 bg-violet-400/5",
  gray: "border-slate-500/70 bg-slate-500/5",
  green: "border-emerald-400/70 bg-emerald-400/5",
  red: "border-red-400/70 bg-red-400/5",
  orange: "border-orange-400/70 bg-orange-400/5",
  pink: "border-pink-400/70 bg-pink-400/5",
  brown: "border-amber-700/70 bg-amber-700/5",
  default: "border-slate-500/70 bg-slate-500/5",
};

function firstChild(children: ReactNode): ReactNode {
  return Children.toArray(children)[0];
}

const components: Components = {
  h1: ({ node, ...props }) => (
    <h1 {...props} className="mt-10 mb-4 scroll-mt-20 font-body text-[2rem] font-semibold leading-tight tracking-tight text-slate-50" />
  ),
  h2: ({ node, ...props }) => (
    <h2
      {...props}
      className="mt-14 mb-4 scroll-mt-20 font-body text-[1.65rem] font-semibold leading-tight tracking-tight text-slate-50"
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      {...props}
      className="mt-10 mb-3 scroll-mt-20 font-body text-[1.3rem] font-semibold leading-snug tracking-tight text-slate-100"
    />
  ),
  h4: ({ node, ...props }) => (
    <h4 {...props} className="mt-6 mb-2 scroll-mt-20 font-body text-[1.1rem] font-semibold text-slate-100" />
  ),
  p: ({ node, children, ...props }) => {
    const first = firstChild(children);

    // Section labels written by the note writer: "🧒 LIKE I'M 5", "📖 EXPLAINED SIMPLY", ...
    if (typeof first === "string") {
      const cp = String.fromCodePoint(first.codePointAt(0) ?? 0);
      const tone = LABELS[cp];
      if (tone) {
        return (
          <p
            {...props}
            className={cn(
              "mt-6 mb-2 border-l-2 py-0.5 pl-4 text-[1.0625rem] leading-[1.75] text-slate-200 [&::first-line]:text-[0.8rem] [&::first-line]:font-semibold [&::first-line]:uppercase [&::first-line]:tracking-wider [&::first-line]:text-slate-400",
              tone
            )}
          >
            {children}
          </p>
        );
      }
    }

    // "Answer: A. ..." lines under practice questions
    if (isValidElement(first)) {
      const inner = (first.props as { children?: ReactNode }).children;
      if (typeof inner === "string" && /^Answer\b/i.test(inner)) {
        return (
          <p
            {...props}
            className="my-3 rounded-md border-l-2 border-emerald-400/70 bg-emerald-400/5 px-4 py-2.5 text-[1.0625rem] leading-[1.75] text-slate-200"
          >
            {children}
          </p>
        );
      }
    }

    return <p {...props} className="my-4 text-[1.0625rem] leading-[1.75] text-slate-200">{children}</p>;
  },
  ul: ({ node, className, ...props }) => {
    const isTasks = typeof className === "string" && className.includes("contains-task-list");
    return (
      <ul
        {...props}
        className={cn(
          "my-4 space-y-1.5 text-[1.0625rem] leading-[1.75] text-slate-200",
          isTasks ? "list-none pl-0" : "list-disc pl-6 marker:text-slate-500"
        )}
      />
    );
  },
  ol: ({ node, ...props }) => (
    <ol {...props} className="my-4 list-decimal space-y-1.5 pl-6 text-[1.0625rem] leading-[1.75] text-slate-200 marker:text-slate-500" />
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
    <blockquote {...props} className="my-5 border-l-2 border-slate-500 pl-4 text-slate-300" />
  ),
  code: ({ node, className, children, ...props }) => {
    const isBlock = typeof className === "string" && className.includes("language-");
    return isBlock ? (
      <code {...props} className={cn(className, "font-code text-sm")}>{children}</code>
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
      <table {...props} className="w-full min-w-[32rem] border-collapse text-left text-[0.95rem]" />
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
        <div className={cn("my-6 flex gap-3 rounded-lg border-l-2 px-4 py-3", tone)}>
          <span className="text-xl leading-7" aria-hidden>
            {icon}
          </span>
          <div className="min-w-0 flex-1 text-[1.0625rem] leading-[1.75] [&>p]:my-1 [&>p]:text-slate-200">{children}</div>
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

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSlug]}
      disallowedElements={["script", "style", "iframe", "object", "embed"]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
