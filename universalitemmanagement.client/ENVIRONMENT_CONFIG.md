# Environment Configuration

This document describes the environment configuration setup for the Universal Item Management client application.

## Environment Files

The application uses Angular's environment file replacement feature to manage different configurations for development and production.

### Files Created

1. **[src/environments/environment.ts](src/environments/environment.ts)** - Production configuration
2. **[src/environments/environment.development.ts](src/environments/environment.development.ts)** - Development configuration

## Configuration Structure

### Development Environment
```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:63820/api',
  hubUrl: 'https://localhost:63820/Hub',
};
```

### Production Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: '/api',
  hubUrl: '/Hub',
};
```

## Usage in Services

### EntityService
The base entity service now imports and uses the environment configuration:

```typescript
import { environment } from '../../../environments/environment';

export abstract class EntityService<T extends Entity> {
  base = environment.apiUrl;
  // ... rest of the service
}
```

**Before:**
```typescript
export const GetLocalOrigin = () => `${location.origin.split(':')[1]}:7070`;
base = GetLocalOrigin() + '/api';
```

**After:**
```typescript
base = environment.apiUrl;
```

### SignalRService
The SignalR service uses the hub URL from environment:

```typescript
import { environment } from '../../../../../environments/environment';

initConnection() {
  let builder = new HubConnectionBuilder()
    .withUrl(environment.hubUrl, {
      transport: signalR.HttpTransportType.WebSockets,
    })
    // ... rest of the configuration
}
```

**Before:**
```typescript
import { GetLocalOrigin } from '../../../services/entity.service';
.withUrl(GetLocalOrigin() + '/Hub', { ... })
```

**After:**
```typescript
.withUrl(environment.hubUrl, { ... })
```

## Build Configuration

The [angular.json](angular.json) has been updated with file replacements:

```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.ts"
        }
      ]
    },
    "development": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.development.ts"
        }
      ]
    }
  }
}
```

## How It Works

1. **Development Mode** (`ng serve` or `ng build --configuration=development`):
   - Uses `environment.development.ts`
   - API URL points to `https://localhost:63820/api`
   - Hub URL points to `https://localhost:63820/Hub`

2. **Production Mode** (`ng build` or `ng build --configuration=production`):
   - Uses `environment.ts`
   - API URL uses relative path `/api`
   - Hub URL uses relative path `/Hub`
   - Assumes API and client are served from same domain

## Updating Configuration

### For Development
Edit [src/environments/environment.development.ts](src/environments/environment.development.ts):

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://your-dev-server:port/api',
  hubUrl: 'https://your-dev-server:port/Hub',
};
```

### For Production
Edit [src/environments/environment.ts](src/environments/environment.ts):

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-domain.com/api',
  hubUrl: 'https://your-production-domain.com/Hub',
};
```

Or keep relative paths if API and client are on the same domain:

```typescript
export const environment = {
  production: true,
  apiUrl: '/api',
  hubUrl: '/Hub',
};
```

## Benefits

1. **Centralized Configuration**: All URLs in one place
2. **Environment-Specific**: Different settings for dev/prod
3. **Type-Safe**: TypeScript ensures correct usage
4. **Build-Time Replacement**: No runtime overhead
5. **No Hardcoded URLs**: Easy to update without touching service code

## Backend Configuration

Don't forget to set the database connection string environment variable on the server:

**Windows:**
```powershell
$env:DB_CONNECTION_STRING = "Host=192.168.1.126;Port=5432;Database=universalitemmanager;Username=casaos;Password=casaos;"
```

**Linux/Mac:**
```bash
export DB_CONNECTION_STRING="Host=192.168.1.126;Port=5432;Database=universalitemmanager;Username=casaos;Password=casaos;"
```

**Production (Docker/Kubernetes):**
Set as environment variable in your deployment configuration.

## Related Documentation

- [Field Property Integration](FIELD_PROPERTY_INTEGRATION.md)
- [Components Documentation](COMPONENTS_README.md)
- [Migrations Guide](../MIGRATIONS.md)
