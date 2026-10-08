"use client"

import { useSyncExternalStore } from "react"

function subscribe(query: string, onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const mql = window.matchMedia(query)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => typeof window === 'undefined' ? false : window.matchMedia(query).matches,
    () => false,
  )
}
