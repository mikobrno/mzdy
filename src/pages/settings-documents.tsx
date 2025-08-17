import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Upload } from 'lucide-react'

export default function SettingsDocuments() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumenty a šablony</h1>
          <p className="text-gray-600">PDF šablony, razítka a podpisy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Nahrát šablonu
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nová šablona
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF šablony
          </CardTitle>
          <CardDescription>Spravujte vzhled generovaných dokumentů</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Zatím nejsou žádné šablony. Přidejte první pomocí tlačítka výše.</p>
        </CardContent>
      </Card>
    </div>
  )
}
