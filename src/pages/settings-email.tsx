import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Mail, 
  Send, 
  CheckCircle2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Settings,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Play,
  Pause,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data pro e-mailové nastavení
const emailSettings = {
  smtp: {
    server: 'smtp.gmail.com',
    port: 587,
    username: 'mzdy@spr-svj.cz',
    password: '**********************',
    encryption: 'TLS',
    status: 'connected',
    lastTest: '2025-01-12T14:30:00',
    testResult: 'success'
  },
  templates: {
    default: {
      from: 'Mzdy SVJ <mzdy@spr-svj.cz>',
      replyTo: 'podpora@spr-svj.cz',
      footer: `
S pozdravem,
Tým SVJ Mzdového portálu
---
Tento e-mail byl vygenerován automaticky.
Pro otázky kontaktujte: podpora@spr-svj.cz
      `.trim()
    }
  },
  notifications: {
    payrollReminders: true,
    documentNotifications: true,
    systemAlerts: true,
    weeklyReports: false,
    monthlyReports: true
  },
  quotas: {
    dailyLimit: 500,
    dailyUsed: 47,
    monthlyLimit: 10000,
    monthlyUsed: 1248
  }
};

export default function EmailSettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [formData, setFormData] = useState(emailSettings);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    // Simulace testu SMTP připojení
    setTimeout(() => {
      setTestResult('success');
      setIsTestingConnection(false);
    }, 2000);
  };

  const handleSendTestEmail = () => {
    console.log('Odesílám testovací e-mail');
  };

  const handleSaveSettings = () => {
    console.log('Ukládám e-mailové nastavení', formData);
  };

  const getConnectionStatus = () => {
    if (isTestingConnection) {
      return { label: 'Testuje se...', color: 'bg-blue-100 text-blue-800', icon: Clock };
    }
    if (testResult === 'success' || formData.smtp.status === 'connected') {
      return { label: 'Připojeno', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
    if (testResult === 'error') {
      return { label: 'Chyba připojení', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    }
    return { label: 'Nepřipojeno', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
  };

  const statusInfo = getConnectionStatus();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na nastavení
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-mailové nastavení</h1>
          <p className="text-gray-600">Konfigurace SMTP serveru a e-mailových šablon</p>
        </div>
      </div>

      {/* SMTP Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Stav SMTP připojení
            </CardTitle>
            <Badge className={statusInfo.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{emailSettings.quotas.dailyUsed}</div>
              <div className="text-sm text-gray-600">Dnes odesláno</div>
              <div className="text-xs text-gray-500">z {emailSettings.quotas.dailyLimit}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{emailSettings.quotas.monthlyUsed}</div>
              <div className="text-sm text-gray-600">Tento měsíc</div>
              <div className="text-xs text-gray-500">z {emailSettings.quotas.monthlyLimit.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((emailSettings.quotas.dailyUsed / emailSettings.quotas.dailyLimit) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Denní využití</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {emailSettings.smtp.lastTest ? 
                  new Date(emailSettings.smtp.lastTest).toLocaleDateString('cs-CZ') : 
                  'Nikdy'
                }
              </div>
              <div className="text-sm text-gray-600">Poslední test</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMTP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              SMTP konfigurace
            </CardTitle>
            <CardDescription>
              Nastavení odchozího mailového serveru
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
              <input 
                type="text"
                value={formData.smtp.server}
                onChange={(e) => setFormData({
                  ...formData,
                  smtp: { ...formData.smtp, server: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="smtp.gmail.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <select 
                  value={formData.smtp.port}
                  onChange={(e) => setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, port: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={25}>25 (SMTP)</option>
                  <option value={587}>587 (STARTTLS)</option>
                  <option value={465}>465 (SSL/TLS)</option>
                  <option value={2525}>2525 (Alternative)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Šifrování</label>
                <select 
                  value={formData.smtp.encryption}
                  onChange={(e) => setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, encryption: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="TLS">TLS/STARTTLS</option>
                  <option value="SSL">SSL</option>
                  <option value="none">Bez šifrování</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uživatelské jméno</label>
              <input 
                type="email"
                value={formData.smtp.username}
                onChange={(e) => setFormData({
                  ...formData,
                  smtp: { ...formData.smtp, username: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="vase@email.cz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.smtp.password}
                  onChange={(e) => setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, password: e.target.value }
                  })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Heslo nebo App Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="flex items-center gap-2 flex-1"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isTestingConnection ? 'Testuje se...' : 'Test připojení'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleSendTestEmail}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Test e-mail
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Šablony e-mailů
            </CardTitle>
            <CardDescription>
              Výchozí nastavení pro odchozí e-maily
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Odesílatel (From)</label>
              <input 
                type="text"
                value={formData.templates.default.from}
                onChange={(e) => setFormData({
                  ...formData,
                  templates: {
                    ...formData.templates,
                    default: { ...formData.templates.default, from: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jméno <email@domena.cz>"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Odpovědět na (Reply-To)</label>
              <input 
                type="email"
                value={formData.templates.default.replyTo}
                onChange={(e) => setFormData({
                  ...formData,
                  templates: {
                    ...formData.templates,
                    default: { ...formData.templates.default, replyTo: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="podpora@domena.cz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standardní zápatí</label>
              <textarea 
                value={formData.templates.default.footer}
                onChange={(e) => setFormData({
                  ...formData,
                  templates: {
                    ...formData.templates,
                    default: { ...formData.templates.default, footer: e.target.value }
                  }
                })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Standardní zápatí e-mailu..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Automatické notifikace
          </CardTitle>
          <CardDescription>
            Nastavení automatických e-mailových upozornění
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Připomenutí výplat</label>
                  <p className="text-xs text-gray-500">Upozornění před výplatním termínem</p>
                </div>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      payrollReminders: !formData.notifications.payrollReminders
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.notifications.payrollReminders ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.notifications.payrollReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notifikace dokumentů</label>
                  <p className="text-xs text-gray-500">Upozornění na nové dokumenty</p>
                </div>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      documentNotifications: !formData.notifications.documentNotifications
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.notifications.documentNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.notifications.documentNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Systémová upozornění</label>
                  <p className="text-xs text-gray-500">Chyby a důležité události</p>
                </div>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      systemAlerts: !formData.notifications.systemAlerts
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.notifications.systemAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.notifications.systemAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Týdenní reporty</label>
                  <p className="text-xs text-gray-500">Souhrn týdenní aktivity</p>
                </div>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      weeklyReports: !formData.notifications.weeklyReports
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.notifications.weeklyReports ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Měsíční reporty</label>
                  <p className="text-xs text-gray-500">Měsíční přehled mezd a statistik</p>
                </div>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      monthlyReports: !formData.notifications.monthlyReports
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.notifications.monthlyReports ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.notifications.monthlyReports ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Uložit nastavení
        </Button>
      </div>
    </div>
  );
}
