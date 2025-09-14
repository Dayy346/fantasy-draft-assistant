interface MetricBadgesProps {
  draftScore?: number
  ppg?: number
  ppt?: number
  vorp?: number
}

export default function MetricBadges({ draftScore, ppg, ppt, vorp }: MetricBadgesProps) {
  const getBadgeClass = (value: number | undefined, thresholds: { good: number; bad: number }) => {
    if (value === undefined) return 'metric-badge-neutral'
    if (value >= thresholds.good) return 'metric-badge-positive'
    if (value <= thresholds.bad) return 'metric-badge-negative'
    return 'metric-badge-neutral'
  }

  return (
    <div className="flex flex-wrap gap-1">
      {draftScore !== undefined && (
        <span className={`metric-badge ${getBadgeClass(draftScore, { good: 0.5, bad: -0.5 })}`}>
          DS: {draftScore.toFixed(2)}
        </span>
      )}
      {ppg !== undefined && (
        <span className={`metric-badge ${getBadgeClass(ppg, { good: 15, bad: 8 })}`}>
          PPG: {ppg.toFixed(1)}
        </span>
      )}
      {ppt !== undefined && (
        <span className={`metric-badge ${getBadgeClass(ppt, { good: 0.8, bad: 0.4 })}`}>
          PPT: {ppt.toFixed(2)}
        </span>
      )}
      {vorp !== undefined && (
        <span className={`metric-badge ${getBadgeClass(vorp, { good: 2, bad: -1 })}`}>
          VORP: {vorp.toFixed(1)}
        </span>
      )}
    </div>
  )
}
