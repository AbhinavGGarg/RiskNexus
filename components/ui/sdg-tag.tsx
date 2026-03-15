import { SdgTag } from "@/lib/types";

export function SdgTagPill({ tag }: { tag: SdgTag }) {
  return (
    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100">
      SDG {tag.id} - {tag.title}
    </span>
  );
}
