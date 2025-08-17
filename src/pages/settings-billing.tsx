import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function SettingsBilling() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fakturace a platby</h1>
        <p className="text-gray-600">Plán, fakturace a způsoby platby</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Předplatné</CardTitle>
          <CardDescription>Aktuální plán a limity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Aktuální plán:</span>
                <Badge>Pro</Badge>
              </div>
              <div className="text-sm text-gray-500">Obnovuje se automaticky každý měsíc</div>
            </div>
            <Button className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Změnit plán
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faktury</CardTitle>
          <CardDescription>Přehled vystavených dokladů</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Zatím žádné faktury.</p>
        </CardContent>
      </Card>
    </div>
  )
}
