import { Suspense } from "react";
import { InboxShell } from "@/app/components/inbox/inbox-shell";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <InboxShell />
    </Suspense>
  );
}
