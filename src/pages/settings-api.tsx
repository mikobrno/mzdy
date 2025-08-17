import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Globe, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Settings,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data pro API integrace
const apiConnections = [
  {
    id: 'kb_api',
    name: 'Komerční banka API',
    description: 'API pro generování bankovních příkazů a kontrolu plateb',
    status: 'connected',
    endpoint: 'https://api.kb.cz/open-banking/v3.1',
    apiKey: 'kb_live_*********************',
    lastTest: '2025-01-12T14:30:00',
    testResult: 'success',
    features: ['Bankovní příkazy', 'Kontrola plateb', 'Výpisy účtů'],
    documentation: 'https://developer.kb.cz'
  },
  {
    id: 'cssz_api',
    name: 'ČSSZ API',
    description: 'Elektronické podávání přehledů sociálního pojištění',
    status: 'connected',
    endpoint: 'https://www.cssz.cz/epodani/api/v1',
    apiKey: 'cssz_*********************',
    lastTest: '2025-01-12T06:00:00',
    testResult: 'success',
    features: ['Elektronické přehledy', 'Kontrola plateb SP', 'Historie podání'],
    documentation: 'https://www.cssz.cz/epodani'
  },
  {
    id: 'vzp_api',
    name: 'VšZP API',
    description: 'Elektronické podávání přehledů zdravotního pojištění',
    status: 'connected',
    endpoint: 'https://www.vzp.cz/api/v2',
    apiKey: 'vzp_*********************',
    lastTest: '2025-01-12T06:15:00',
    testResult: 'success',
    features: ['Elektronické přehledy', 'Kontrola plateb ZP', 'Registr pojištěnců'],
    documentation: 'https://www.vzp.cz/api-dokumentace'
  },
  {
    id: 'cpzp_api',
    name: 'ČPZP API',
    description: 'Česká průmyslová zdravotní pojišťovna',
    status: 'error',
    endpoint: 'https://www.cpzp.cz/api/v1',
    apiKey: '',
    lastTest: '2025-01-10T12:00:00',
    testResult: 'error',
    features: ['Elektronické přehledy', 'Kontrola plateb'],
    documentation: 'https://www.cpzp.cz/api'
  },
  {
    id: 'mfcr_api',
    name: 'MinFin API',
    description: 'Ministerstvo financí - daňové sazby a kurzy',
    status: 'not_configured',
    endpoint: 'https://www.mfcr.cz/api/v1',
    apiKey: '',
    lastTest: null,
    testResult: null,
    features: ['Aktuální sazby DPH', 'Směnné kurzy', 'Daňové předpisy'],
    documentation: 'https://www.mfcr.cz/api-dokumentace'
  }
];

export default function ApiSettings() {
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState<string | null>(null);
  const [editingApi, setEditingApi] = useState<string | null>(null);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'connected':
        return { label: 'Připojeno', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'error':
        return { label: 'Chyba připojení', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      case 'not_configured':
        return { label: 'Není nastaveno', color: 'bg-yellow-100 text-yellow-800', icon: Settings };
      default:
        return { label: 'Neznámý', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    }
  };

  const handleTestConnection = async (apiId: string) => {
    setIsTestingApi(apiId);
    // Simulace testu API
    setTimeout(() => {
      setIsTestingApi(null);
      console.log(`Test API ${apiId} dokončen`);
    }, 2000);
  };

  const handleSaveApiKey = (apiId: string, newKey: string) => {
    console.log(`Ukládám API klíč pro ${apiId}: ${newKey}`);
    setEditingApi(null);
  };

  const toggleApiKeyVisibility = (apiId: string) => {
    setShowApiKey(showApiKey === apiId ? null : apiId);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na nastavení
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">API integrace</h1>
          <p className="text-gray-600">Správa připojení k externím službám a API</p>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Celkem API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiConnections.length}</div>
            <p className="text-sm text-gray-600">nakonfigurovaných</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Aktivní</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {apiConnections.filter(api => api.status === 'connected').length}
            </div>
            <p className="text-sm text-gray-600">funkčních</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Chyby</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {apiConnections.filter(api => api.status === 'error').length}
            </div>
            <p className="text-sm text-gray-600">problémových</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Nenastavené</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {apiConnections.filter(api => api.status === 'not_configured').length}
            </div>
            <p className="text-sm text-gray-600">čekajících</p>
          </CardContent>
        </Card>
      </div>

      {/* API Connections */}
      <div className="space-y-6">
        {apiConnections.map((api) => {
          const statusInfo = getStatusInfo(api.status);
          const StatusIcon = statusInfo.icon;
          const isEditing = editingApi === api.id;
          const isTesting = isTestingApi === api.id;
          const showKey = showApiKey === api.id;

          return (
            <Card key={api.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{api.name}</CardTitle>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <CardDescription>{api.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(api.documentation, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Dokumentace
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(api.id)}
                      disabled={isTesting || api.status === 'not_configured'}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-3 w-3 ${isTesting ? 'animate-spin' : ''}`} />
                      {isTesting ? 'Testuje se...' : 'Test'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* API Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                      <input 
                        type="text"
                        value={api.endpoint}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API klíč</label>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <input 
                              type="text"
                              defaultValue={api.apiKey.replace(/\*/g, '')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Zadejte API klíč"
                            />
                            <Button size="sm" onClick={() => handleSaveApiKey(api.id, 'new-key')}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingApi(null)}>
                              <AlertTriangle className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <input 
                              type={showKey ? "text" : "password"}
                              value={api.apiKey}
                              readOnly
                              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                            />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toggleApiKeyVisibility(api.id)}
                            >
                              {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingApi(api.id)}>
                              <Settings className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dostupné funkce</label>
                    <div className="flex flex-wrap gap-2">
                      {api.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Last Test Info */}
                  {api.lastTest && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium">
                          Poslední test: {new Date(api.lastTest).toLocaleString('cs-CZ')}
                        </div>
                        <div className={`text-xs ${
                          api.testResult === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {api.testResult === 'success' ? 'Úspěšně dokončen' : 'Test selhal - zkontrolujte konfiguraci'}
                        </div>
                      </div>
                      <Badge className={
                        api.testResult === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }>
                        {api.testResult === 'success' ? 'OK' : 'Chyba'}
                      </Badge>
                    </div>
                  )}

                  {/* Configuration Hints */}
                  {api.status === 'not_configured' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm text-yellow-800">
                        <strong>Nastavení:</strong> Pro aktivaci tohoto API je potřeba zadat platný API klíč. 
                        Klíč získáte v administračním rozhraní poskytovatele služby.
                      </div>
                    </div>
                  )}

                  {api.status === 'error' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm text-red-800">
                        <strong>Chyba:</strong> API neodpovídá nebo je nesprávně nakonfigurované. 
                        Zkontrolujte API klíč a síťové připojení.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional API Settings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Globální nastavení API
          </CardTitle>
          <CardDescription>
            Obecné nastavení pro všechna API připojení
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (sekundy)</label>
              <input 
                type="number"
                defaultValue={30}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Počet opakování při chybě</label>
              <input 
                type="number"
                defaultValue={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interval testování (hodiny)</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value={1}>1 hodina</option>
                <option value={6}>6 hodin</option>
                <option value={12}>12 hodin</option>
                <option value={24}>24 hodin</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Automatické testování</label>
                <p className="text-xs text-gray-500">Pravidelné kontroly dostupnosti API</p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-600"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Uložit nastavení
        </Button>
      </div>
    </div>
  );
}
