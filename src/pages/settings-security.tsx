import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Key,
  Clock,
  Users,
  Lock,
  Smartphone,
  Eye,
  FileText,
  Settings,
  Wifi,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data pro bezpečnostní nastavení
const securitySettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90,
    historyCount: 5
  },
  sessionSettings: {
    sessionTimeout: 60,
    maxConcurrentSessions: 3,
    requireReauth: true,
    rememberDevice: false
  },
  twoFactorAuth: {
    enabled: true,
    method: 'app',
    backupCodes: 8,
    lastUpdate: '2025-01-10T10:00:00'
  },
  auditLog: {
    retentionDays: 365,
    logLevel: 'detailed',
    alertOnSuspicious: true,
    exportEnabled: true
  },
  networkSecurity: {
    allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
    sslRequired: true,
    hsts: true,
    contentSecurityPolicy: true
  }
};

const recentSecurityEvents = [
  {
    id: 1,
    type: 'login_success',
    user: 'admin@svj.cz',
    timestamp: '2025-01-12T14:30:00',
    ip: '192.168.1.100',
    device: 'Chrome/Windows',
    risk: 'low'
  },
  {
    id: 2,
    type: 'failed_login',
    user: 'unknown@domain.com',
    timestamp: '2025-01-12T13:45:00',
    ip: '203.0.113.10',
    device: 'Unknown',
    risk: 'high'
  },
  {
    id: 3,
    type: 'password_change',
    user: 'mzdova@svj.cz',
    timestamp: '2025-01-12T10:15:00',
    ip: '192.168.1.50',
    device: 'Firefox/Windows',
    risk: 'low'
  },
  {
    id: 4,
    type: 'data_export',
    user: 'admin@svj.cz',
    timestamp: '2025-01-12T09:00:00',
    ip: '192.168.1.100',
    device: 'Chrome/Windows',
    risk: 'medium'
  }
];

export default function SecuritySettings() {
  const [settings, setSettings] = useState(securitySettings);
  const [activeTab, setActiveTab] = useState('password');

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_success':
        return CheckCircle;
      case 'failed_login':
        return AlertTriangle;
      case 'password_change':
        return Key;
      case 'data_export':
        return FileText;
      default:
        return Settings;
    }
  };

  const getEventText = (type: string) => {
    switch (type) {
      case 'login_success':
        return 'Úspěšné přihlášení';
      case 'failed_login':
        return 'Neúspěšné přihlášení';
      case 'password_change':
        return 'Změna hesla';
      case 'data_export':
        return 'Export dat';
      default:
        return 'Neznámá akce';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">Zabezpečení</h1>
          <p className="text-gray-600">Nastavení bezpečnosti a auditování systému</p>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Úroveň zabezpečení</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">Vysoká</div>
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">2FA aktivní</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Aktivní relace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-gray-600">přihlášených uživatelů</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rizikové události</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-sm text-gray-600">za posledních 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Audit log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-sm text-gray-600">záznamů tento měsíc</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'password', label: 'Hesla', icon: Key },
          { id: 'sessions', label: 'Relace', icon: Clock },
          { id: 'twofactor', label: '2FA', icon: Smartphone },
          { id: 'audit', label: 'Audit', icon: Eye },
          { id: 'network', label: 'Síť', icon: Wifi }
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Password Policy Tab */}
      {activeTab === 'password' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Zásady pro hesla
            </CardTitle>
            <CardDescription>
              Nastavení požadavků na sílu a platnost hesel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimální délka hesla
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => updateSetting('passwordPolicy', 'minLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="6"
                  max="32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platnost hesla (dny)
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicy.maxAge}
                  onChange={(e) => updateSetting('passwordPolicy', 'maxAge', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="30"
                  max="365"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Historie hesel
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicy.historyCount}
                  onChange={(e) => updateSetting('passwordPolicy', 'historyCount', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-gray-500 mt-1">Počet posledních hesel, která nelze znovu použít</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vyžadovat velká písmena</label>
                    <p className="text-xs text-gray-500">Alespoň jedno velké písmeno</p>
                  </div>
                  <button
                    onClick={() => updateSetting('passwordPolicy', 'requireUppercase', !settings.passwordPolicy.requireUppercase)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.passwordPolicy.requireUppercase ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.passwordPolicy.requireUppercase ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vyžadovat číslice</label>
                    <p className="text-xs text-gray-500">Alespoň jednu číslici</p>
                  </div>
                  <button
                    onClick={() => updateSetting('passwordPolicy', 'requireNumbers', !settings.passwordPolicy.requireNumbers)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.passwordPolicy.requireNumbers ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.passwordPolicy.requireNumbers ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vyžadovat speciální znaky</label>
                    <p className="text-xs text-gray-500">Alespoň jeden speciální znak (!@#$%...)</p>
                  </div>
                  <button
                    onClick={() => updateSetting('passwordPolicy', 'requireSpecialChars', !settings.passwordPolicy.requireSpecialChars)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.passwordPolicy.requireSpecialChars ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.passwordPolicy.requireSpecialChars ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Správa relací
            </CardTitle>
            <CardDescription>
              Nastavení časových limitů a správy přihlášených uživatelů
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout relace (minuty)
                </label>
                <input
                  type="number"
                  value={settings.sessionSettings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionSettings', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="5"
                  max="480"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max. současných relací
                </label>
                <input
                  type="number"
                  value={settings.sessionSettings.maxConcurrentSessions}
                  onChange={(e) => updateSetting('sessionSettings', 'maxConcurrentSessions', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vyžadovat opětovné ověření</label>
                    <p className="text-xs text-gray-500">Pro citlivé operace vyžadovat zadání hesla</p>
                  </div>
                  <button
                    onClick={() => updateSetting('sessionSettings', 'requireReauth', !settings.sessionSettings.requireReauth)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sessionSettings.requireReauth ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.sessionSettings.requireReauth ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Zapamatovat zařízení</label>
                    <p className="text-xs text-gray-500">Umožnit "zapamatovat si toto zařízení"</p>
                  </div>
                  <button
                    onClick={() => updateSetting('sessionSettings', 'rememberDevice', !settings.sessionSettings.rememberDevice)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sessionSettings.rememberDevice ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.sessionSettings.rememberDevice ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two-Factor Authentication Tab */}
      {activeTab === 'twofactor' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Dvoufaktorové ověření (2FA)
            </CardTitle>
            <CardDescription>
              Nastavení dvoufaktorového ověření pro zvýšení bezpečnosti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">2FA je aktivní</div>
                    <div className="text-sm text-green-700">Poslední aktualizace: {new Date(settings.twoFactorAuth.lastUpdate).toLocaleDateString('cs-CZ')}</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Aktivní</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metoda ověření
                  </label>
                  <select 
                    value={settings.twoFactorAuth.method}
                    onChange={(e) => updateSetting('twoFactorAuth', 'method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="app">Mobilní aplikace (Google Authenticator, Authy)</option>
                    <option value="sms">SMS zpráva</option>
                    <option value="email">E-mail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Záložní kódy
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={settings.twoFactorAuth.backupCodes}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                    <Button variant="outline" size="sm">
                      Generovat nové
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Počet nevyužitých záložních kódů</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-900">Doporučení</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      Vygenerujte si záložní kódy a uložte je na bezpečném místě. V případě ztráty zařízení 
                      vám umožní přístup k účtu. Každý kód lze použít pouze jednou.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline">
                  Vygenerovat QR kód
                </Button>
                <Button variant="outline">
                  Stáhnout záložní kódy
                </Button>
                <Button variant="destructive">
                  Deaktivovat 2FA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Security Tab */}
      {activeTab === 'network' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Síťové zabezpečení
            </CardTitle>
            <CardDescription>
              Nastavení přístupových pravidel a síťové bezpečnosti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Povolené IP adresy/rozsahy
                </label>
                <div className="space-y-2">
                  {settings.networkSecurity.allowedIPs.map((ip, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ip}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="192.168.1.0/24"
                      />
                      <Button variant="outline" size="sm">
                        Odebrat
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm">
                    Přidat IP rozsah
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Prázdný seznam = přístup ze všech IP adres
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vyžadovat HTTPS</label>
                      <p className="text-xs text-gray-500">Automatické přesměrování na zabezpečené připojení</p>
                    </div>
                    <button
                      onClick={() => updateSetting('networkSecurity', 'sslRequired', !settings.networkSecurity.sslRequired)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.networkSecurity.sslRequired ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.networkSecurity.sslRequired ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">HSTS</label>
                      <p className="text-xs text-gray-500">HTTP Strict Transport Security</p>
                    </div>
                    <button
                      onClick={() => updateSetting('networkSecurity', 'hsts', !settings.networkSecurity.hsts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.networkSecurity.hsts ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.networkSecurity.hsts ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Content Security Policy</label>
                      <p className="text-xs text-gray-500">Ochrana proti XSS útokům</p>
                    </div>
                    <button
                      onClick={() => updateSetting('networkSecurity', 'contentSecurityPolicy', !settings.networkSecurity.contentSecurityPolicy)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.networkSecurity.contentSecurityPolicy ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.networkSecurity.contentSecurityPolicy ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Nastavení auditování
              </CardTitle>
              <CardDescription>
                Konfigurace logování a monitorování systémových událostí
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doba uchování logů (dny)
                  </label>
                  <input
                    type="number"
                    value={settings.auditLog.retentionDays}
                    onChange={(e) => updateSetting('auditLog', 'retentionDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="30"
                    max="2555"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Úroveň logování
                  </label>
                  <select 
                    value={settings.auditLog.logLevel}
                    onChange={(e) => updateSetting('auditLog', 'logLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="basic">Základní (přihlášení, odhlášení)</option>
                    <option value="detailed">Detailní (všechny akce)</option>
                    <option value="minimal">Minimální (pouze chyby)</option>
                  </select>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Upozornění na podezřelé aktivity</label>
                      <p className="text-xs text-gray-500">Automatické e-mailové upozornění</p>
                    </div>
                    <button
                      onClick={() => updateSetting('auditLog', 'alertOnSuspicious', !settings.auditLog.alertOnSuspicious)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.auditLog.alertOnSuspicious ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.auditLog.alertOnSuspicious ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Povolit export logů</label>
                      <p className="text-xs text-gray-500">Možnost exportu audit logů do CSV</p>
                    </div>
                    <button
                      onClick={() => updateSetting('auditLog', 'exportEnabled', !settings.auditLog.exportEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.auditLog.exportEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.auditLog.exportEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle>Poslední bezpečnostní události</CardTitle>
              <CardDescription>
                Přehled posledních aktivit a bezpečnostních událostí
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSecurityEvents.map((event) => {
                  const EventIcon = getEventIcon(event.type);
                  return (
                    <div key={event.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <EventIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">{getEventText(event.type)}</div>
                          <div className="text-sm text-gray-600">
                            {event.user} • {event.ip} • {event.device}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString('cs-CZ')}
                          </div>
                        </div>
                      </div>
                      <Badge className={getRiskColor(event.risk)}>
                        {event.risk === 'low' ? 'Nízké' : event.risk === 'medium' ? 'Střední' : 'Vysoké'} riziko
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Button variant="outline">Zobrazit všechny události</Button>
                <Button variant="outline">Export do CSV</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Uložit nastavení zabezpečení
        </Button>
      </div>
    </div>
  );
}
