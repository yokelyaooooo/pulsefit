"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-3 py-10">
      <h1 className="text-2xl font-semibold">这一页没有加载出来</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        {error.message || "出了点问题。重试一次，通常就能回来。"}
      </p>
      <Button onClick={reset}>重试</Button>
    </div>
  );
}
