"use client"

import type React from "react"
import { SWRConfig, mutate } from "swr"
import { useEffect } from "react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch")
  }
  return res.json()
}

export function SWRProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (!e.key) return
      if (e.key === "cgec_students") mutate("students")
      if (e.key === "cgec_attendance") mutate("attendance")
      if (e.key === "cgec_teachers") mutate("teachers")
      if (e.key === "cgec_notices") mutate("notices")
      if (e.key === "cgec_projects") mutate("projects")
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 2,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}
