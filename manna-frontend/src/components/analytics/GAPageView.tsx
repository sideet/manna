"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { getPageGroup, trackPageView } from "@/lib/analytics/ga";
import { useEffect } from "react";

export default function GAPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    trackPageView({
      url,
      pageGroup: getPageGroup(pathname),
    });
  }, [pathname, searchParams]);

  return null;
}
