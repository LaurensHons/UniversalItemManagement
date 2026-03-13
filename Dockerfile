# Angular build stage
FROM node:20-alpine AS client-build
WORKDIR /client
COPY universalitemmanagement.client/package*.json ./
RUN npm ci --maxsockets=5 --retry 3
COPY universalitemmanagement.client/ .
RUN npm run build -- --configuration production --base-href /universalitemmanagement/

# .NET build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["UniversalItemManagement.Server/UniversalItemManagement.Server.csproj", "UniversalItemManagement.Server/"]
COPY ["UniversalItemManagement.EF/UniversalItemManagement.EF.csproj", "UniversalItemManagement.EF/"]
RUN dotnet restore "UniversalItemManagement.Server/UniversalItemManagement.Server.csproj"

# Copy the rest of the source code
COPY . .

# Build the application
WORKDIR "/src/UniversalItemManagement.Server"
RUN dotnet build "UniversalItemManagement.Server.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "UniversalItemManagement.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build EF migration bundle
RUN dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"
WORKDIR /src
RUN dotnet ef migrations bundle -o /app/efbundle --force \
    --project UniversalItemManagement.EF/UniversalItemManagement.EF.csproj \
    --startup-project UniversalItemManagement.Server/UniversalItemManagement.Server.csproj

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080

# Copy published .NET files
COPY --from=publish /app/publish .
COPY --from=publish /app/efbundle ./efbundle

# Copy Angular build output into wwwroot
COPY --from=client-build /client/dist/universalitemmanagement.client ./wwwroot

# Set environment to Production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "UniversalItemManagement.Server.dll"]
