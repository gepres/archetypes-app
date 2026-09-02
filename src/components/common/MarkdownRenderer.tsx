import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-[#C5CFC7] font-sans">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-serif text-base sm:text-lg font-bold text-[#F2EFE6] mt-3.5 mb-1.5 border-b border-[#23332D] pb-1 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-sm sm:text-base font-bold text-[#D6A84F] mt-3 mb-1 flex items-center gap-1.5">
              <span className="text-xs text-[#D6A84F]">✦</span>
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-xs sm:text-sm font-semibold text-[#F2EFE6] mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-[#C5CFC7]">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[#F2EFE6] bg-[#162520]/80 px-1 py-0.5 rounded border border-[#315C45]/40 text-[#E5D7B7]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#E5D7B7] font-serif">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2.5 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1.5 my-2.5 pl-4 marker:text-[#D6A84F] marker:font-bold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-xs sm:text-sm text-[#C5CFC7]">
              <span className="text-[#D6A84F] mt-1 shrink-0 text-[10px]">◆</span>
              <span className="flex-1 leading-relaxed">{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#D6A84F] pl-3 py-1.5 my-2.5 bg-[#0E1513] rounded-r-xl italic font-serif text-[#F2EFE6] text-xs sm:text-sm shadow-inner">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-[#0B1110] text-[#86EFAC] px-1.5 py-0.5 rounded text-xs font-mono border border-[#1E2A25]">
              {children}
            </code>
          ),
          hr: () => <hr className="border-[#23332D] my-3" />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
