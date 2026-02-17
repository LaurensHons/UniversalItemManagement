# Build stage
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

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Copy published files
COPY --from=publish /app/publish .

# Set environment to Production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "UniversalItemManagement.Server.dll"]
