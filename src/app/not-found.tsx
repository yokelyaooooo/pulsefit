import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="space-y-3 py-10">
      <h1 className="text-2xl font-semibold">没有这一页</h1>
      <p className="text-sm text-muted-foreground">回到首页，挑一轮训练开始。</p>
      <Button asChild>
        <Link href="/">回首页</Link>
      </Button>
    </div>
  );
}
