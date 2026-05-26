import { useEffect, useState } from 'react'
import { getAllHosts, updateHostStatus } from '@/lib/api'
import type { HostAccount } from '@/types/user'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function HostList() {
  const [hosts, setHosts] = useState<HostAccount[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => getAllHosts().then(setHosts).finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const setStatus = async (hostId: string, status: HostAccount['status']) => {
    await updateHostStatus(hostId, status)
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Hosts</h1>

      {loading ? (
        <p className="text-muted">Loading hosts...</p>
      ) : (
        <div className="space-y-3">
          {hosts.map((host) => (
            <Card key={host.id} padding="sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl">{host.displayName}</h2>
                    <Badge
                      variant={
                        host.status === 'approved'
                          ? 'approved'
                          : host.status === 'suspended'
                            ? 'suspended'
                            : 'pending'
                      }
                    >
                      {host.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted">{host.email}</p>
                  <p className="text-xs text-muted mt-1">
                    {host.eventCount} event{host.eventCount !== 1 ? 's' : ''} · Joined{' '}
                    {host.createdAt}
                  </p>
                </div>
                <div className="flex gap-2">
                  {host.status === 'pending' && (
                    <Button size="sm" onClick={() => setStatus(host.id, 'approved')}>
                      Approve
                    </Button>
                  )}
                  {host.status !== 'suspended' ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setStatus(host.id, 'suspended')}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(host.id, 'approved')}>
                      Reinstate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
