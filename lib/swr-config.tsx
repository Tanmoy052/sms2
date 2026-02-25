"use client"

import type React from "react"
import { SWRConfig } from "swr"

const fetcher = async (url: string) => {
  const res = await fetch(url)
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
        dedupingInterval: 2000,
        errorRetryCount: 3,
        keepPreviousData: true,
        refreshInterval: 10000, // Re-fetch every 10 seconds for cross-device sync
      }}
    >
      {children}
    </SWRConfig>
  )
}
