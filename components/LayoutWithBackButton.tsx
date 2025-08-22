"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react"; // Tailwind + Lucide icon

export default function LayoutWithBackButton({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";

  return (
    <div className="min-h-screen relative">
      <main className="pb-16">{children}</main>

      {/* ✅ Back button - hidden on /dashboard */}
      {!isDashboard && (
        <div className="sticky bottom-4 left-0 z-50 pl-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-2xl shadow-md hover:bg-gray-700 sm:px-3 sm:py-2 sm:rounded-full"
          >
            {/* Icon only on small screens, icon+text on larger */}
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      )}
    </div>
  );
}
