"use client"

import { useEffect, useState } from "react"
import DotLottieIcon from '@/components/DotLottieIcon'

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
  return String(n)
}

export default function GithubStarButton() {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    fetch("https://api.github.com/repos/Jeelislive/Github-Analyzer")
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => {
        if (mounted && typeof data?.stargazers_count === "number") {
          setStars(data.stargazers_count)
        }
      })
      .catch(() => {
        // Fallback to a minimal default or leave null
        if (mounted) setStars(null)
      })
    return () => { mounted = false }
  }, [])

  return (
    <a
      href="https://github.com/Jeelislive/Github-Analyzer"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open GitHub repository"
      className="group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm text-muted-foreground hover:text-primary transition-colors"
    >
      <span className="inline-flex items-center justify-center" style={{ width: 64, height: 64 }}>
        <DotLottieIcon src="/icons/Loader-cat.lottie" size={64} />
      </span>
      {stars !== null && (
        <span className="tabular-nums text-base md:text-lg leading-none -ml-0.5 self-center pt-0.5">{formatCount(stars)}</span>
      )}
    </a>
  )
}
