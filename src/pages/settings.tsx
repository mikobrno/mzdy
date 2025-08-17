import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Save, Key, Mail, Calculator, Upload, Download, Settings2, Database } from 'lucide-react';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Obecné', icon: Settings2 },
    { id: 'email', label: 'E-mail', icon: Mail },
    { id: 'taxes', label: 'Daně a odvody', icon: Calculator },
    { id: 'integrations', label: 'Integrace', icon: Key },
    { id: 'backup', label: 'Zálohování', icon: Database }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Základní nastavení</CardTitle>
          <CardDescription>Obecné nastavení systému</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Název společnosti</label>
              <input 
                type="text" 
                defaultValue="Správa SVJ s.r.o."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kontaktní e-mail</label>
              <input 
                type="email" 
                defaultValue="info@sprava-svj.cz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Výchozí podpis e-mailů</label>
            <textarea 
              rows={4}
              defaultValue="S pozdravem,&#10;Správa SVJ s.r.o.&#10;Tel: +420 123 456 789&#10;Email: info@sprava-svj.cz"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Výchozí proměnné</CardTitle>
          <CardDescription>Globální hodnoty pro e-mailové šablony</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{'{{rok_zuctovani}}'}</label>
                <input 
                  type="number" 
                  defaultValue="2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{'{{obdobi_vyuctovani}}'}</label>
                <input 
                  type="text" 
                  defaultValue="01.01.2025 - 31.12.2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SMTP nastavení</CardTitle>
          <CardDescription>Konfigurace pro odesílání e-mailů</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP server</label>
              <input 
                type="text" 
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Port</label>
              <input 
                type="number" 
                defaultValue="587"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Uživatelské jméno</label>
              <input 
                type="text" 
                placeholder="your-email@domain.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Heslo</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="ssl" defaultChecked className="rounded" />
            <label htmlFor="ssl" className="text-sm">Použít SSL/TLS šifrování</label>
          </div>
          <Button variant="outline" size="sm">
            Otestovat připojení
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderTaxSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daňové sazby pro rok 2025</CardTitle>
          <CardDescription>Aktuální sazby daní a odvodů</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Daň z příjmu (%)</label>
              <input 
                type="number" 
                defaultValue="15"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Zdravotní pojištění (%)</label>
              <input 
                type="number" 
                defaultValue="13.5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sociální pojištění (%)</label>
              <input 
                type="number" 
                defaultValue="25"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Minimální mzda (Kč)</label>
              <input 
                type="number" 
                defaultValue="18900"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Limit pro DPP (Kč/měsíc)</label>
              <input 
                type="number" 
                defaultValue="12000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sleva na poplatníka</CardTitle>
          <CardDescription>Základní sleva a další odpočty</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Základní sleva (Kč/měsíc)</label>
              <input 
                type="number" 
                defaultValue="2570"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sleva na manželku (Kč/měsíc)</label>
              <input 
                type="number" 
                defaultValue="2570"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API klíče</CardTitle>
          <CardDescription>Integrace s externími službami</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">ARES API klíč</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="••••••••-••••-••••-••••-••••••••••••"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button variant="outline">Test</Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Bankovní API</h4>
            {[
              { name: 'Fio banka', status: 'connected' },
              { name: 'ČSOB', status: 'disconnected' },
              { name: 'Komerční banka', status: 'disconnected' },
              { name: 'Česká spořitelna', status: 'disconnected' },
              { name: 'Raiffeisenbank', status: 'disconnected' }
            ].map((bank) => (
              <div key={bank.name} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{bank.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={bank.status === 'connected' ? 'default' : 'secondary'}>
                    {bank.status === 'connected' ? 'Připojeno' : 'Nepřipojeno'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {bank.status === 'connected' ? 'Nastavit' : 'Připojit'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automatické zálohování</CardTitle>
          <CardDescription>Nastavení pravidelného zálohování dat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="auto-backup" defaultChecked className="rounded" />
            <label htmlFor="auto-backup" className="text-sm">Povolit automatické zálohování</label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Frekvence</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="daily">Denně</option>
                <option value="weekly">Týdně</option>
                <option value="monthly">Měsíčně</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Čas spuštění</label>
              <input 
                type="time" 
                defaultValue="02:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Umístění záloh</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="local">Lokální úložiště</option>
              <option value="gdrive">Google Drive</option>
              <option value="onedrive">OneDrive</option>
              <option value="aws">AWS S3</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Správa záloh</CardTitle>
          <CardDescription>Ruční zálohování a obnovení</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Vytvořit zálohu nyní
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Obnovit ze zálohy
            </Button>
          </div>

          <div className="border rounded-lg">
            <div className="p-3 bg-gray-50 border-b">
              <h4 className="font-medium">Poslední zálohy</h4>
            </div>
            <div className="space-y-2 p-3">
              {[
                { date: '2025-08-13 02:00', size: '45 MB', status: 'Úspěšná' },
                { date: '2025-08-12 02:00', size: '44 MB', status: 'Úspěšná' },
                { date: '2025-08-11 02:00', size: '43 MB', status: 'Úspěšná' }
              ].map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{backup.date}</span>
                    <span className="text-gray-500 ml-2">({backup.size})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{backup.status}</Badge>
                    <Button variant="outline" size="sm">Stáhnout</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nastavení systému</h1>
          <p className="text-gray-600">Správa globálních konstant pro šablony</p>
        </div>
        <Button className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Uložit změny
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'email' && renderEmailSettings()}
        {activeTab === 'taxes' && renderTaxSettings()}
        {activeTab === 'integrations' && renderIntegrations()}
        {activeTab === 'backup' && renderBackupSettings()}
      </div>
    </div>
  );
}
