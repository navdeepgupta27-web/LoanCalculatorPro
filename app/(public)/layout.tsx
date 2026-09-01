import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ScrollProgress } from "@/components/layout/scroll-progress";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <ScrollProgress />
      {/* Bottom padding clears the mobile summary bar on the calculator pages. */}
      <main id="main" className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
