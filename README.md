# CareerPilot AI Frontend

A modern Next.js application for an AI-powered career management platform. Features include resume management, job search, cover letter generation, mock interviews, application tracking, analytics, and more.

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Shadcn UI**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:8000/api/v1`

### Installation

```bash
# Clone repository
git clone https://github.com/chrisogonas/careerpilot-ai-frontend.git
cd careerpilot-ai-frontend

# Install dependencies
npm install --frozen-lockfile

# Configure environment variables (optional)
# By default, API_BASE_URL auto-detects from browser hostname
# For custom API endpoint, create .env.local:
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..." > .env.local

# Run development server
npm run dev
```

Visit **http://localhost:3000** to see the application.

---

## 📁 Project Structure

```
app/
├── page.tsx                    # Landing page with pricing & features
├── layout.tsx                  # Root layout with providers
├── auth/
│   ├── login/page.tsx         # Login page
│   ├── register/page.tsx       # Registration page
│   └── verify-email/page.tsx   # Email verification
├── dashboard/
│   ├── page.tsx               # Main dashboard
│   ├── layout.tsx             # Dashboard sidebar layout
│   ├── resumes/page.tsx       # Resume management
│   ├── applications/page.tsx  # Job application tracker
│   ├── tailor/page.tsx        # Resume tailor form
│   ├── cover-letter/page.tsx  # Cover letter generator
│   ├── jobs/search/page.tsx   # Job search
│   ├── mock-interview/page.tsx # Interview practice
│   ├── todos/page.tsx         # TODO management
│   ├── analytics/page.tsx     # Usage analytics
│   ├── settings/page.tsx      # User settings
│   └── admin/
│       ├── page.tsx           # Admin dashboard
│       └── users/page.tsx     # User management
├── pricing/page.tsx           # Pricing page
└── components/
    ├── ui/                    # Shadcn UI components
    ├── Sidebar.tsx            # Dashboard sidebar
    ├── Navbar.tsx             # Top navigation
    ├── AuthGuard.tsx          # Auth wrapper
    ├── ThemeToggle.tsx        # Dark/light mode
    └── ...

lib/
├── utils/
│   ├── api.ts                 # API client singleton
│   ├── constants.ts           # App constants
│   ├── date-utils.ts          # Date helpers
│   ├── validators.ts          # Input validation
│   └── ...
├── hooks/
│   ├── useAuth.ts             # Auth context hook
│   ├── usePagination.ts       # Pagination logic
│   ├── useToast.ts            # Toast notifications
│   └── ...
├── context/
│   ├── AuthContext.tsx        # Authentication provider
│   ├── NotificationContext.tsx # Notification manager
│   └── ThemeContext.tsx       # Theme provider
└── types/
    └── index.ts               # TypeScript interfaces

styles/
├── globals.css                # Global styles
└── tailwind.css               # Tailwind config

public/
├── images/                    # Static images
└── icons/                     # SVG icons

tests/
├── unit/                      # Unit tests
└── e2e/                       # Playwright E2E tests

docs/
├── SETUP.md                   # Development setup
└── DEPLOYMENT.md              # Deployment guide

.env.local                      # Local environment variables (gitignored)
.env.example                    # Environment template
next.config.ts                  # Next.js configuration
tailwind.config.js              # Tailwind configuration
tsconfig.json                   # TypeScript configuration
package.json                    # Dependencies & scripts
```

---

## 🎯 Core Features

### 1. **Authentication**
- Email/password registration & login
- Email verification
- Secure JWT tokens (stored in localStorage)
- Password reset flow
- Session management
- 2FA support (TOTP)

### 2. **Resume Management**
- Upload PDF or DOCX files
- Automatic parsing
- Inline editing
- Multiple resume versions
- AI-powered tailor for specific jobs
- PDF export
- Version history

### 3. **Job Search**
- Search millions of jobs via RapidAPI
- Filter by title, location, salary, company
- Save favorite searches
- One-click save jobs to applications
- Search history

### 4. **Job Application Tracker**
- Track full application lifecycle
- Status timeline (applied → interview → offer/rejected)
- Add follow-up reminders
- Link resumes & cover letters
- Notes & interview details
- Application statistics

### 5. **AI Cover Letter Generator**
- Generate cover letters from job descriptions
- Customize tone & style
- Edit and refine
- Export as PDF

### 6. **Mock Interviews**
- Interview questions by role & difficulty
- Audio recording
- Real-time transcription
- AI feedback on answers
- STAR story evaluation
- Practice history & metrics

### 7. **Dashboard & Analytics**
- Quick stats (applications, interviews, offers)
- Usage analytics (features used, credits remaining)
- Application funnel chart
- Activity timeline
- Admin dashboard (user management, credits)

### 8. **Subscription & Credits**
- View available plans
- Purchase credit packs
- Manage subscription
- View billing history
- Usage tracking per feature

### 9. **TODO List**
- Create/manage TODOs with categories
- Add subtasks with progress
- Set reminders with recurrence
- Link to job applications
- Due date tracking
- Snooze reminders

### 10. **Account Settings**
- Update profile (name, email, phone)
- Change password
- View API keys
- Download account data
- Delete account
- Notification preferences

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the root:

```dotenv
# Stripe (Publishable Key only - safe to expose)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# API Configuration
# Leave unset to auto-detect from browser hostname
# Set explicitly for production: https://api.yourdomain.com/api/v1
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# JWT Token Storage Key (customize if needed)
NEXT_PUBLIC_JWT_STORAGE_KEY=careerpilot_token
```

**Note:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### API URL Detection

The frontend automatically detects the API URL:
```typescript
// lib/utils/api.ts
const API_BASE_URL = (() => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  // Runtime detection from browser hostname
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const host = hostname === "localhost" || hostname === "127.0.0.1"
      ? "localhost"
      : hostname;
    return `${protocol}//${host}:8000/api/v1`;
  }
  return "http://localhost:8000/api/v1";
})();
```

This allows the same build to work across:
- **Localhost development:** `http://localhost:8000/api/v1`
- **Tunnels (ngrok, tailscale):** `https://tunnel-url.ngrok.io:8000/api/v1`
- **Production:** `https://api.yourdomain.com/api/v1`

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E in headed mode (see browser)
npm run test:e2e:headed
```

---

## 🚀 Development

### Scripts

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Folder Structure Guide

- **`app/`** — Next.js app directory (Pages, layouts, API routes)
- **`lib/`** — Utilities, hooks, context, types
- **`components/`** — Reusable React components
- **`styles/`** — CSS & Tailwind config
- **`public/`** — Static assets

### API Client

All API calls use the `apiClient` singleton from `lib/utils/api.ts`:

```typescript
// Example: Fetch user's resumes
const resumes = await apiClient.getResumes();

// Example: Create resume
const newResume = await apiClient.createResume({
  title: "My Resume",
  resume_text: "...",
});

// Example: Tailor resume for job
const tailored = await apiClient.tailorResume({
  job_description: "...",
  resume_text: "...",
});
```

See `lib/utils/api.ts` for all available methods.

### Auth Flow

```typescript
// lib/context/AuthContext.tsx
const { user, login, logout, isLoading } = useAuth();

// Use in components
if (!user) {
  return <Navigate to="/auth/login" />;
}
```

---

## 🎨 Styling

- **Tailwind CSS v4** — Utility-first CSS framework
- **Shadcn UI** — Pre-built accessible components
- **Dark Mode** — Toggle in settings
- **Responsive Design** — Mobile-first approach

### Adding New Components

Use Shadcn CLI:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

---

## 🌐 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Vercel handles:
- Automatic builds on git push
- Preview deployments for PRs
- Edge functions (if needed)
- CDN & caching

### Deploy to Other Platforms

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
EXPOSE 3000
```

```bash
docker build -t careerpilot-frontend .
docker run -p 3000:3000 careerpilot-frontend
```

**Azure Static Web Apps:**
```bash
az staticwebapp create \
  --name careerpilot-frontend \
  --resource-group your-rg \
  --source . \
  --branch main
```

See [PRODUCTION_DEPLOYMENT_GUIDE.md](../careerpilot-ai-backend/docs/PRODUCTION_DEPLOYMENT_GUIDE.md) for full details.

---

## 📚 Key Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16 | React framework |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| Shadcn UI | Latest | Component library |
| Zod | Latest | Schema validation |
| React Query | Latest | Data fetching (optional) |
| Zustand | Latest | State management (optional) |

---

## 🔐 Security

- **JWT Authentication** — Secure token-based auth
- **Secure Token Storage** — localStorage with separate refresh tokens
- **HTTPS Only** — In production
- **CORS Configured** — Backend allows frontend domain only
- **Input Validation** — Zod schemas validate all inputs
- **XSS Protection** — React escapes by default
- **CSRF Protection** — Backend validates origin headers
- **No Sensitive Data in URLs** — All sensitive ops via POST

---

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install --frozen-lockfile

# Rebuild
npm run build
```

### API Connection Issues
- Verify backend is running: `curl http://localhost:8000/docs`
- Check `.env.local` for `NEXT_PUBLIC_API_BASE_URL`
- Browser DevTools → Network tab → check API requests
- Verify CORS is configured in backend

### Authentication Issues
- Check JWT is stored: `localStorage.getItem('careerpilot_token')`
- Verify token is sent in Authorization header
- Check token expiry: `jwt.decode(token)`

### Styling Issues
- Clear Tailwind cache: `rm -rf .next`
- Rebuild: `npm run build`
- Check `tailwind.config.js` for correct paths

---

## 📞 Support

- **Issues:** GitHub Issues
- **Docs:** See folder `/docs`
- **Backend Docs:** [careerpilot-ai-backend](../careerpilot-ai-backend)

---

## 📝 License

MIT License - See LICENSE file for details.

---

## 🙏 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes: `npm run format && npm run lint`
3. Test: `npm run test`
4. Commit: `git commit -m "Add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Create Pull Request

---

## 🚀 Next Steps

- [ ] Review [SETUP.md](docs/SETUP.md) for development guidelines
- [ ] Check [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment
- [ ] Read backend [README](../careerpilot-ai-backend/README.md) for API details
- [ ] Start server: `npm run dev`

---

Last Updated: March 5, 2026  
Status: Production Ready ✅
