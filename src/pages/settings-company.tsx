import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Building, 
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Calendar,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Globe,
  Banknote
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data pro firemní nastavení
const companyData = {
  basicInfo: {
    name: 'SVJ Management s.r.o.',
    tradingName: 'SVJ Management',
    registrationNumber: '12345678',
    taxNumber: 'CZ12345678',
    vatNumber: '',
    establishedDate: '2020-01-15',
    legalForm: 'Společnost s ručením omezeným'
  },
  address: {
    street: 'Václavské náměstí 123',
    city: 'Praha',
    postalCode: '110 00',
    country: 'Česká republika',
    region: 'Hlavní město Praha'
  },
  contact: {
    phone: '+420 123 456 789',
    fax: '+420 123 456 790',
    email: 'info@svjmanagement.cz',
    website: 'https://www.svjmanagement.cz'
  },
  bankAccounts: [
    {
      id: 1,
      bankName: 'Komerční banka',
      accountNumber: '123456789/0100',
      iban: 'CZ6501000000000123456789',
      swift: 'KOMBCZPP',
      currency: 'CZK',
      purpose: 'Provozní účet',
      isDefault: true
    },
    {
      id: 2,
      bankName: 'Česká spořitelna',
      accountNumber: '987654321/0800',
      iban: 'CZ6508000000000987654321',
      swift: 'GIBACZPX',
      currency: 'CZK',
      purpose: 'Rezervní účet',
      isDefault: false
    }
  ],
  documents: {
    logo: 'company-logo.png',
    signature: 'signature.png',
    stamp: 'company-stamp.png',
    certificate: 'trade-license.pdf',
    articles: 'articles-of-association.pdf'
  },
  certifications: [
    {
      id: 1,
      name: 'ISO 9001:2015',
      issuer: 'Bureau Veritas',
      issueDate: '2024-03-15',
      expiryDate: '2027-03-14',
      status: 'active',
      certificateNumber: 'CZ-BV-001234'
    },
    {
      id: 2,
      name: 'ISO 14001:2015',
      issuer: 'SGS',
      issueDate: '2024-06-01',
      expiryDate: '2027-05-31',
      status: 'active',
      certificateNumber: 'CZ-SGS-005678'
    }
  ]
};

export default function CompanySettings() {
  const [data, setData] = useState(companyData);
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);

  const updateBasicInfo = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }));
  };

  const updateAddress = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const updateContact = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handleFileUpload = (type: string) => {
    console.log(`Nahrávám soubor typu: ${type}`);
  };

  const getCertificationStatus = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Platné', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'expiring':
        return { label: 'Končí platnost', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
      case 'expired':
        return { label: 'Prošlé', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      default:
        return { label: 'Neznámé', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Nastavení společnosti</h1>
          <p className="text-gray-600">Správa základních údajů o společnosti a certifikací</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "destructive" : "default"}
        >
          {isEditing ? 'Zrušit úpravy' : 'Upravit údaje'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'basic', label: 'Základní údaje', icon: Building },
          { id: 'address', label: 'Adresa', icon: MapPin },
          { id: 'contact', label: 'Kontakt', icon: Phone },
          { id: 'banking', label: 'Bankovní účty', icon: CreditCard },
          { id: 'documents', label: 'Dokumenty', icon: FileText },
          { id: 'certifications', label: 'Certifikace', icon: CheckCircle }
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

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Základní údaje společnosti
            </CardTitle>
            <CardDescription>
              Obchodní název, IČO, DIČ a další základní informace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obchodní název *
                </label>
                <input
                  type="text"
                  value={data.basicInfo.name}
                  onChange={(e) => updateBasicInfo('name', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zkrácený název
                </label>
                <input
                  type="text"
                  value={data.basicInfo.tradingName}
                  onChange={(e) => updateBasicInfo('tradingName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IČO *
                </label>
                <input
                  type="text"
                  value={data.basicInfo.registrationNumber}
                  onChange={(e) => updateBasicInfo('registrationNumber', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DIČ
                </label>
                <input
                  type="text"
                  value={data.basicInfo.taxNumber}
                  onChange={(e) => updateBasicInfo('taxNumber', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DIČ pro DPH
                </label>
                <input
                  type="text"
                  value={data.basicInfo.vatNumber}
                  onChange={(e) => updateBasicInfo('vatNumber', e.target.value)}
                  disabled={!isEditing}
                  placeholder="CZ12345678"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum vzniku
                </label>
                <input
                  type="date"
                  value={data.basicInfo.establishedDate}
                  onChange={(e) => updateBasicInfo('establishedDate', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Právní forma
                </label>
                <select
                  value={data.basicInfo.legalForm}
                  onChange={(e) => updateBasicInfo('legalForm', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="Společnost s ručením omezeným">Společnost s ručením omezeným</option>
                  <option value="Akciová společnost">Akciová společnost</option>
                  <option value="Živnostenský subjekt">Živnostenský subjekt</option>
                  <option value="Obecně prospěšná společnost">Obecně prospěšná společnost</option>
                  <option value="Společenství vlastníků jednotek">Společenství vlastníků jednotek</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Tab */}
      {activeTab === 'address' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Sídlo společnosti
            </CardTitle>
            <CardDescription>
              Adresa sídla společnosti pro úřední korespondenci
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ulice a číslo popisné *
                </label>
                <input
                  type="text"
                  value={data.address.street}
                  onChange={(e) => updateAddress('street', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Město *
                </label>
                <input
                  type="text"
                  value={data.address.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PSČ *
                </label>
                <input
                  type="text"
                  value={data.address.postalCode}
                  onChange={(e) => updateAddress('postalCode', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kraj/Region
                </label>
                <input
                  type="text"
                  value={data.address.region}
                  onChange={(e) => updateAddress('region', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Země
                </label>
                <select
                  value={data.address.country}
                  onChange={(e) => updateAddress('country', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="Česká republika">Česká republika</option>
                  <option value="Slovenská republika">Slovenská republika</option>
                  <option value="Rakousko">Rakousko</option>
                  <option value="Německo">Německo</option>
                  <option value="Polsko">Polsko</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Kontaktní údaje
            </CardTitle>
            <CardDescription>
              Telefonní čísla, e-mail a webové stránky společnosti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={data.contact.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fax
                </label>
                <input
                  type="tel"
                  value={data.contact.fax}
                  onChange={(e) => updateContact('fax', e.target.value)}
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
                  value={data.contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webové stránky
                </label>
                <input
                  type="url"
                  value={data.contact.website}
                  onChange={(e) => updateContact('website', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Banking Tab */}
      {activeTab === 'banking' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Bankovní účty
                </CardTitle>
                <CardDescription>
                  Správa bankovních účtů společnosti
                </CardDescription>
              </div>
              <Button variant="outline" disabled={!isEditing}>
                Přidat účet
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.bankAccounts.map((account) => (
                <div key={account.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{account.bankName}</h3>
                        {account.isDefault && (
                          <Badge className="bg-blue-100 text-blue-800">Výchozí</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{account.purpose}</p>
                    </div>
                    <Button variant="outline" size="sm" disabled={!isEditing}>
                      Upravit
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Číslo účtu
                      </label>
                      <div className="text-sm font-mono">{account.accountNumber}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        IBAN
                      </label>
                      <div className="text-sm font-mono">{account.iban}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        SWIFT/BIC
                      </label>
                      <div className="text-sm font-mono">{account.swift}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Měna
                      </label>
                      <div className="text-sm">{account.currency}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Firemní dokumenty
            </CardTitle>
            <CardDescription>
              Správa logo, podpisů, razítek a dalších dokumentů
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'logo', label: 'Firemní logo', description: 'PNG, JPG (max. 2MB)', current: data.documents.logo },
                { key: 'signature', label: 'Digitální podpis', description: 'PNG (transparentní pozadí)', current: data.documents.signature },
                { key: 'stamp', label: 'Firemní razítko', description: 'PNG (transparentní pozadí)', current: data.documents.stamp },
                { key: 'certificate', label: 'Živnostenský list', description: 'PDF', current: data.documents.certificate },
                { key: 'articles', label: 'Společenská smlouva', description: 'PDF', current: data.documents.articles }
              ].map((doc) => (
                <div key={doc.key} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{doc.label}</h3>
                    {doc.current && (
                      <Badge className="bg-green-100 text-green-800">Nahráno</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                  {doc.current && (
                    <div className="text-sm text-gray-800 mb-3 font-mono bg-gray-50 p-2 rounded">
                      {doc.current}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileUpload(doc.key)}
                      disabled={!isEditing}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-3 w-3" />
                      {doc.current ? 'Nahradit' : 'Nahrát'}
                    </Button>
                    {doc.current && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-3 w-3" />
                        Stáhnout
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Certifikace a osvědčení
                </CardTitle>
                <CardDescription>
                  Přehled platných certifikací a jejich expirace
                </CardDescription>
              </div>
              <Button variant="outline" disabled={!isEditing}>
                Přidat certifikaci
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.certifications.map((cert) => {
                const statusInfo = getCertificationStatus(cert.status);
                const StatusIcon = statusInfo.icon;
                const daysToExpiry = Math.ceil((new Date(cert.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

                return (
                  <div key={cert.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{cert.name}</h3>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Vydavatel: {cert.issuer}</p>
                        <p className="text-sm text-gray-600">Číslo certifikátu: {cert.certificateNumber}</p>
                      </div>
                      <Button variant="outline" size="sm" disabled={!isEditing}>
                        Upravit
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Datum vydání
                        </label>
                        <div className="text-sm">{new Date(cert.issueDate).toLocaleDateString('cs-CZ')}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Platnost do
                        </label>
                        <div className="text-sm">{new Date(cert.expiryDate).toLocaleDateString('cs-CZ')}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Zbývající dny
                        </label>
                        <div className={`text-sm font-medium ${
                          daysToExpiry < 30 ? 'text-red-600' : 
                          daysToExpiry < 90 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {daysToExpiry > 0 ? `${daysToExpiry} dní` : 'Prošlé'}
                        </div>
                      </div>
                    </div>

                    {daysToExpiry < 90 && daysToExpiry > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <strong>Upozornění:</strong> Certifikace expiruje za méně než 90 dní. 
                            Doporučujeme zahájit proces obnovy.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end mt-6 gap-4">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Zrušit
          </Button>
          <Button className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Uložit změny
          </Button>
        </div>
      )}
    </div>
  );
}
