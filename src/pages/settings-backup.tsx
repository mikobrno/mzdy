import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Play, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function SettingsBackup() {
  const { success } = useToast()
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Záloha a archivace</h1>
          <p className="text-gray-600">Automatické zálohy, archivace dat a recovery</p>
        </div>
        <Button onClick={() => success('Záloha spuštěna')} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Spustit zálohu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Plán záloh
          </CardTitle>
          <CardDescription>Nastavení automatických záloh</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-gray-700">
            <Clock className="h-4 w-4" /> Každý den ve 23:00
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
