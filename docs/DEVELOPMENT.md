# CareerPilot AI Frontend - Development Guide

## Development Environment

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Code Editor: VS Code recommended
- Git for version control
- Backend API running locally

### Recommended VS Code Extensions

```
- ES7+ React/Redux/React-Native snippets
- TypeScript Vue Plugin
- Prettier - Code formatter
- ESLint
- Thunder Client (for API testing)
```

## Development Workflow

### Start Development

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# http://localhost:3000

# 4. Start coding
# Files automatically reload on changes
```

### Before Committing

```bash
# 1. Format code
npm run format  # (if available, otherwise use Prettier)

# 2. Check for linting issues
npm run lint

# 3. Build to check for errors
npm run build

# 4. Test the application
# Manual testing in browser

# 5. Commit changes
git add .
git commit -m "Feature: Description"
```

## Code Style & Conventions

### TypeScript

All code should be TypeScript. Use explicit type annotations:

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  full_name: string;
}

const user: User = {
  id: "123",
  email: "user@example.com",
  full_name: "John Doe"
};

// ❌ Avoid
const user = {
  id: "123",
  email: "user@example.com",
  full_name: "John Doe"
};
```

### React Components

```typescript
// ✅ Good: Functional component with types
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false
}) => (
  <button onClick={onClick} disabled={disabled}>
    {label}
  </button>
);

// ❌ Avoid: No types, default exports
export default function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}
```

### Naming Conventions

```typescript
// Components: PascalCase
const UserProfile = () => {}

// Functions: camelCase
const handleUserLogin = () => {}

// Constants: UPPER_CASE
const API_BASE_URL = "http://localhost:8000"

// Interfaces: PascalCase with I prefix (optional)
interface IUserData { }
interface UserData { }  // Also acceptable

// Event handlers: on + PascalCase
const handleClick = () => {}
const handleSubmit = () => {}
```

### File Organization

```
app/
├── features/
│   ├── [feature-name]/
│   │   ├── page.tsx          # Feature page
│   │   └── components/       # Feature-specific components
│   │       └── FeatureName.tsx
│   └── auth/
│       ├── login/page.tsx
│       └── register/page.tsx
└── components/
    └── shared/              # Used across all features
        └── Navbar.tsx
```

## Working with Forms

### Form State Management

```typescript
const [form, setForm] = useState({
  email: "",
  password: ""
});
const [errors, setErrors] = useState<Record<string, string>>({});
const [loading, setLoading] = useState(false);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
  // Clear error for this field
  setErrors(prev => ({ ...prev, [name]: "" }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate
  const newErrors = validateForm(form);
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  setLoading(true);
  try {
    await apiCall(form);
    // Success handling
  } catch (err) {
    setErrors({ submit: err.message });
  } finally {
    setLoading(false);
  }
};
```

## Working with Authentication

### Protected Route Pattern

```typescript
"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }
  
  // Protected content
  return <YourComponent />;
}
```

### Using useAuth Hook

```typescript
const { user, isAuthenticated, login, logout, error } = useAuth();

// Access user data
console.log(user?.email, user?.full_name);

// Check authentication
if (isAuthenticated) {
  // User is logged in
}

// Call auth methods
await login(email, password);
await logout();
```

## API Integration

### Calling APIs

```typescript
import { apiClient } from "@/lib/utils/api";

const handleTailor = async () => {
  try {
    setLoading(true);
    const response = await apiClient.tailorResume({
      user_id: user.id,
      resume_text: resumeText,
      job_description: jobDescription,
      options: { target_role: role, tone: "professional" }
    });
    
    // Use response
    setTailoredResume(response.tailored_resume);
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An error occurred";
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

### Error Handling

```typescript
// In API Client (lib/utils/api.ts)
private async handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API Error");
  }
  return response.json();
}

// In components
try {
  const data = await apiClient.method();
} catch (err) {
  if (err instanceof Error) {
    if (err.message.includes("unauthorized")) {
      // Handle auth error
    } else if (err.message.includes("insufficient_credits")) {
      // Handle credit error
    } else {
      // Generic error
    }
  }
}
```

## Styling Guidelines

### Tailwind CSS Usage

```typescript
// ✅ Good: Organized classes
<div className="
  grid grid-cols-1 md:grid-cols-2 gap-6
  p-6 bg-white rounded-lg shadow
">
  {/* Content */}
</div>

// ✅ Responsive design
<div className="
  text-base
  md:text-lg
  lg:text-xl
">

// ❌ Avoid: Inline excessive styles
<div style={{ color: "red", fontSize: "16px" }}>

// ❌ Avoid: CSS-in-JS without styling framework
const styles = { color: "red" };
```

### Color Scheme

```typescript
// Primary (Blue)
bg-blue-600  hover:bg-blue-700  text-blue-600

// Secondary (Indigo)
bg-indigo-600  text-indigo-600

// Success (Green)
bg-green-600  text-green-600

// Danger (Red)
bg-red-600  text-red-700  bg-red-50

// Neutral (Gray)
bg-gray-50  text-gray-900  text-gray-600
```

## Testing Best Practices

### Manual Testing Checklist

Before submitting changes:

- [ ] Component renders without errors
- [ ] Form validation works
- [ ] API calls succeed with valid data
- [ ] Error handling shows proper messages
- [ ] Loading states display correctly
- [ ] Responsive design works on mobile
- [ ] Authentication flows are correct
- [ ] Protected routes redirect properly

### Testing Auth Flows

```typescript
// Test Login Flow
1. Go to /auth/login
2. Enter valid email/password
3. Should redirect to /dashboard
4. localStorage should contain token
5. Navbar should show user info

// Test Protected Route
1. Logout (or clear localStorage)
2. Go to /dashboard
3. Should redirect to /auth/login
```

## Debugging

### Browser DevTools

```javascript
// In browser console
// Check stored token
localStorage.getItem('careerpilot_token')

// Check user context
// (You may need to add logging in auth context)

// Check network requests
// Open Network tab to see API calls
// Check headers for Authorization token
```

### Console Logging

```typescript
// In development, add helpful logs
console.log("Auth state:", { isAuthenticated, user });
console.error("API Error:", error);

// Remember to remove before production
```

### Development Tools

- **React DevTools**: Browser extension for React component debugging
- **Redux DevTools**: For state management (if using Redux)
- **Network Tab**: Check API requests and responses
- **Application Tab**: Inspect localStorage and cookies

## Common Development Tasks

### Adding a New Page

1. Create directory: `app/your-feature/`
2. Create `page.tsx` with proper setup:
```typescript
"use client";
export const dynamic = "force-dynamic";

import { useAuth } from "@/lib/context/AuthContext";

export default function YourFeaturePage() {
  const { user, isAuthenticated } = useAuth();
  
  return <div>{/* Your UI */}</div>;
}
```
3. Add route to navbar if needed
4. Test navigation

### Adding a New API Endpoint

1. Add method to `ApiClient` class in `lib/utils/api.ts`:
```typescript
async yourNewEndpoint(payload: YourPayload): Promise<YourResponse> {
  const response = await fetch(`${this.baseURL}/endpoint`, {
    method: "POST",
    headers: this.getHeaders(),
    body: JSON.stringify(payload),
  });
  return this.handleResponse<YourResponse>(response);
}
```
2. Add types to `lib/types/index.ts`
3. Use in components with proper error handling

### Adding a Reusable Component

1. Create in `app/components/`
2. Export from file
3. Import in pages as needed:
```typescript
import MyComponent from "@/app/components/MyComponent";
```

## Performance Optimization

### Code Splitting

Next.js automatically code-splits by page. No manual action needed.

### Image Optimization

```typescript
// ✅ Use Next.js Image component
import Image from 'next/image';
<Image src="/image.png" alt="Description" width={200} height={200} />

// ❌ Avoid native img tag
<img src="/image.png" />
```

### Data Fetching

```typescript
// ✅ Fetch in effect
useEffect(() => {
  const fetchData = async () => {
    const data = await apiClient.getUsage();
    setUsage(data);
  };
  fetchData();
}, []);

// ❌ Data fetching at top level
const data = await apiClient.getUsage();
```

## Troubleshooting

### Build Errors

**Error**: `Module not found: Can't resolve '@/lib/types'`

**Solution**: 
- Check that files exist at correct paths
- Verify alias in `tsconfig.json`
- Restart dev server

---

**Error**: `TypeScript error: Type 'X' is not assignable to type 'Y'`

**Solution**:
- Check function signatures
- Verify API response types
- Use `as` for type casting (with caution)

---

### Runtime Errors

**Error**: `Cannot read properties of undefined (reading 'xxx')`

**Solution**:
- Check for null/undefined before accessing properties
- Use optional chaining: `user?.email`
- Add proper type checking

---

**Error**: `useAuth must be used within AuthProvider`

**Solution**:
- Ensure component uses `"use client"` directive
- Check component is wrapped by RootLayout
- Verify useAuth is called inside AuthProvider scope

---

### API Errors

**Error**: `Cannot connect to API`

**Solution**:
- Verify backend is running
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Check CORS headers from backend

---

**Error**: `401 Unauthorized`

**Solution**:
- Token may be expired
- Clear localStorage and re-login
- Check token is being sent in header

---

### Performance Issues

**Slow Build Time**:
```bash
# Clear cache
rm -rf .next

# Rebuild
npm run build
```

---

**Slow Page Load**:
- Check Network tab for large assets
- Check for unnecessary re-renders (React DevTools Profiler)
- Optimize images and code-splitting

---

## Git Workflow

### Commit Message Format

```
type: description

[optional body]
[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test updates
- `chore`: Dependencies, build config

**Examples**:
```
feat: add 2FA support
fix: resolve login redirect issue
docs: update API integration guide
refactor: simplify auth context
```

### Branch Naming

```
feature/feature-name
fix/bug-fix-name
docs/documentation-update
```

---

## Best Practices

### Do's ✅

- Use TypeScript for all code
- Handle all errors gracefully
- Show loading states
- Display user-friendly error messages
- Keep components small and focused
- Test in browser before committing
- Update documentation when making changes
- Use meaningful variable names
- Add comments for complex logic
- Follow the existing code style

### Don'ts ❌

- Don't use `any` type in TypeScript
- Don't ignore error responses
- Don't leave console.logs in production code
- Don't hardcode API URLs (use env vars)
- Don't commit sensitive information
- Don't create massive components
- Don't skip type checking
- Don't ignore TypeScript warnings
- Don't skip loading states
- Don't update auth token incorrectly

---

**Last Updated**: February 19, 2026
