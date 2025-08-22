import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  User, 
  ArrowLeft,
  Camera,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Globe,
  Palette,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Mock data pro uživatelský profil
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Jan',
    lastName: user?.lastName || 'Novák',
    email: user?.email || 'jan.novak@svjmanagement.cz',
    phone: '+420 123 456 789',
    position: 'Mzdový účetní',
    department: 'Mzdová agenda',
    avatar: null,
    language: 'cs',
    timezone: 'Europe/Prague',
    dateFormat: 'DD.MM.YYYY',
    theme: 'light'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    weeklyReport: true,
    securityAlerts: true,
    systemUpdates: false
  });

  const updateProfileField = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNotification = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    console.log('Ukládám profil:', profileData);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Hesla se neshodují');
      return;
    }
    console.log('Měním heslo');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleAvatarUpload = () => {
    console.log('Nahrávám nový avatar');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na dashboard
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Můj profil</h1>
          <p className="text-gray-600">Správa osobních údajů a nastavení účtu</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "destructive" : "default"}
        >
          {isEditing ? 'Zrušit úpravy' : 'Upravit profil'}
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
              </div>
              {isEditing && (
                <button
                  onClick={handleAvatarUpload}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h2>
              <p className="text-gray-600">{profileData.position}</p>
              <p className="text-sm text-gray-500">{profileData.department}</p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-green-100 text-green-800">Aktivní</Badge>
                <Badge className="bg-blue-100 text-blue-800">Ověřený účet</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Člen od</p>
              <p className="font-medium">15. ledna 2024</p>
              <p className="text-sm text-gray-500 mt-1">Poslední přihlášení</p>
              <p className="font-medium">Dnes v 14:30</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'personal', label: 'Osobní údaje', icon: User },
          { id: 'security', label: 'Zabezpečení', icon: Lock },
          { id: 'notifications', label: 'Notifikace', icon: Bell },
          { id: 'preferences', label: 'Předvolby', icon: Palette }
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

      {/* Personal Info Tab */}
      {activeTab === 'personal' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Osobní údaje
            </CardTitle>
            <CardDescription>
              Základní informace o vašem účtu a kontaktní údaje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jméno *
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => updateProfileField('firstName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Příjmení *
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => updateProfileField('lastName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => updateProfileField('email', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => updateProfileField('phone', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pozice
                </label>
                <input
                  type="text"
                  value={profileData.position}
                  onChange={(e) => updateProfileField('position', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oddělení
                </label>
                <select
                  value={profileData.department}
                  onChange={(e) => updateProfileField('department', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="Mzdová agenda">Mzdová agenda</option>
                  <option value="Správa SVJ">Správa SVJ</option>
                  <option value="IT podpora">IT podpora</option>
                  <option value="Administrativa">Administrativa</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Uložit změny
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Změna hesla
              </CardTitle>
              <CardDescription>
                Aktualizujte své heslo pro zvýšení bezpečnosti účtu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Současné heslo
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nové heslo
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Potvrzení nového hesla
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <Button onClick={handleChangePassword} className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Změnit heslo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dvoufaktorové ověření</CardTitle>
              <CardDescription>
                Zvyšte bezpečnost svého účtu pomocí 2FA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">2FA je aktivní</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Vaš účet je chráněn dvoufaktorovým ověřením</p>
                </div>
                <Button variant="outline">Spravovat 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Nastavení notifikací
            </CardTitle>
            <CardDescription>
              Vyberte, jaké notifikace chcete dostávat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'E-mailové notifikace', description: 'Dostávat notifikace na e-mail' },
                { key: 'pushNotifications', label: 'Push notifikace', description: 'Notifikace v prohlížeči' },
                { key: 'smsNotifications', label: 'SMS notifikace', description: 'Kritické upozornění přes SMS' },
                { key: 'weeklyReport', label: 'Týdenní přehled', description: 'Souhrnný e-mail každý týden' },
                { key: 'securityAlerts', label: 'Bezpečnostní upozornění', description: 'Upozornění na podezřelé aktivity' },
                { key: 'systemUpdates', label: 'Systémové aktualizace', description: 'Informace o nových funkcích' }
              ].map((notification) => (
                <div key={notification.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{notification.label}</div>
                    <div className="text-sm text-gray-500">{notification.description}</div>
                  </div>
                  <button
                    onClick={() => updateNotification(notification.key, !notificationSettings[notification.key as keyof typeof notificationSettings])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings[notification.key as keyof typeof notificationSettings] ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings[notification.key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Předvolby systému
            </CardTitle>
            <CardDescription>
              Přizpůsobte si rozhraní podle svých potřeb
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jazyk rozhraní
                </label>
                <select
                  value={profileData.language}
                  onChange={(e) => updateProfileField('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cs">Čeština</option>
                  <option value="sk">Slovenština</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Časová zóna
                </label>
                <select
                  value={profileData.timezone}
                  onChange={(e) => updateProfileField('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Europe/Prague">Praha (UTC+1)</option>
                  <option value="Europe/Bratislava">Bratislava (UTC+1)</option>
                  <option value="Europe/Vienna">Vídeň (UTC+1)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formát data
                </label>
                <select
                  value={profileData.dateFormat}
                  onChange={(e) => updateProfileField('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téma rozhraní
                </label>
                <select
                  value={profileData.theme}
                  onChange={(e) => updateProfileField('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Světlé</option>
                  <option value="dark">Tmavé</option>
                  <option value="auto">Automatické</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Uložit předvolby
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
