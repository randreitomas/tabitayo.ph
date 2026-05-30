import { useCallback, useEffect, useState } from 'react'
import {
  getAllHosts,
  getHostApprovalHistory,
  updateHostStatus,
} from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api/errors'
import type { HostAccount, HostStatus } from '@/types/user'
import type { ActivityLog } from '@/types/activityLog'
import { formatActivityAction } from '@/types/activityLog'
import { getActionBadgeVariant } from '@/lib/activityLog'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'

type HostFilter = HostStatus | 'all'

const HOST_FILTER_TABS: { id: HostFilter; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'active', label: 'Active' },
  { id: 'disabled', label: 'Disabled' },
  { id: 'all', label: 'All' },
]

function statusBadgeVariant(
  status: HostStatus
): 'pending' | 'approved' | 'suspended' {
  if (status === 'active') return 'approved'
  if (status === 'disabled') return 'suspended'
  return 'pending'
}

export function HostList() {
  const [filter, setFilter] = useState<HostFilter>('pending')
  const [hosts, setHosts] = useState<HostAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionHost, setActionHost] = useState<{
    host: HostAccount
    nextStatus: HostStatus
  } | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [historyHost, setHistoryHost] = useState<HostAccount | null>(null)
  const [history, setHistory] = useState<ActivityLog[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllHosts(filter === 'all' ? undefined : filter)
      setHosts(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load hosts.'))
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    void load()
  }, [load])

  const openHistory = async (host: HostAccount) => {
    setHistoryHost(host)
    setHistoryLoading(true)
    try {
      setHistory(await getHostApprovalHistory(host.id))
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const confirmStatusChange = async () => {
    if (!actionHost) return
    setSubmitting(true)
    setError(null)
    try {
      await updateHostStatus(actionHost.host.id, actionHost.nextStatus, reason)
      setActionHost(null)
      setReason('')
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update host status.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hosts"
        description="Review new host registrations and manage account access."
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Tabs tabs={HOST_FILTER_TABS} activeId={filter} onChange={(id) => setFilter(id as HostFilter)}>
        {loading ? (
          <p className="text-muted text-sm">Loading hosts...</p>
        ) : hosts.length === 0 ? (
          <Card>
            <p className="text-sm text-muted text-center py-8">
              {filter === 'pending'
                ? 'No hosts waiting for approval.'
                : 'No hosts match this filter.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {hosts.map((host) => (
              <Card key={host.id} padding="sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading text-xl md:text-2xl text-dark">
                        {host.displayName}
                      </h2>
                      <Badge variant={statusBadgeVariant(host.status)}>{host.status}</Badge>
                    </div>
                    <p className="text-sm text-muted">{host.email}</p>
                    <p className="text-xs text-muted mt-1">
                      {host.eventCount} event{host.eventCount !== 1 ? 's' : ''} · Joined{' '}
                      {host.createdAt}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {host.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() =>
                          setActionHost({ host, nextStatus: 'active' })
                        }
                      >
                        Approve
                      </Button>
                    )}
                    {host.status === 'disabled' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setActionHost({ host, nextStatus: 'active' })
                        }
                      >
                        Reactivate
                      </Button>
                    )}
                    {host.status !== 'disabled' ? (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          setActionHost({ host, nextStatus: 'disabled' })
                        }
                      >
                        Disable
                      </Button>
                    ) : null}
                    <Button size="sm" variant="ghost" onClick={() => void openHistory(host)}>
                      History
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Tabs>

      <Modal
        open={Boolean(actionHost)}
        onClose={() => {
          if (!submitting) {
            setActionHost(null)
            setReason('')
          }
        }}
        title={
          actionHost?.nextStatus === 'active'
            ? 'Approve host account'
            : 'Disable host account'
        }
        footer={
          <div className="flex gap-2 justify-end p-4 border-t border-border">
            <Button
              variant="secondary"
              disabled={submitting}
              onClick={() => {
                setActionHost(null)
                setReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionHost?.nextStatus === 'disabled' ? 'danger' : 'accent'}
              disabled={submitting}
              onClick={() => void confirmStatusChange()}
            >
              {submitting ? 'Saving...' : 'Confirm'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-dark/90 mb-4">
          {actionHost?.nextStatus === 'active'
            ? `Approve ${actionHost?.host.displayName} to use host features.`
            : `Disable ${actionHost?.host.displayName}. They will not be able to sign in.`}
        </p>
        <Input
          label="Note (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for this change"
        />
      </Modal>

      <Modal
        open={Boolean(historyHost)}
        onClose={() => setHistoryHost(null)}
        title={historyHost ? `Approval history — ${historyHost.displayName}` : 'History'}
      >
        {historyLoading ? (
          <p className="text-sm text-muted">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted">No approval activity recorded yet.</p>
        ) : (
          <ul className="space-y-3 max-h-80 overflow-y-auto">
            {history.map((log) => (
              <li key={log.id} className="text-sm border-b border-border pb-2 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getActionBadgeVariant(log.action)}>
                    {formatActivityAction(log.action)}
                  </Badge>
                  <span className="text-xs text-muted">
                    {new Date(log.occurredAt).toLocaleString('en-PH')}
                  </span>
                </div>
                <p className="text-dark/90">{log.message}</p>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}
