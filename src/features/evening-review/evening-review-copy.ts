export function reviewTitle(openTodayCount: number): string {
  if (openTodayCount === 0) return "今天已经很完整。";
  if (openTodayCount === 1) return "今天还有 1 件事，要交给明天吗？";
  return `今天还剩 ${openTodayCount} 件事，要交给明天吗？`;
}

export const eveningReviewCopy = {
  keep: "先放着",
  move: "移到明天",
  moveAll: "全部交给明天",
  complete: "标记完成",
  abandon: "放弃这件事",
  done: "今天可以收起来了。",
  empty: "今天已经很完整。",
  quiet: "不用急，它会在这里。"
} as const;
