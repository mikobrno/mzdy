import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Palette } from 'lucide-react'

export default function SettingsAppearance() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vzhled a UI</h1>
          <p className="text-gray-600">Motiv, jazyk a barvy</p>
        </div>
        <Button className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Uložit vzhled
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Motivy</CardTitle>
          <CardDescription>Vyberte si vzhled aplikace</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Připravena základní podpora světlého motivu.</p>
        </CardContent>
      </Card>
    </div>
  )
}
