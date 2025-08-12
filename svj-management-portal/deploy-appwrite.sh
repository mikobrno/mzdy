#!/bin/bash

# SVJ Portal Deployment Script pro Appwrite
echo "🚀 Začátek nasazení SVJ Portal na Appwrite..."

# Kontrola Appwrite CLI
if ! command -v appwrite &> /dev/null; then
    echo "❌ Appwrite CLI není nainstalované"
    echo "📥 Instalace: npm install -g appwrite-cli"
    exit 1
fi

# Přihlášení do Appwrite (pokud ještě nejste)
echo "🔐 Kontrola přihlášení do Appwrite..."
appwrite client --endpoint $APPWRITE_ENDPOINT --project $APPWRITE_PROJECT_ID --key $APPWRITE_API_KEY

# Vytvoření projektu (pokud neexistuje)
echo "📋 Vytváření/aktualizace projektu..."
appwrite projects create --projectId svj-portal --name "SVJ Management Portal" || echo "Projekt už existuje"

# Vytvoření databáze
echo "💾 Vytváření databáze..."
appwrite databases create --databaseId svj-portal-db --name "SVJ Portal Database" || echo "Databáze už existuje"

# Nahrání aplikace jako funkce
echo "📤 Nahrávání aplikace..."
appwrite functions create \
    --functionId svj-portal-web \
    --name "SVJ Portal Web App" \
    --runtime dotnet-8.0 \
    --execute any \
    --timeout 900 \
    --enabled true

# Nastavení proměnných prostředí
echo "⚙️ Nastavování proměnných prostředí..."
appwrite functions updateVar \
    --functionId svj-portal-web \
    --key ASPNETCORE_ENVIRONMENT \
    --value Production

appwrite functions updateVar \
    --functionId svj-portal-web \
    --key ASPNETCORE_URLS \
    --value "http://+:3000"

appwrite functions updateVar \
    --functionId svj-portal-web \
    --key ConnectionStrings__DefaultConnection \
    --value "$DATABASE_CONNECTION_STRING"

# Nasazení kódu
echo "🚀 Nasazování kódu..."
appwrite functions createDeployment \
    --functionId svj-portal-web \
    --entrypoint "src/SVJPortal.Web/SVJPortal.Web.csproj" \
    --code .

echo "✅ Nasazení dokončeno!"
echo "🌐 Aplikace bude dostupná na: https://$APPWRITE_PROJECT_ID.appwrite.org"

# Vytvoření HTTP endpointu
echo "🔗 Vytváření HTTP endpointu..."
appwrite functions createExecution \
    --functionId svj-portal-web \
    --async false
