import { Suspense } from "react";
import { InboxShell } from "@/app/components/inbox/inbox-shell";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <InboxShell />
    </Suspense>
  );
}
