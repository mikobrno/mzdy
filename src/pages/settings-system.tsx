import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Server } from 'lucide-react'

export default function SettingsSystem() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Systémové nastavení</h1>
          <p className="text-gray-600">Výkon, cache, monitoring, logy</p>
        </div>
        <Button className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          Vyčistit cache
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stav systému</CardTitle>
          <CardDescription>Informace o běhu a metrikách</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Zatím žádné metriky.</p>
        </CardContent>
      </Card>
    </div>
  )
}
