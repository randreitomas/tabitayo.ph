import { useCallback, useEffect, useState } from 'react'
import { getActivityLogs } from '@/lib/api'
import type { ActivityLog, ActivityLogFilters } from '@/types/activityLog'
import { ACTIVITY_ACTION_LABELS } from '@/types/activityLog'
import { ACTION_BADGE_VARIANT } from '@/lib/activityLog'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

const ACTION_OPTIONS: { value: ActivityLogFilters['action']; label: string }[] = [
  { value: 'all', label: 'All actions' },
  { value: 'login', label: ACTIVITY_ACTION_LABELS.login },
  { value: 'logout', label: ACTIVITY_ACTION_LABELS.logout },
  { value: 'add_event', label: ACTIVITY_ACTION_LABELS.add_event },
  { value: 'configure_event', label: ACTIVITY_ACTION_LABELS.configure_event },
]

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<ActivityLogFilters['action']>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getActivityLogs({
        action,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      })
      setLogs(data)
    } finally {
      setLoading(false)
    }
  }, [action, fromDate, toDate])

  useEffect(() => {
    load()
  }, [load])

  const clearFilters = () => {
    setAction('all')
    setFromDate('')
    setToDate('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Activity log</h1>
        <p className="text-sm text-muted mt-1">
          Platform sign-ins, sign-outs, and event changes across all hosts.
        </p>
      </div>

      <Card padding="md">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div>
            <label htmlFor="filter-action" className="block text-xs text-muted mb-1.5 font-body">
              Action
            </label>
            <select
              id="filter-action"
              value={action ?? 'all'}
              onChange={(e) =>
                setAction(e.target.value as ActivityLogFilters['action'])
              }
              className="w-full px-3 py-2.5 bg-ivory border border-border rounded-sm font-body text-sm focus:outline-none focus:border-dark/40"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="From date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label="To date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <Button onClick={load} className="flex-1">
              Apply
            </Button>
            <Button variant="secondary" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <p className="text-muted text-sm">Loading activity...</p>
      ) : logs.length === 0 ? (
        <Card>
          <p className="text-sm text-muted text-center py-8">No activity matches your filters.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto border border-border rounded-sm bg-ivory">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-border/25 text-left">
                <th className="px-3 py-2.5 font-body text-xs text-muted whitespace-nowrap">
                  Date & time
                </th>
                <th className="px-3 py-2.5 font-body text-xs text-muted whitespace-nowrap">
                  Action
                </th>
                <th className="px-3 py-2.5 font-body text-xs text-muted whitespace-nowrap">
                  User
                </th>
                <th className="px-3 py-2.5 font-body text-xs text-muted min-w-[240px]">
                  Log
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 text-xs text-muted whitespace-nowrap align-top">
                    {formatDateTime(log.occurredAt)}
                  </td>
                  <td className="px-3 py-3 align-top whitespace-nowrap">
                    <Badge variant={ACTION_BADGE_VARIANT[log.action]}>
                      {ACTIVITY_ACTION_LABELS[log.action]}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 align-top whitespace-nowrap">
                    <span className="block font-body text-dark">{log.actorName}</span>
                    <span className="block text-xs text-muted">{log.actorEmail}</span>
                    <span className="block text-xs text-muted capitalize">{log.actorRole}</span>
                  </td>
                  <td className="px-3 py-3 align-top text-dark/90">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
