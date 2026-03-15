import { Suspense } from "react";
import CascadePageClient from "@/app/cascade/cascade-page-client";
import { Panel } from "@/components/ui/panel";

export default function CascadePage() {
  return (
    <Suspense
      fallback={
        <Panel>
          <p className="text-slate-200">Loading cascade simulation...</p>
        </Panel>
      }
    >
      <CascadePageClient />
    </Suspense>
  );
}
