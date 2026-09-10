/** Base shimmer block. Compose into row/card skeletons per screen. */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-page-alt)] ${className}`}
      aria-hidden="true"
    />
  )
}

/** Skeleton for a single table row, matching a given column count. */
export function SkeletonRow({ columns = 5 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  )
}

/** Skeleton for a stat/metric card. */
export function SkeletonStatCard() {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}
