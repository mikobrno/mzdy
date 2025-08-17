import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Clock, Trash2, Edit } from 'lucide-react'
import { useState } from 'react'
import { notificationsService, type NotificationRule } from '@/services/notifications'

export default function SettingsNotifications() {
  const [rules, setRules] = useState<NotificationRule[]>(() => notificationsService.getAll())
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<NotificationRule | null>(null)

  const openNew = () => { setEditing(null); setShowModal(true) }
  const openEdit = (r: NotificationRule) => { setEditing(r); setShowModal(true) }
  const remove = (id: string) => { notificationsService.remove(id); setRules(prev => prev.filter(r => r.id !== id)) }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikace</h1>
          <p className="text-gray-600">E-mailové, push a SMS upozornění</p>
        </div>
        <Button className="flex items-center gap-2" onClick={openNew}>
          <Bell className="h-4 w-4" />
          Přidat notifikaci
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pravidla pro upozornění</CardTitle>
          <CardDescription>Definujte kdy a komu se notifikace posílají</CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-gray-600">Zatím nejsou žádná pravidla.</p>
          ) : (
            <div className="space-y-3">
              {rules.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-gray-600">
                      {r.trigger.type === 'event' ? (
                        <>Událost: <span className="font-mono">{r.trigger.eventKey}</span></>
                      ) : (
                        <>
                          <Clock className="inline h-3 w-3 mr-1" /> Plán: {r.trigger.schedule.kind}
                        </>
                      )}
                      {' '}• Kanály: {r.channels.email ? 'E-mail ' : ''}{r.channels.push ? 'Push ' : ''}{r.channels.sms ? 'SMS' : ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <RuleModal 
          initial={editing || null}
          onCancel={() => setShowModal(false)}
          onSave={(data) => {
            if (editing) {
              const upd = notificationsService.update(editing.id, data)
              if (upd) setRules(prev => prev.map(x => x.id === upd.id ? upd : x))
            } else {
              const created = notificationsService.create(data)
              setRules(prev => [created, ...prev])
            }
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

function RuleModal({ initial, onCancel, onSave }: { initial: NotificationRule | null, onCancel: () => void, onSave: (data: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => void }) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [channels, setChannels] = useState({ email: initial?.channels.email ?? true, push: initial?.channels.push ?? false, sms: initial?.channels.sms ?? false })
  const [active, setActive] = useState(initial?.active ?? true)
  const [triggerType, setTriggerType] = useState<'event'|'schedule'>(initial?.trigger.type || 'event')
  const [eventKey, setEventKey] = useState(initial?.trigger.type === 'event' ? initial.trigger.eventKey : 'payroll_prepared')
  const initialSchedKind = initial?.trigger.type === 'schedule' ? initial.trigger.schedule.kind : 'daily'
  const safeSchedKind: 'daily'|'weekly'|'monthly'|'cron' = (initialSchedKind === 'none' ? 'daily' : (initialSchedKind as any))
  const [scheduleKind, setScheduleKind] = useState<'daily'|'weekly'|'monthly'|'cron'>(safeSchedKind)
  const [time, setTime] = useState(
    initial?.trigger.type === 'schedule' && (initial.trigger.schedule.kind === 'daily' || initial.trigger.schedule.kind === 'weekly' || initial.trigger.schedule.kind === 'monthly')
      ? (initial.trigger.schedule as any).time
      : '09:00'
  )
  const [weekday, setWeekday] = useState(
    initial?.trigger.type === 'schedule' && initial.trigger.schedule.kind === 'weekly' ? initial.trigger.schedule.weekday : 1
  )
  const [monthday, setMonthday] = useState(
    initial?.trigger.type === 'schedule' && initial.trigger.schedule.kind === 'monthly' ? initial.trigger.schedule.day : 1
  )
  const [cron, setCron] = useState(
    initial?.trigger.type === 'schedule' && initial.trigger.schedule.kind === 'cron' ? initial.trigger.schedule.expr : '* * * * *'
  )

  const [recipientType, setRecipientType] = useState<'all'|'role'|'emails'>(initial?.recipients?.type || 'all')
  const [roleId, setRoleId] = useState(initial?.recipients?.type === 'role' ? initial.recipients.roleId : '')
  const [emails, setEmails] = useState(
    initial?.recipients?.type === 'emails' ? (initial.recipients.list.join(', ')) : ''
  )

  const submit = () => {
    if (!name.trim()) return alert('Zadejte název')
    const base = { name: name.trim(), description: description.trim(), channels, active }
    let recipients: any
    if (recipientType === 'all') recipients = { type: 'all' } as const
    else if (recipientType === 'role') recipients = { type: 'role', roleId }
    else recipients = { type: 'emails', list: emails.split(',').map(s => s.trim()).filter(Boolean) }
    if (triggerType === 'event') {
      onSave({ ...base, recipients, trigger: { type: 'event', eventKey } })
    } else {
      let schedule: any
      if (scheduleKind === 'daily') schedule = { kind: 'daily', time }
      if (scheduleKind === 'weekly') schedule = { kind: 'weekly', weekday, time }
      if (scheduleKind === 'monthly') schedule = { kind: 'monthly', day: monthday, time }
      if (scheduleKind === 'cron') schedule = { kind: 'cron', expr: cron }
      onSave({ ...base, recipients, trigger: { type: 'schedule', schedule } })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>{initial ? 'Upravit pravidlo' : 'Nové pravidlo'}</CardTitle>
          <CardDescription>Definujte spuštění, kanály a příjemce.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Název</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Název pravidla" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Popis</label>
              <input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Krátký popis" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stav</label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} aria-label="Aktivní pravidlo" /> Aktivní
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['email','push','sms'] as const).map(ch => (
                <label key={ch} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={channels[ch]} onChange={e => setChannels(prev => ({ ...prev, [ch]: e.target.checked }))} aria-label={`Kanál ${ch.toUpperCase()}`} /> {ch.toUpperCase()}
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Spouštění</label>
              <div className="flex gap-2 mb-2">
                <button className={`px-3 py-1 rounded border ${triggerType==='event'?'bg-blue-50 border-blue-300':'border-gray-300'}`} onClick={() => setTriggerType('event')}>Událost</button>
                <button className={`px-3 py-1 rounded border ${triggerType==='schedule'?'bg-blue-50 border-blue-300':'border-gray-300'}`} onClick={() => setTriggerType('schedule')}>Plán</button>
              </div>
              {triggerType === 'event' ? (
                <>
                  <label className="sr-only" htmlFor="eventKey">Událost</label>
                  <select id="eventKey" aria-label="Událost" value={eventKey} onChange={e=>setEventKey(e.target.value as any)} className="w-full px-3 py-2 border rounded">
                  <option value="payroll_prepared">Mzdy připraveny</option>
                  <option value="payroll_approved">Mzdy schváleny</option>
                  <option value="payroll_paid">Mzdy vyplaceny</option>
                  <option value="employee_terminated">Zaměstnanec ukončen</option>
                  </select>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="sr-only" htmlFor="scheduleKind">Typ plánu</label>
                  <select id="scheduleKind" aria-label="Typ plánu" value={scheduleKind} onChange={e => setScheduleKind(e.target.value as any)} className="w-full px-3 py-2 border rounded">
                    <option value="daily">Denně</option>
                    <option value="weekly">Týdně</option>
                    <option value="monthly">Měsíčně</option>
                    <option value="cron">Cron</option>
                  </select>
                  {scheduleKind==='daily' && (
                    <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-full px-3 py-2 border rounded" aria-label="Čas" title="Čas" />
                  )}
                  {scheduleKind==='weekly' && (
                    <div className="flex gap-2">
                      <label className="sr-only" htmlFor="weekday">Den v týdnu</label>
                      <select id="weekday" aria-label="Den v týdnu" value={weekday} onChange={e=>setWeekday(parseInt(e.target.value))} className="px-3 py-2 border rounded">
                        {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{['Ne','Po','Út','St','Čt','Pá','So'][d]}</option>)}
                      </select>
                      <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="flex-1 px-3 py-2 border rounded" aria-label="Čas" title="Čas" />
                    </div>
                  )}
                  {scheduleKind==='monthly' && (
                    <div className="flex gap-2">
                      <input type="number" min={1} max={31} value={monthday} onChange={e=>setMonthday(parseInt(e.target.value))} className="w-28 px-3 py-2 border rounded" aria-label="Den v měsíci" placeholder="Den" />
                      <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="flex-1 px-3 py-2 border rounded" aria-label="Čas" title="Čas" />
                    </div>
                  )}
                  {scheduleKind==='cron' && (
                    <input value={cron} onChange={e=>setCron(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="* * * * *" aria-label="Cron výraz" />
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Příjemci</label>
              <div className="flex gap-2 mb-2">
                <button className={`px-3 py-1 rounded border ${recipientType==='all'?'bg-blue-50 border-blue-300':'border-gray-300'}`} onClick={() => setRecipientType('all')}>Všichni</button>
                <button className={`px-3 py-1 rounded border ${recipientType==='role'?'bg-blue-50 border-blue-300':'border-gray-300'}`} onClick={() => setRecipientType('role')}>Role</button>
                <button className={`px-3 py-1 rounded border ${recipientType==='emails'?'bg-blue-50 border-blue-300':'border-gray-300'}`} onClick={() => setRecipientType('emails')}>E-maily</button>
              </div>
              {recipientType==='role' && (
                <input value={roleId} onChange={e=>setRoleId(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="ID role (např. admin)" aria-label="ID role" />
              )}
              {recipientType==='emails' && (
                <input value={emails} onChange={e=>setEmails(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="uživatel@domena.cz, dalsi@domena.cz" aria-label="E-mailové adresy" />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onCancel}>Zrušit</Button>
              <Button onClick={submit}>Uložit</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
