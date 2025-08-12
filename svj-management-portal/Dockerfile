# Použijeme oficiální .NET 8.0 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Použijeme SDK image pro build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Kopírujeme project files
COPY ["src/SVJPortal.Web/SVJPortal.Web.csproj", "src/SVJPortal.Web/"]
COPY ["src/SVJPortal.Core/SVJPortal.Core.csproj", "src/SVJPortal.Core/"]

# Restore dependencies
RUN dotnet restore "src/SVJPortal.Web/SVJPortal.Web.csproj"

# Kopírujeme zbytek kódu
COPY . .
WORKDIR "/src/src/SVJPortal.Web"

# Build aplikace
RUN dotnet build "SVJPortal.Web.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "SVJPortal.Web.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Finální image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Nastavení prostředí
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80

# Vytvoření non-root uživatele
RUN adduser --disabled-password --gecos '' --uid 1001 appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "SVJPortal.Web.dll"]
