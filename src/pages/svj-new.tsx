import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiService } from '@/services/api'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Save, ArrowLeft } from 'lucide-react'

export default function SVJNewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    ico: '',
    address: '',
    bankAccount: '',
    dataBoxId: '',
    contactPerson: '',
    contactEmail: '',
    quickDescription: '',
    reportDeliveryMethod: 'manager' as 'manager' | 'client',
    isActive: true,
  })

  const create = useMutation({
    mutationFn: () => apiService.createSVJ({
      ...form,
      registryData: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any),
    onSuccess: (svj) => {
      queryClient.invalidateQueries({ queryKey: ['svj-list'] })
      navigate(`/svj/${svj.id}`)
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link to="/svj">
              <ArrowLeft className="h-4 w-4 mr-2" /> Zpět na seznam SVJ
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Přidat SVJ</h1>
        </div>
        <Button onClick={() => create.mutate()} disabled={create.isPending}>
          <Save className="h-4 w-4 mr-2" /> Uložit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Základní údaje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Název</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Název SVJ"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IČO</label>
              <input
                value={form.ico}
                onChange={(e) => setForm({ ...form, ico: e.target.value })}
                placeholder="12345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Adresa</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ulice 1, Město"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bankovní účet (IBAN)</label>
              <input
                value={form.bankAccount}
                onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                placeholder="CZ..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Datová schránka</label>
              <input
                value={form.dataBoxId}
                onChange={(e) => setForm({ ...form, dataBoxId: e.target.value })}
                placeholder="abc123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontaktní údaje</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kontaktní osoba</label>
            <input
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              placeholder="Jméno a příjmení"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="kontakt@svj.cz"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Další</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Popis</label>
            <textarea
              value={form.quickDescription}
              onChange={(e) => setForm({ ...form, quickDescription: e.target.value })}
              rows={3}
              placeholder="Stručný popis SVJ"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Způsob odesílání výkazů</label>
            <select
              value={form.reportDeliveryMethod}
              onChange={(e) => setForm({ ...form, reportDeliveryMethod: e.target.value as 'manager' | 'client' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              aria-label="Způsob odesílání výkazů"
            >
              <option value="manager">Odesílá správce</option>
              <option value="client">Odesílá klient</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
