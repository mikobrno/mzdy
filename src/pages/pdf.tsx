import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import PdfTemplatesPage from '@/pages/pdf-templates'
import PdfGeneratorPage from '@/pages/pdf-generator'

export default function PdfHubPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'templates'

  const setTab = (t: 'templates' | 'generator') => {
    const next = new URLSearchParams(params)
    next.set('tab', t)
    setParams(next, { replace: true })
  }

  const Content = useMemo(() => {
    return tab === 'generator' ? <PdfGeneratorPage /> : <PdfTemplatesPage />
  }, [tab])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PDF</h1>
          <p className="text-gray-600">Správa PDF šablon a generování výstupů na jednom místě.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex gap-2">
              <Button
                variant={tab === 'templates' ? 'default' : 'outline'}
                onClick={() => setTab('templates')}
                className={cn('px-4')}
                aria-pressed={tab === 'templates'}
              >Šablony</Button>
              <Button
                variant={tab === 'generator' ? 'default' : 'outline'}
                onClick={() => setTab('generator')}
                className={cn('px-4')}
                aria-pressed={tab === 'generator'}
              >Generátor</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Vložíme existující stránky, aby se nemusela duplikovat logika */}
          {Content}
        </CardContent>
      </Card>
    </div>
  )
}
