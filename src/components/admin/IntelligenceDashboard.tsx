// ADM-03: Platform Intelligence Health Dashboard
// Admin-only view with platform health metrics

import { useState } from 'react'
import { usePlatformStats } from '../../hooks/usePlatformStats'
import { PlatformThreshold, usePlatformThresholds } from '../../hooks/usePlatformThresholds'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../ui/Spinner'

const THRESHOLD_LABELS: Record<string, string> = {
  min_regulation_alert: 'Min regulation for alert',
  mastery_plateau_sessions: 'Sessions before plateau alert',
  inactivity_days: 'Inactivity days before alert',
  frustration_spike_threshold: 'Frustration spike threshold',
}

function StatCard({
  label,
  value,
  suffix = '',
}: {
  label: string
  value: number | string
  suffix?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-2xl font-bold text-slate-900">
        {value}
        {suffix}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  )
}

function CoverageBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{percent}%</span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${label}: ${percent}%`}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function ThresholdRow({
  threshold,
  disabled,
  onSave,
}: {
  threshold: PlatformThreshold
  disabled: boolean
  onSave: (key: string, value: number) => Promise<void>
}) {
  const [editedValue, setEditedValue] = useState<number>(threshold.value)

  const label = THRESHOLD_LABELS[threshold.key] ?? threshold.key

  return (
    <li className="flex flex-col gap-2 border-b border-slate-100 px-5 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          value={editedValue}
          onChange={(e) => setEditedValue(Number(e.target.value))}
          disabled={disabled}
          aria-label={`Edit value for ${label}`}
        />
        <button
          type="button"
          className="rounded-lg bg-brand-500 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={() => onSave(threshold.key, editedValue)}
        >
          Save
        </button>
      </div>
    </li>
  )
}

export function IntelligenceDashboard() {
  const role = useAuthStore((s) => s.role)
  const { stats, loading: statsLoading } = usePlatformStats()
  const { thresholds, updateThreshold, loading: threshLoading } = usePlatformThresholds()

  if (role !== 'admin') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-700">Access restricted</p>
        <p className="mt-1 text-xs text-red-500">
          This dashboard is only available to platform administrators.
        </p>
      </div>
    )
  }

  if (statsLoading) return <Spinner />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Platform Intelligence</h2>
        <p className="mt-0.5 text-xs text-slate-500">Platform-wide learning health overview</p>
      </div>

      {/* Section 1: Platform Overview */}
      <section aria-labelledby="overview-heading">
        <h3
          id="overview-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Platform Overview
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Active Learners" value={stats?.totalActiveLearners ?? 0} />
          <StatCard
            label="Avg Mastery"
            value={Math.round((stats?.averageMasteryScore ?? 0) * 100)}
            suffix="%"
          />
          <StatCard
            label="Avg Regulation"
            value={Math.round(stats?.averageRegulationLevel ?? 0)}
            suffix="%"
          />
          <StatCard label="Alerts This Week" value={stats?.alertsThisWeek ?? 0} />
        </div>
      </section>

      {/* Section 2: Standards Coverage */}
      <section aria-labelledby="coverage-heading">
        <h3
          id="coverage-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Standards Coverage
        </h3>
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <CoverageBar
            label="ELA — learners with evidence"
            percent={Math.round(stats?.topStrandELA ?? 0)}
          />
          <CoverageBar
            label="Math — learners with evidence"
            percent={Math.round(stats?.topStrandMath ?? 0)}
          />
          <p className="text-xs text-slate-400">
            Coverage data requires student_ccss_evidence aggregation — full metrics available after
            first data sync.
          </p>
        </div>
      </section>

      {/* Section 3: Platform Thresholds */}
      <section aria-labelledby="thresholds-heading">
        <h3
          id="thresholds-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Platform Thresholds
        </h3>
        <div className="rounded-xl border border-slate-200 bg-white">
          {threshLoading && thresholds.length === 0 ? (
            <div className="flex justify-center p-5">
              <Spinner />
            </div>
          ) : thresholds.length === 0 ? (
            <p className="p-5 text-sm text-slate-400">No thresholds configured yet.</p>
          ) : (
            <ul className="space-y-0" aria-label="Platform alert thresholds">
              {thresholds.map((t) => (
                <ThresholdRow
                  key={t.key}
                  threshold={t}
                  disabled={threshLoading}
                  onSave={updateThreshold}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
