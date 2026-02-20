# CareerPilot AI Frontend - Documentation

Welcome to the CareerPilot AI Frontend documentation. This guide covers the architecture, implementation, and development practices for the application.

## Quick Links

- [Setup & Installation](./SETUP.md) - How to get the project running
- [Architecture](./ARCHITECTURE.md) - System design and structure
- [API Integration](./API_INTEGRATION.md) - Backend API documentation
- [Components Guide](./COMPONENTS.md) - UI component documentation
- [Development Guide](./DEVELOPMENT.md) - Development practices and conventions
- [Project Roadmap](./ROADMAP.md) - Future features and improvements
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
- [2FA Implementation](./2FA_IMPLEMENTATION.md) - Two-factor authentication details
- [Email Verification Implementation](./EMAIL_VERIFICATION_IMPLEMENTATION.md) - Email verification details
- [Stripe Integration](./STRIPE_INTEGRATION.md) - Payment and subscription documentation

## Project Overview

CareerPilot AI is an AI-powered career advancement platform that helps job seekers optimize their resumes, generate cover letters, and prepare for interviews using artificial intelligence.

### Core Features

- **Resume Tailoring** - Optimize resumes for specific job descriptions
- **Cover Letter Generation** - Create personalized cover letters
- **STAR Story Generation** - Generate behavioral interview stories
- **Job Analysis** - Extract requirements from job descriptions
- **Usage Dashboard** - Track credits and quotas

### Tech Stack

- **Frontend Framework**: Next.js 16.1.6 with TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API + Hooks
- **HTTP Client**: Native Fetch API
- **Authentication**: JWT Bearer tokens

### Project Structure

```
careerpilot-ai-frontend/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages
│   ├── components/           # Shared components
│   ├── dashboard/            # User dashboard
│   ├── tailor/              # Resume tailoring
│   ├── analyze-job/         # Job analysis
│   ├── cover-letter/        # Cover letter generation
│   ├── star-stories/        # STAR story generation
│   ├── pricing/             # Pricing page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── lib/                      # Utility code
│   ├── context/             # React context providers
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper functions
├── docs/                     # Documentation
├── public/                   # Static assets
└── package.json             # Dependencies
```

## Key Features Status

✅ **Completed**
- User authentication (register/login)
- JWT token management
- Dashboard with usage display
- Resume tailoring functionality
- Cover letter generation
- Job analysis
- STAR story generation
- Pricing page
- Professional UI with Tailwind CSS
- **Two-Factor Authentication (2FA - TOTP)** ✨
  - QR code setup with authenticator apps
  - 6-digit code verification
  - Backup recovery codes
  - Secure login flow
- **Email Verification** ✨
  - Registration email verification
  - Resend verification option
  - Token-based email confirmation
  - Verification landing page
- **Password Reset** ✨
  - Forgot password flow
  - Email-based password reset
  - Secure token validation
  - Password requirements enforcement
- **User Profile Management** ✨
  - View profile information
  - Edit profile (name, email)
  - Security settings
  - Change password functionality
  - Account deletion option
- **Stripe Subscription & Payment Integration** ✨
  - Plan selection and comparison
  - Secure checkout with Stripe
  - Monthly/Yearly billing options
  - Subscription management
  - Billing history tracking
  - Plan upgrade/downgrade
  - Subscription cancellation

⏳ **Planned**
- Resume Library Management
- Job Application Tracker
- Advanced Analytics
- Email OTP (alternative to TOTP)
- Dark mode support
- API key generation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running at `http://localhost:8000/api/v1`

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Important Notes

### Authentication Flow

1. User enters email/password on login page
2. Frontend sends request to `POST /auth/login`
3. Backend returns user data and tokens
4. Frontend stores `access_token` in localStorage
5. All subsequent requests include token in Authorization header

### Protected Pages

The following pages are protected by authentication:
- `/dashboard` - User dashboard
- `/tailor` - Resume tailoring
- `/analyze-job` - Job analysis
- `/cover-letter` - Cover letter generation
- `/star-stories` - STAR story generation

Users are automatically redirected to login if not authenticated.

### Environment Configuration

Key environment variables (in `.env.local`):
- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL
- `NEXT_PUBLIC_JWT_STORAGE_KEY` - localStorage key for JWT token
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key (for future use)

## Support & Troubleshooting

For common issues and solutions, please refer to [Troubleshooting Guide](./TROUBLESHOOTING.md). This comprehensive guide covers:
- Installation & setup issues
- Development server problems
- Build errors
- Authentication issues
- Runtime errors
- Performance troubleshooting
- Deployment issues

## Contributing

Please follow these practices when contributing:
1. Keep components focused and single-responsibility
2. Use TypeScript for type safety
3. Update documentation when making changes
4. Test authentication flows thoroughly
5. Ensure responsive design on mobile

## License

Internal project - CareerPilot AI

---

**Last Updated**: February 20, 2026 (Stripe Subscription & Payment Integration)
