export const repoFrom = (repoUrl?: string): string => {
  if (!repoUrl) return ''
  const parts = repoUrl.split('/repos/')
  return parts[1] || ''
}

export const timeAgo = (iso: string, locale: string = 'en'): string => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  const divisions = [
    { amount: 60, unit: 'second' as const },
    { amount: 60, unit: 'minute' as const },
    { amount: 24, unit: 'hour' as const },
    { amount: 30, unit: 'day' as const },
    { amount: 12, unit: 'month' as const },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' as const },
  ]
  let duration = -seconds
  let unit: Intl.RelativeTimeFormatUnit = 'second'
  for (const d of divisions) {
    if (Math.abs(duration) < d.amount) {
      unit = d.unit
      break
    }
    duration = Math.round(duration / d.amount)
  }
  return rtf.format(duration, unit)
}
