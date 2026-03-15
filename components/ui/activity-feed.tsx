import { ActivityItem } from "@/lib/types";
import { formatRelativeMinutes } from "@/lib/utils";

export function ActivityFeed({
  items,
  activeTimestamp,
}: {
  items: ActivityItem[];
  activeTimestamp: number;
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const deltaMinutes = Math.max(1, Math.floor((activeTimestamp - item.timestamp) / 60000));

        return (
          <li
            key={item.id}
            className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 transition hover:border-cyan-200/30"
          >
            <p className="text-sm text-slate-100">{item.message}</p>
            <p className="mt-1 text-xs text-slate-400">
              {item.regionName} • {formatRelativeMinutes(deltaMinutes)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
