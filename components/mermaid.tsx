"use client";

import { useEffect, useState } from "react";

/**
 * MDX 里的 ```mermaid 代码块渲染器。
 *
 * 必须客户端渲染（mermaid 依赖浏览器 DOM/SVG）。动态 import 让
 * 没有图表的页面不加载 mermaid chunk。渲染失败降级为错误提示文本。
 */
export function Mermaid({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          fontFamily: "var(--font-sans), ui-sans-serif, system-ui",
          flowchart: { htmlLabels: true, curve: "basis" },
        });
        const id = `mmd-${Math.random().toString(36).slice(2, 10)}`;
        const { svg: rendered } = await mermaid.render(id, code);
        if (!cancelled) setSvg(rendered);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (failed) {
    return (
      <p className="mt-8 rounded border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        图表渲染失败（mermaid 语法可能有误）。
      </p>
    );
  }

  return (
    <div
      className="mermaid-wrapper mt-8 overflow-x-auto rounded border border-[var(--line)] bg-white p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
