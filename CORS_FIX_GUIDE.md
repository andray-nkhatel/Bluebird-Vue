# CORS Configuration Fix Guide

## Problem
The frontend is getting CORS errors when trying to connect to the backend API:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource 
at https://bluebirdhub.somee.com/api/auth/login. 
(Reason: CORS header 'Access-Control-Allow-Origin' does not match '*, *').
```

## Root Cause
The backend API server is sending an **invalid CORS header value**: `*, *` instead of `*` or a specific origin. Browsers reject this invalid header format, causing CORS errors.

**The backend must be fixed** to send a valid CORS header. Common issues:
1. Multiple `Access-Control-Allow-Origin` headers being set
2. Incorrect CORS configuration sending duplicate values
3. Middleware or server configuration conflict

## Backend Fix (ASP.NET Core)

### Option 1: Allow All Origins (Development Only - NOT Recommended for Production)
```csharp
// In Program.cs or Startup.cs

// Add CORS service
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Use CORS middleware
app.UseCors();
```

### Option 2: Specific Origins (Recommended for Production)
```csharp
// In Program.cs or Startup.cs

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "https://your-frontend-domain.com",
                "http://localhost:5173",  // Vite dev server
                "http://localhost:3000",  // Alternative dev port
                "https://your-production-frontend.com"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Only if using cookies/auth headers
    });
    
    // Or use named policy
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://your-frontend-domain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Apply CORS middleware (MUST be before UseAuthentication and UseAuthorization)
app.UseCors();
// Or for named policy:
// app.UseCors("AllowFrontend");
```

### Option 3: Configuration-Based (Best Practice)
```csharp
// In appsettings.json or appsettings.Production.json
{
  "Cors": {
    "AllowedOrigins": [
      "https://your-frontend-domain.com",
      "http://localhost:5173"
    ]
  }
}

// In Program.cs
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

app.UseCors();
```

## Important Notes

1. **Middleware Order Matters**: `UseCors()` must be called BEFORE `UseAuthentication()` and `UseAuthorization()`:
```csharp
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

2. **For Somee.com hosting**: Make sure CORS is enabled in your Somee.com hosting settings as well, if they have such options.

3. **Credentials**: If you're using `AllowCredentials()`, you CANNOT use `AllowAnyOrigin()`. You must specify exact origins.

4. **Preflight Requests**: The browser sends OPTIONS requests before actual requests. Make sure your API handles OPTIONS requests (CORS middleware does this automatically).

## Testing

After applying the fix, test from your frontend:
1. Clear browser cache
2. Try logging in
3. Check browser Network tab for CORS headers in response:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`

## Frontend Configuration (Already Implemented)

The frontend has been updated to:
- Show clearer CORS error messages to users
- Log detailed CORS error information for debugging
- Detect CORS errors specifically and display helpful messages
- Use Vite proxy for local development (see below)

## Frontend Workaround: Development Proxy (Local Development Only)

**The Vite proxy has been configured** to bypass CORS issues during local development.

### How to Use the Proxy

1. Create a `.env.local` file in the project root:
```bash
# Use the Vite proxy in development
VITE_API_BASE_URL=/api
```

2. The Vite dev server will now proxy all `/api/*` requests to `https://bluebirdhub.somee.com/api/*`, bypassing CORS.

3. For production builds, use the full backend URL:
```bash
# Production - direct API connection (requires backend CORS fix)
VITE_API_BASE_URL=https://bluebirdhub.somee.com/api
```

### Important Notes

- **The proxy only works in development mode** (`npm run dev`)
- **Production builds still require the backend CORS fix** - the proxy is not available in production builds
- The proxy forwards requests server-side, so CORS doesn't apply

### Current Implementation

The Vite config includes:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://bluebirdhub.somee.com',
      changeOrigin: true,
      secure: true
    }
  }
}
```

## Backend CORS Fix Requirements

**The backend MUST be fixed** for production use. The current error suggests:

1. **Check for duplicate CORS middleware** - Make sure CORS is only configured once
2. **Check for conflicting headers** - Multiple middleware might be setting the header
3. **Verify middleware order** - CORS must be before authentication
4. **Check web.config or IIS settings** - Somee.com might have additional CORS settings
5. **Ensure single origin value** - The header must be either `*` OR a specific origin, never `*, *`

### Example Backend Fix

```csharp
// Make sure this is ONLY called once
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://your-frontend-domain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Make sure UseCors is ONLY called once and BEFORE auth
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
```

### Checking for Duplicate Headers

Use browser DevTools Network tab to inspect the response headers. If you see:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Origin: *
```
This indicates duplicate middleware or configuration.

