"use client"

import type React from "react"
import { SWRConfig } from "swr"

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  })
  if (!res.ok) {
    throw new Error("Failed to fetch")
  }
  return res.json()
}

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        dedupingInterval: 1000,
        errorRetryCount: 3,
        keepPreviousData: true,
        refreshInterval: 3000, // Re-fetch every 3 seconds for instant cross-device sync
      }}
    >
      {children}
    </SWRConfig>
  )
}
