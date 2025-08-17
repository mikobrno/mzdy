import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { templatesService } from '@/services/templates'

 type VarDef = { key: string; label?: string; group?: string; example?: string }

const DEFAULT_VARS: VarDef[] = [
  { key: 'nazev_svj', label: 'Název SVJ', group: 'Údaje budovy' },
  { key: 'rok_zuctovani', label: 'Rok zúčtování', group: 'Statické' },
  { key: 'obdobi_vyuctovani', label: 'Období vyúčtování', group: 'Statické' },
  { key: 'osloveni_clenu', label: 'Oslovení členů', group: 'Údaje budovy' },
  { key: 'osloveni_obecne', label: 'Oslovení obecné', group: 'Údaje budovy' },
  { key: 'podpis_spravce', label: 'Podpis správce', group: 'Údaje budovy' },
  { key: 'cislo_bytu', label: 'Číslo bytu', group: 'Údaje budovy' },
]

function insertAtCursor(el: HTMLTextAreaElement | HTMLInputElement, text: string) {
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length
  const before = el.value.substring(0, start)
  const after = el.value.substring(end)
  el.value = before + text + after
  const caret = start + text.length
  el.setSelectionRange(caret, caret)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function extractVariables(subject: string, body: string) {
  const set = new Set<string>()
  const re = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(subject))) set.add(`{{${m[1]}}}`)
  while ((m = re.exec(body))) set.add(`{{${m[1]}}}`)
  return Array.from(set)
}

function renderWithVars(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_: any, k: string) => vars[k] ?? `{{${k}}}`)
}

export default function TemplateEditor() {
  const { id } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mode: 'new' | 'edit' = id ? 'edit' : 'new'

  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [varsFilter, setVarsFilter] = useState('')
  const [previewVarsText, setPreviewVarsText] = useState('')

  const subjectRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState<'subject' | 'body'>('subject')

  useEffect(() => {
    setLoading(true)
    if (mode === 'edit' && id) {
      const t = templatesService.getById(id)
      if (!t) {
        navigate('/templates')
        return
      }
      setName(t.name)
      setSubject(t.subject)
      setBody(t.bodyPreview || '')
    } else {
      setName('Nová šablona')
      setSubject('')
      setBody('')
    }
    // preview param
    const shouldPreview = searchParams.get('preview') === '1'
    setShowPreview(!!shouldPreview)
    setLoading(false)
  }, [id, mode, navigate, searchParams])

  const vars = useMemo(() => {
    const f = varsFilter.toLowerCase()
    return DEFAULT_VARS.filter(v => v.key.toLowerCase().includes(f) || (v.label || '').toLowerCase().includes(f) || (v.group || '').toLowerCase().includes(f))
  }, [varsFilter])

  const groups = useMemo(() => {
    const map = new Map<string, VarDef[]>()
    for (const v of vars) {
      const g = v.group || 'Ostatní'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(v)
    }
    return Array.from(map.entries())
  }, [vars])

  const parsedPreviewVars = useMemo(() => {
    try {
      return previewVarsText ? JSON.parse(previewVarsText) : {}
    } catch {
      return {}
    }
  }, [previewVarsText])

  const renderedSubject = useMemo(() => renderWithVars(subject, parsedPreviewVars), [subject, parsedPreviewVars])
  const renderedBody = useMemo(() => renderWithVars(body, parsedPreviewVars), [body, parsedPreviewVars])

  const onInsert = (key: string) => {
    const token = `{{${key}}}`
    if (focused === 'subject' && subjectRef.current) insertAtCursor(subjectRef.current, token)
    else if (bodyRef.current) insertAtCursor(bodyRef.current, token)
  }

  const onSave = () => {
    const variables = extractVariables(subject, body)
    if (mode === 'edit' && id) {
      templatesService.update(id, { name, subject, bodyPreview: body, variables })
    } else {
      const created = templatesService.create({ name, subject, category: 'oznameni', isActive: true, variables, bodyPreview: body })
      navigate(`/templates/${created.id}/edit`)
      return
    }
    navigate('/templates')
  }

  if (loading) return <div className="p-6">Načítání…</div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editor šablony</h1>
          <p className="text-gray-600">Vkládejte proměnné kliknutím a přepínejte náhled.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/templates')}>Zpět</Button>
          <Button onClick={onSave}>Uložit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Levý panel */}
        <aside className="lg:col-span-3 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Nastavení</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label htmlFor="tpl-name" className="block text-sm font-medium mb-1">Název</label>
                <input id="tpl-name" className="w-full px-3 py-2 border rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Název šablony" />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">Náhled</div>
                <Button variant="outline" size="sm" onClick={() => setShowPreview(v => !v)}>{showPreview ? 'Upravovat' : 'Zobrazit náhled'}</Button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Proměnné (JSON pro náhled)</label>
                <textarea className="w-full h-32 px-3 py-2 border rounded font-mono text-xs" value={previewVarsText} onChange={e => setPreviewVarsText(e.target.value)} placeholder='{"nazev_svj":"Kníničky 318"}' />
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Střední panel */}
        <main className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Předmět e‑mailu</CardTitle>
            </CardHeader>
            <CardContent>
              {showPreview ? (
                <div className="p-3 bg-gray-50 rounded">{renderedSubject || <span className="text-gray-500">— prázdné —</span>}</div>
              ) : (
                <input ref={subjectRef} onFocus={() => setFocused('subject')} className="w-full px-3 py-2 border rounded" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Předmět" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tělo e‑mailu</CardTitle>
            </CardHeader>
            <CardContent>
              {showPreview ? (
                <div className="prose max-w-none p-3 bg-gray-50 rounded">
                  {renderedBody || <p className="text-gray-500">— prázdné —</p>}
                </div>
              ) : (
                <textarea ref={bodyRef} onFocus={() => setFocused('body')} className="w-full h-96 px-3 py-2 border rounded font-mono text-sm" value={body} onChange={e => setBody(e.target.value)} placeholder="HTML nebo prostý text s {{promennymi}}" />
              )}
            </CardContent>
          </Card>
        </main>

        {/* Pravý panel */}
        <aside className="lg:col-span-3 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Dostupné proměnné</CardTitle>
            </CardHeader>
            <CardContent>
              <input className="w-full mb-3 px-3 py-2 border rounded" placeholder="Hledat…" value={varsFilter} onChange={e => setVarsFilter(e.target.value)} />
              <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                {groups.map(([group, items]) => (
                  <div key={group}>
                    <div className="text-xs font-semibold text-gray-600 mb-1">{group}</div>
                    <div className="space-y-1">
                      {items.map(v => (
                        <button key={v.key} type="button" onClick={() => onInsert(v.key)} className="w-full text-left p-2 rounded border hover:bg-gray-50">
                          <div className="font-mono text-sm">{'{{' + v.key + '}}'}</div>
                          {v.label && <div className="text-xs text-gray-500">{v.label}</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
