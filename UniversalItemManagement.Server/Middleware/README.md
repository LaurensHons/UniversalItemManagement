# Exception Handling Middleware

## Overview

The `ExceptionHandlingMiddleware` provides global exception handling for the application, catching unhandled exceptions and returning standardized error responses.

## Features

- **Global Exception Catching** - Catches all unhandled exceptions in the request pipeline
- **Standardized Error Format** - Returns consistent `ErrorResponse` objects
- **HTTP Status Code Mapping** - Maps exception types to appropriate HTTP status codes
- **Environment-Aware** - Includes stack traces in development, hides them in production
- **Comprehensive Logging** - Logs all exceptions with details
- **TraceId Support** - Includes correlation IDs for debugging

## Error Response Format

```json
{
  "message": "User-friendly error message",
  "details": "Stack trace (development only)",
  "statusCode": 400,
  "path": "/api/resource",
  "timestamp": "2024-01-15T10:30:00Z",
  "traceId": "00-abc123..."
}
```

## Exception Mapping

| Exception Type | HTTP Status Code | Message |
|----------------|------------------|---------|
| `ArgumentNullException` | 400 Bad Request | "A required parameter was null" |
| `ArgumentException` | 400 Bad Request | Exception message |
| `InvalidOperationException` | 400 Bad Request | Exception message |
| `KeyNotFoundException` | 404 Not Found | "The requested resource was not found" |
| `UnauthorizedAccessException` | 403 Forbidden | "Access to this resource is forbidden" |
| `NotImplementedException` | 501 Not Implemented | "This functionality is not yet implemented" |
| `TimeoutException` | 408 Request Timeout | "The request timed out" |
| All other exceptions | 500 Internal Server Error | "An internal server error occurred" |

## Usage

### Registration

The middleware is registered in [Program.cs](../Program.cs):

```csharp
var app = builder.Build();

// Must be first in the pipeline
app.UseExceptionHandling();

// ... other middleware
```

### Throwing Exceptions in Controllers

Controllers can throw exceptions naturally, and the middleware will handle them:

```csharp
[HttpGet("{id}")]
public async Task<ActionResult<RecordDto>> GetById(Guid id)
{
    var entity = await _repository.FindByIdAsync(id);

    if (entity == null)
        throw new KeyNotFoundException($"Record with ID {id} not found");

    return Ok(_mapper.Map(entity));
}
```

### Custom Exception Types

To add custom exception handling:

1. Create your custom exception:
```csharp
public class BusinessRuleViolationException : Exception
{
    public BusinessRuleViolationException(string message) : base(message) { }
}
```

2. Add mapping in `ExceptionHandlingMiddleware.GetStatusCodeAndMessage()`:
```csharp
private (HttpStatusCode statusCode, string message) GetStatusCodeAndMessage(Exception exception)
{
    return exception switch
    {
        BusinessRuleViolationException => (HttpStatusCode.UnprocessableEntity, exception.Message),
        // ... existing mappings
    };
}
```

## Testing

### Unit Tests

See [ExceptionHandlingMiddlewareTests.cs](../../UniversalItemManagement.IntegrationTests/Middleware/ExceptionHandlingMiddlewareTests.cs) for comprehensive unit tests.

Run tests:
```bash
dotnet test --filter "FullyQualifiedName~ExceptionHandlingMiddlewareTests"
```

### Integration Tests

See [ExceptionHandlingIntegrationTests.cs](../../UniversalItemManagement.IntegrationTests/Middleware/ExceptionHandlingIntegrationTests.cs) for end-to-end tests with real controllers.

Run tests:
```bash
dotnet test --filter "FullyQualifiedName~ExceptionHandlingIntegrationTests"
```

### Manual Testing

Use the TestController endpoints (development only):

```bash
# Test ArgumentNullException → 400
GET /api/test/throw-argument-null

# Test KeyNotFoundException → 404
GET /api/test/throw-not-found

# Test UnauthorizedAccessException → 403
GET /api/test/throw-unauthorized

# Test InvalidOperationException → 400
GET /api/test/throw-invalid-operation

# Test unhandled Exception → 500
GET /api/test/throw-unhandled

# Test successful request
GET /api/test/success
```

## Development vs Production

### Development Environment

- **Stack Traces Included**: `details` field contains full exception details
- **Verbose Logging**: All exceptions logged with full context
- **TestController Available**: Test endpoints are accessible

Example response:
```json
{
  "message": "Invalid operation",
  "details": "System.InvalidOperationException: Invalid operation\n   at ...",
  "statusCode": 400,
  "path": "/api/resource",
  "timestamp": "2024-01-15T10:30:00Z",
  "traceId": "00-abc123..."
}
```

### Production Environment

- **No Stack Traces**: `details` field is null
- **Generic Messages**: Sensitive information hidden
- **TestController Disabled**: Test endpoints return 404

Example response:
```json
{
  "message": "An internal server error occurred",
  "statusCode": 500,
  "path": "/api/resource",
  "timestamp": "2024-01-15T10:30:00Z",
  "traceId": "00-abc123..."
}
```

## Best Practices

1. **Throw Specific Exceptions** - Use the most specific exception type:
   ```csharp
   // Good
   throw new KeyNotFoundException($"Entity {id} not found");

   // Bad
   throw new Exception("Entity not found");
   ```

2. **Include Helpful Messages** - Provide context in exception messages:
   ```csharp
   // Good
   throw new ArgumentException($"Invalid status '{status}'. Must be 'Active' or 'Inactive'", nameof(status));

   // Bad
   throw new ArgumentException("Invalid status");
   ```

3. **Don't Catch and Rethrow** - Let the middleware handle it:
   ```csharp
   // Good
   var entity = await _repository.FindByIdAsync(id);
   if (entity == null)
       throw new KeyNotFoundException();

   // Bad
   try {
       var entity = await _repository.FindByIdAsync(id);
   } catch (Exception ex) {
       throw; // Unnecessary
   }
   ```

4. **Use HTTP-Aware Exceptions** - Choose exceptions that map to the right status code:
   - Use `KeyNotFoundException` for 404s
   - Use `ArgumentException` for 400s
   - Use `UnauthorizedAccessException` for 403s

5. **Log Before Throwing** - For important business logic failures:
   ```csharp
   if (balance < amount)
   {
       _logger.LogWarning("Insufficient balance: {Balance} < {Amount}", balance, amount);
       throw new InvalidOperationException("Insufficient balance");
   }
   ```

## Troubleshooting

### Exception Not Being Caught

**Problem**: Exceptions bypass the middleware.

**Solution**: Ensure `UseExceptionHandling()` is called **first** in the middleware pipeline:
```csharp
var app = builder.Build();
app.UseExceptionHandling(); // Must be first!
```

### Stack Traces in Production

**Problem**: Stack traces are exposed in production.

**Solution**: Verify environment is set correctly:
```bash
# Check environment
echo $ASPNETCORE_ENVIRONMENT

# Should be "Production", not "Development"
```

### TraceId Not Working

**Problem**: TraceId is always empty.

**Solution**: Ensure Activity.Current is available or use `HttpContext.TraceIdentifier` as fallback (already implemented).

## Related Files

- Middleware: [ExceptionHandlingMiddleware.cs](ExceptionHandlingMiddleware.cs)
- Error Model: [Models/ErrorResponse.cs](Models/ErrorResponse.cs)
- Extensions: [MiddlewareExtensions.cs](MiddlewareExtensions.cs)
- Registration: [../Program.cs](../Program.cs)
- Unit Tests: [../../UniversalItemManagement.IntegrationTests/Middleware/ExceptionHandlingMiddlewareTests.cs](../../UniversalItemManagement.IntegrationTests/Middleware/ExceptionHandlingMiddlewareTests.cs)
- Integration Tests: [../../UniversalItemManagement.IntegrationTests/Middleware/ExceptionHandlingIntegrationTests.cs](../../UniversalItemManagement.IntegrationTests/Middleware/ExceptionHandlingIntegrationTests.cs)
- Test Controller: [../Controllers/TestController.cs](../Controllers/TestController.cs)
