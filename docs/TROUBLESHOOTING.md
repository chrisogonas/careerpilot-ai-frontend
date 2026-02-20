# CareerPilot AI Frontend - Troubleshooting Guide

Quick reference for common issues and solutions.

---

## Installation & Setup Issues

### npm install Fails with ERESOLVE Error

**Error Message**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! While resolving: careerpilot@1.0.0
npm ERR! Found: eslint@9.x.x
npm ERR! Required: eslint@^7.23.0
```

**Cause**: Peer dependency conflict between ESLint versions

**Solution**:
```bash
# Method 1: Use legacy peer deps flag (RECOMMENDED)
npm install --legacy-peer-deps

# Method 2: If you've already created .npmrc
npm install

# Method 3: Manual resolution
npm install --force
```

**Prevention**: 
- `.npmrc` file is configured with `legacy-peer-deps=true`
- Ensure file exists before running `npm install`

---

### Node Version Incompatibility

**Error Message**:
```
This version of npm requires Node.js 18.x or higher
```

**Solution**:
1. Check your Node version:
   ```bash
   node --version
   ```

2. If version < 18:
   - Download Node.js 18 LTS or higher from [nodejs.org](https://nodejs.org/)
   - Reinstall Node.js
   - Verify: `node --version` should be 18+

3. Clear npm cache and reinstall:
   ```bash
   npm cache clean --force
   npm install
   ```

---

### Missing Environment Variables

**Error**: 
```
Cannot find NEXT_PUBLIC_API_BASE_URL
```

**Cause**: Missing `.env.local` file or incorrect configuration

**Solution**:
1. Check if `.env.local` exists:
   ```bash
   # Windows PowerShell
   Test-Path .env.local
   
   # Mac/Linux
   ls .env.local
   ```

2. If not found, create it:
   ```bash
   # Create .env.local in project root
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_JWT_STORAGE_KEY=careerpilot_token
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

---

## Development Server Issues

### Port 3000 Already in Use

**Error**:
```
Port 3000 is already in use
```

**Solution**:

**Option 1**: Kill the process using port 3000
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -i :3000
kill -9 [PID]
```

**Option 2**: Use a different port
```bash
npm run dev -- -p 3001
```

---

### Dev Server Not Responding

**Symptoms**: Page keeps loading or "connection refused"

**Solution**:
1. Check if server is running:
   ```bash
   # Should see "ready started server"
   npm run dev
   ```

2. Check backend API is running:
   ```bash
   curl http://localhost:8000/api/v1/health
   # Should return 200 OK
   ```

3. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

4. Restart from scratch:
   ```bash
   npm cache clean --force
   npm install
   npm run dev
   ```

---

### Hot Module Replacement (HMR) Not Working

**Symptoms**: Changes not reflected in browser after file save

**Solution**:
1. Ensure you're saving files (Ctrl+S or Cmd+S)
2. Check console for errors (F12)
3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
4. Restart dev server:
   ```bash
   # Stop current: Ctrl+C
   npm run dev
   ```

---

## Build Issues

### TypeScript Compilation Errors

**Error**: `Type 'X' is not assignable to type 'Y'`

**Common Causes & Solutions**:

1. **Type mismatch in API response**:
   ```typescript
   // ❌ Wrong - assuming nested structure
   const token = response.tokens.access_token;
   
   // ✅ Correct - API returns flat structure
   const token = response.access_token;
   ```

2. **Missing type annotations**:
   ```typescript
   // ❌ Wrong
   const user = getUserData();
   
   // ✅ Correct
   const user: User = getUserData();
   ```

3. **Incorrect props type**:
   ```typescript
   // ❌ Wrong - no interface
   export default function Component({ user }) { }
   
   // ✅ Correct
   interface Props { user: User; }
   export default function Component({ user }: Props) { }
   ```

**Fix**:
1. Read the error carefully - it shows exact type mismatch
2. Check the type definition in `lib/types/index.ts`
3. Use TypeScript strict mode to catch all issues
4. Run `npm run build` to see all errors at once

---

### Build Fails with "Module not found"

**Error**:
```
Module not found: Can't resolve '@/lib/types'
```

**Causes**:
1. File doesn't exist at that path
2. Wrong import path (case-sensitive)
3. Incorrect alias in `tsconfig.json`

**Solution**:
1. Verify file exists:
   ```bash
   # Windows PowerShell
   Test-Path lib/types/index.ts
   
   # Mac/Linux
   ls lib/types/index.ts
   ```

2. Check import path (case-sensitive):
   ```typescript
   // ✅ Correct
   import type { User } from "@/lib/types";
   
   // ❌ Wrong (different case)
   import type { User } from "@/lib/Types";
   ```

3. Verify `tsconfig.json` alias:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

4. Restart dev server after fixing TSConfig

---

### Static Generation Error (ReferenceError: location is undefined)

**Error**:
```
ReferenceError: location is undefined
error - Error: location is not defined
```

**Cause**: Component using browser APIs (like `useRouter`) at build time

**Solution**: Add dynamic rendering flag to protected pages:
```typescript
"use client";
export const dynamic = "force-dynamic";  // ← Add this

import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const router = useRouter();
  // Rest of component
}
```

**Pages needing this flag**:
- dashboard
- tailor
- cover-letter
- analyze-job
- star-stories
- Any page using `useRouter()` or `useSearchParams()`

---

## Authentication Issues

### Login Fails with "Invalid Credentials"

**Symptoms**: Login form submits but shows error

**Checklist**:
1. Verify backend API is running
2. Check email format is valid
3. Verify password is correct
4. Check network tab for actual error:
   - F12 → Network tab → Find POST request to `/login`
   - Check response body for error message
5. Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

**Common API Errors**:
- `400 Bad Request`: Email or password invalid format
- `401 Unauthorized`: Wrong credentials
- `404 Not Found`: Backend endpoint doesn't exist
- `500 Server Error`: Backend error (check server logs)

---

### "Token is undefined" or Blank Token

**Error Message**:
```
Cannot read properties of undefined (reading 'access_token')
```

**Cause**: API response structure doesn't match expected format

**Solution**:
1. Check API response structure:
   ```bash
   # Test login endpoint directly
   curl -X POST http://localhost:8000/api/v1/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. Verify response format (should be flat):
   ```json
   {
     "user_id": "123",
     "email": "test@example.com",
     "full_name": "John Doe",
     "plan": "free",
     "credits_remaining": 5,
     "access_token": "eyJhbGc...",
     "refresh_token": "eyJhbGc...",
     "token_type": "Bearer"
   }
   ```

3. If response structure is different, update:
   - [lib/types/index.ts](../lib/types/index.ts) - AuthResponse interface
   - [lib/context/AuthContext.tsx](../lib/context/AuthContext.tsx) - authResponseToUser function
   - [lib/utils/api.ts](../lib/utils/api.ts) - API client methods

---

### useAuth Hook Error "Must be used within AuthProvider"

**Error**:
```
useAuth must be used within <AuthProvider>
```

**Causes**:
1. Component doesn't have `"use client"` directive
2. Component not rendered inside `AuthProvider`
3. Hook called at wrong scope

**Solution**:
1. Add "use client" directive at top of file:
   ```typescript
   "use client";
   
   import { useAuth } from "@/lib/context/AuthContext";
   ```

2. Verify component tree includes AuthProvider:
   - Check `app/layout.tsx` has `<AuthProvider>`
   - useAuth call must be inside AuthProvider JSX

3. Common mistake - calling useAuth outside a component:
   ```typescript
   // ❌ Wrong - outside component
   const { user } = useAuth();
   
   export default function Component() {
     return <div>{user.name}</div>;
   }
   
   // ✅ Correct - inside component
   export default function Component() {
     const { user } = useAuth();
     return <div>{user.name}</div>;
   }
   ```

---

### Token Expires and User Gets Logged Out

**Symptoms**: 
- Redirected to login page unexpectedly
- 401 errors on API calls
- localStorage token exists but not working

**Cause**: Access token has expired

**Solution**: 
1. Automatic refresh should handle this - check if `refreshToken()` works:
   ```typescript
   // In AuthContext
   const refreshToken = async () => {
     // Should call apiClient.refreshToken()
     // and update stored token
   };
   ```

2. Manual test:
   - Open DevTools (F12) → Application/Storage
   - Check `careerpilot_token` value
   - Manually clear and re-login
   - Token should be refreshed

3. Backend should return new tokens on refresh:
   ```json
   {
     "access_token": "new_token...",
     "refresh_token": "new_refresh_token...",
     "expires_in": 3600
   }
   ```

---

### CORS Errors When Calling API

**Error**:
```
Access to XMLHttpRequest from 'http://localhost:3000' has been blocked by CORS policy
```

**Cause**: Backend doesn't have proper CORS headers

**Solution**:
1. Check backend API allows requests from your frontend:
   ```bash
   # In backend config, should have:
   CORS_ORIGINS=http://localhost:3000
   ```

2. Verify API returns proper headers:
   ```bash
   curl -i http://localhost:8000/api/v1/health
   # Check for: Access-Control-Allow-Origin: http://localhost:3000
   ```

3. If backend headers are correct but error persists:
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+Shift+R)
   - Restart dev server

4. Check `NEXT_PUBLIC_API_BASE_URL` is correct:
   ```bash
   # .env.local should match where backend runs
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```

---

## Runtime Errors

### "Cannot read properties of undefined (reading 'xxx')"

**Common Cases**:

1. **User object is null**:
   ```typescript
   // ❌ Wrong
   <p>{user.email}</p>  // Crashes if user is null
   
   // ✅ Correct - Option 1: Optional chaining
   <p>{user?.email}</p>
   
   // ✅ Correct - Option 2: Check first
   {user && <p>{user.email}</p>}
   ```

2. **API response missing expected field**:
   ```typescript
   // ❌ Wrong - assumes field exists
   const requirements = response.analysis.requirements;
   
   // ✅ Correct
   const requirements = response.analysis?.requirements ?? [];
   ```

3. **Data not loaded yet**:
   ```typescript
   // ❌ Wrong - data undefined on first render
   return <div>{data.items.map(...)}</div>;
   
   // ✅ Correct - Check loading state
   if (loading) return <p>Loading...</p>;
   if (!data) return <p>No data</p>;
   return <div>{data.items.map(...)}</div>;
   ```

---

### React Errors in Console

**Error**: `React does not recognize the ___ prop on a DOM element`

**Common Cause**: Passing custom props to HTML elements

**Solution**:
```typescript
// ❌ Wrong - custom prop on native element
<button disabled={false} customProp="value">Click</button>

// ✅ Correct - remove custom props
const { customProp, ...props } = componentProps;
<button {...props}>Click</button>
```

---

### Infinite Loops or Memory Leaks

**Symptoms**:
- Page keeps re-rendering
- Browser tab becomes unresponsive
- Memory usage grows continuously

**Common Causes**:

1. **useEffect without dependencies**:
   ```typescript
   // ❌ Wrong - runs every render
   useEffect(() => {
     setUser(fetchData());  // Causes infinite loop
   });
   
   // ✅ Correct
   useEffect(() => {
     setUser(fetchData());
   }, []);  // Empty array = run once on mount
   ```

2. **setState inside useEffect without dependencies**:
   ```typescript
   // ❌ Wrong
   useEffect(() => {
     setCount(count + 1);  // Updates state, triggers render, runs effect again
   });
   
   // ✅ Correct
   useEffect(() => {
     setCount(c => c + 1);  // Use callback form, but still needs dependency tracking
   }, []);
   ```

3. **Cleanup function missing**:
   ```typescript
   // ❌ Wrong - event listener never removed
   useEffect(() => {
     window.addEventListener('resize', handleResize);
   }, []);
   
   // ✅ Correct - cleanup on unmount
   useEffect(() => {
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
   }, []);
   ```

---

## Performance Issues

### Slow Page Load

**Symptoms**: Page takes 5+ seconds to load

**Diagnosis**:
1. Open DevTools (F12) → Network tab
2. Reload page (Ctrl+R)
3. Check what's slow:
   - Blue bars = fetching resource
   - Gray bars = total load time

**Common Causes & Fixes**:

- **Large images**: Use Next.js `Image` component
- **Slow API**: Check backend performance
- **JavaScript bundle large**: Check for unused imports
- **Multiple API calls on load**: Batch or parallelize requests

---

### High CPU Usage / Fan Spinning

**Cause**: Usually infinite re-renders or loops

**Fix**:
1. Check browser console for React warnings
2. Open React DevTools → Profiler
3. Record interaction → see which components re-render
4. Check that component for useEffect issues

---

### Slow Form Submission

**Symptoms**: UI freezes while submitting form

**Cause**: Heavy computation or slow API

**Solution**:
```typescript
// Show loading state while submitting
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await apiClient.submitForm(data);
  } finally {
    setLoading(false);
  }
};

// Disable button while loading
<button disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
```

---

## Deployment Issues

### Build Succeeds Locally but Fails in CI/CD

**Common Causes**:

1. **Environment variables not set**:
   - CI/CD doesn't have `.env.local`
   - Must set vars in CI/CD secrets
   - Example GitHub Actions:
     ```yaml
     env:
       NEXT_PUBLIC_API_BASE_URL: ${{ secrets.API_BASE_URL }}
     ```

2. **Node version mismatch**:
   - CI/CD running older Node
   - Specify Node version in config

3. **Dependency version conflict**:
   - CI/CD installed different versions
   - Use `npm ci` instead of `npm install`

---

### Layout Shift or Wrong Styling After Deploy

**Cause**: CSS or fonts not loaded properly

**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check CSS file is being served
4. Verify Tailwind CSS is processing correctly:
   ```bash
   npm run build
   ```

---

## Browser-Specific Issues

### Not Working in Safari

**Common Issues**:
- Older JavaScript syntax not supported
- Different localStorage behavior
- Different CSS behavior

**Fix**: 
- Use `@vitejs/plugin-legacy` or `@babel/preset-env`
- Test in Safari DevTools
- Check [caniuse.com](https://caniuse.com/) for feature support

---

### Not Working in Mobile Browser

**Common Issues**:
- Touch events not handled
- Screen size assumptions
- Viewport settings

**Fix**:
1. Test with mobile emulation (F12 → Device toolbar)
2. Check viewport in `app/layout.tsx`:
   ```typescript
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```
3. Test touch interactions manually on actual device

---

## Getting Help

### Before Asking for Help

1. **Check error message**: Read the full error, it usually says what's wrong
2. **Check this guide**: Search this troubleshooting document
3. **Check documentation**: [DEVELOPMENT.md](./DEVELOPMENT.md), [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Search online**: Error message + "next.js" or "react"
5. **Check backend logs**: Error might be from API

### When Reporting Issues

Include:
1. Exact error message
2. Steps to reproduce
3. What you tried to fix it
4. Relevant code snippet
5. Environment info:
   ```bash
   node --version
   npm --version
   npm list next react typescript --depth=0
   ```

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Port 3000 in use | `npm run dev -- -p 3001` |
| ERESOLVE error | `npm install --legacy-peer-deps` |
| Hot reload not working | Ctrl+Shift+R (hard refresh) |
| Type errors | Check `lib/types/index.ts` |
| useAuth not working | Add `"use client"` at top |
| Login fails | Check backend is running |
| CORS error | Check backend CORS config |
| Slow build | `rm -rf .next && npm run build` |
| Types not types | Check typo in import path |

---

**Last Updated**: February 19, 2026
**Maintainer**: Development Team

For systematic debugging approach, see [DEVELOPMENT.md - Debugging section](./DEVELOPMENT.md#debugging)
