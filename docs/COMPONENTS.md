# CareerPilot AI Frontend - Components Guide

## Overview

This guide documents all React components in the CareerPilot AI frontend, their responsibilities, props, and usage patterns.

## Component Organization

```
Components (in both /app/components and /app/{feature}/page.tsx)
├── Shared Components
│   └── Navbar.tsx
├── Auth Components
│   ├── LoginPage
│   └── RegisterPage
├── Feature Components
│   ├── TailorPage
│   ├── AnalyzeJobPage
│   ├── CoverLetterPage
│   └── StarStoriesPage
├── Layout Components
│   └── RootLayout
└── Page Components
    ├── HomePage
    ├── DashboardPage
    └── PricingPage
```

## Shared Components

### Navbar Component

**Location**: `app/components/Navbar.tsx`

**Purpose**: Navigation bar displayed on every page. Shows different content based on authentication state.

**Features:**
- Responsive design (mobile-friendly)
- Conditional rendering (authenticated vs. unauthenticated)
- User info display when logged in
- Quick logout button

**Props**: None (uses `useAuth` hook internally)

**Usage:**
```typescript
// Used in RootLayout
import Navbar from './components/Navbar';

export default function RootLayout() {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
```

**States:**
- **Unauthenticated**: Shows Home, Pricing, Sign In links
- **Authenticated**: Shows Dashboard, Tailor Resume, user info, Logout

---

## Authentication Components

### LoginPage

**Location**: `app/auth/login/page.tsx`

**Purpose**: User login form. Collects email and password.

**Features:**
- Email validation
- Password input field
- Loading state during submission
- Error message display
- Link to registration page
- Redirect to dashboard on success

**Form Fields:**
- `email` (required, type: email)
- `password` (required, type: password)

**State Variables:**
```typescript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

**Key Methods:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // Validate input
  // Call login()
  // Handle errors
  // Redirect
}
```

**UI Structure:**
```
┌─ Gradient Background
├─ Card Container
│  ├─ Logo & Title
│  ├─ Login Form
│  │  ├─ Email Input
│  │  ├─ Password Input
│  │  └─ Submit Button
│  ├─ Register Link
│  └─ Legal Text
```

---

### RegisterPage

**Location**: `app/auth/register/page.tsx`

**Purpose**: User registration form. Creates new account.

**Features:**
- Full name, email, password inputs
- Password requirement hints
- Loading state
- Error handling
- Link to login page
- Redirect to dashboard on success

**Form Fields:**
- `fullName` (required, type: text)
- `email` (required, type: email)
- `password` (required, type: password)

**Unique Aspects:**
- Uses `apiClient.register()` instead of login
- Creates user in database
- Immediately logs user in after registration

---

## Feature Components

### TailorPage (Resume Tailoring)

**Location**: `app/tailor/page.tsx`

**Purpose**: Resume tailoring form and results display.

**Features:**
- Two-step flow (Input → Results)
- Multi-field form
- Loading state
- Results display with copy-to-clipboard

**Form Fields:**
- `jobDescription` (required, textarea)
- `resumeText` (required, textarea)
- `targetRole` (required, text)
- `tone` (optional, radio buttons: professional/conversational/concise)

**State Flow:**
```
Input State
  ↓ (Form Submit)
Loading State
  ↓ (API Response)
Result State
  ↓ (User Action)
Input State (Reset) or Download
```

**Form Submission:**
```typescript
const handleTailor = async (e: React.FormEvent) => {
  // Validate fields
  // Call apiClient.tailorResume()
  // Show results
  // Handle errors
}
```

**Result Display:**
```
┌─ Extracted Requirements Box
├─ Tailored Resume Box
└─ Action Buttons (Copy, Tailor Another)
```

---

### AnalyzeJobPage

**Location**: `app/analyze-job/page.tsx`

**Purpose**: Job description analyzer. Extracts requirements.

**Features:**
- Single textarea input
- Loading state
- Results display
- Copy-to-clipboard functionality

**Form Fields:**
- `jobDescription` (required, textarea)

**Simplified Flow:**
```
Input → Loading → Results Display
```

---

### CoverLetterPage

**Location**: `app/cover-letter/page.tsx`

**Purpose**: Cover letter generator.

**Features:**
- Multiple input fields
- Professional letter generation
- Copy and re-generate options

**Form Fields:**
- `resumeText` (required)
- `jobDescription` (required)
- `companyName` (required)
- `roleTitle` (required)

**Output:**
- Fully formatted cover letter ready to submit

---

### StarStoriesPage

**Location**: `app/star-stories/page.tsx`

**Purpose**: STAR story generator for interview prep.

**Features:**
- Configurable story count (3, 5, 7, 10)
- Multiple stories display
- Individual copy buttons per story
- Bulk copy all stories option

**Form Fields:**
- `resumeText` (required)
- `jobDescription` (required)
- `storyCount` (select: 3-10)

**Output:**
- Array of formatted STAR stories
- Each story is independently copyable

---

## Layout Components

### RootLayout

**Location**: `app/layout.tsx`

**Purpose**: Root layout wrapper for entire application.

**Features:**
- Wraps all pages
- Provides AuthProvider
- Sets up global styles
- Includes Navbar

**Structure:**
```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## Page Components

### HomePage (Landing Page)

**Location**: `app/page.tsx`

**Purpose**: Marketing/landing page for unauthenticated users.

**Features:**
- Hero section with CTA buttons
- Feature cards (4 main features)
- How it works section
- Pricing overview
- Call-to-action footer
- Responsive grid layouts
- Conditional rendering based on auth status

**Sub-Components** (Functional):
- `FeatureCard` - Displays feature with icon and description
- `Step` - Shows process step with number and text
- `PricingCard` - Displays pricing tier info

**Layout:**
```
┌─ Hero Section (Title + CTAs)
├─ Features Grid (4 cards)
├─ How It Works (3 steps)
├─ Pricing Grid (3 tiers)
└─ Final CTA (Blue banner)
```

---

### DashboardPage

**Location**: `app/dashboard/page.tsx`

**Purpose**: User dashboard. Shows usage stats and credits.

**Features:**
- Protected route (auth required)
- Usage statistics display
- Monthly quota progress bars
- Quick action cards
- Plan/credit information

**Data Display:**
```
┌─ Plan & Credits Cards (3 cards)
├─ Monthly Quotas Grid (4 metrics)
└─ Quick Actions Grid (4 feature links)
```

**Sub-Components** (Functional):
- `QuotaCard` - Progress bar for quota usage
- `ActionCard` - Link card to feature pages

**Auth Check:**
```typescript
if (!isAuthenticated) {
  router.push("/auth/login");
  return null;
}
```

---

### PricingPage

**Location**: `app/pricing/page.tsx`

**Purpose**: Detailed pricing information and plan comparison.

**Features:**
- Three pricing tiers (Free, Pro, Premium)
- Feature list comparison
- FAQ section
- Call-to-action buttons

**Sub-Components** (Functional):
- `PricingCard` - Tier display with pricing and features
- `FAQItem` - Question and answer pair

**Layout:**
```
┌─ Header (Title)
├─ Pricing Cards Grid (3 tiers)
├─ FAQ Section (6 items in 2 columns)
└─ Final CTA Banner
```

---

## Hook: useAuth

**Location**: `lib/context/AuthContext.tsx`

**Purpose**: Provides authentication state and methods to components.

**Returns:**
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

**Usage Pattern:**
```typescript
import { useAuth } from "@/lib/context/AuthContext";

export default function MyComponent() {
  const { user, isAuthenticated, login } = useAuth();
  
  if (isAuthenticated) {
    return <div>Welcome, {user?.full_name}</div>;
  }
  
  return <div>Please log in</div>;
}
```

---

## Styling Patterns

### Tailwind CSS Utilities

**Color Scheme:**
```tsx
// Primary Blue
className="bg-blue-600 hover:bg-blue-700"

// Secondary Indigo
className="bg-indigo-600"

// Neutral Gray
className="text-gray-700 bg-gray-50"

// Danger Red
className="text-red-600 bg-red-50"
```

**Common Classes:**
```tsx
// Layout
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Cards
"bg-white rounded-lg shadow p-8"

// Buttons
"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"

// Forms
"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"

// Typography
"text-sm font-medium text-gray-700"
```

### Responsive Design

```tsx
// Mobile first
<div className="text-base md:text-lg lg:text-xl">

// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Hidden on mobile
<div className="hidden md:block">
```

---

## Component Creation Guidelines

When creating new components, follow these patterns:

### 1. Client Components
```typescript
"use client";  // For interactive components

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

export default function NewComponent() {
  // Component logic
}
```

### 2. Protected Pages
```typescript
"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

export default function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }
  
  // Page content
}
```

### 3. Form Components
```typescript
const [formData, setFormData] = useState({});
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  
  try {
    // API call
  } catch (err) {
    setError(err instanceof Error ? err.message : "Error");
  } finally {
    setLoading(false);
  }
};
```

---

## Common Component Patterns

### Loading State
```tsx
if (loading) {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p>Loading...</p>
    </div>
  );
}
```

### Error Display
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

### Two-State Pages
```tsx
const [step, setStep] = useState<"input" | "result">("input");

return step === "input" ? (
  <InputForm onSubmit={() => setStep("result")} />
) : (
  <ResultDisplay onReset={() => setStep("input")} />
);
```

---

**Last Updated**: February 19, 2026
