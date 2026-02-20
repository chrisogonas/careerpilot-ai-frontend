# CareerPilot AI Frontend - Setup & Installation Guide

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js**: Version 18.17 or higher ([Download](https://nodejs.org/))
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For version control
- **Backend API**: Running at `http://localhost:8000/api/v1`

### Verify Installation

```bash
node --version      # Should be v18.17.0 or higher
npm --version       # Should be 9.0.0 or higher
```

## Installation Steps

### 1. Clone the Repository

```bash
cd career_pilot
git clone <repository-url> careerpilot-ai-frontend
cd careerpilot-ai-frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages specified in `package.json`.

**Note**: The project uses `--legacy-peer-deps` to handle compatibility between eslint versions. This is configured in `.npmrc`.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# JWT Storage Key
NEXT_PUBLIC_JWT_STORAGE_KEY=careerpilot_token

# Stripe (for future payment implementation)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

**Important**: The `NEXT_PUBLIC_` prefix makes these variables available to the browser. Never put secrets in these variables.

### 4. Verify Setup

```bash
npm run build
```

If the build is successful, you're ready to go!

## Running the Application

### Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

The development server includes:
- Hot Module Replacement (HMR) for instant code updates
- TypeScript compilation and checking
- Automatic component refresh

### Production Build

```bash
npm run build
npm run start
```

This creates an optimized production build and starts the server.

## Troubleshooting Setup Issues

### Issue: `npm install` fails with peer dependency errors

**Solution**: The `.npmrc` file is already configured to use legacy peer deps. If you still get errors:

```bash
npm install --legacy-peer-deps
```

### Issue: Backend API is not running

**Error**: `Cannot connect to http://localhost:8000`

**Solution**: 
1. Start the backend API service
2. Verify it's running at `http://localhost:8000/api/v1`
3. Check that the API is accessible with `curl http://localhost:8000/api/v1/health`

### Issue: Port 3000 is already in use

**Solution**: Use a different port:

```bash
npm run dev -- -p 3001
```

### Issue: TypeScript compilation errors

**Solution**: Clear the build cache and rebuild:

```bash
rm -r .next
npm run build
```

## Project Scripts

Available npm scripts in `package.json`:

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server (requires build first)
npm run lint         # Run ESLint
```

## Verification Checklist

After setup, verify everything works:

- [ ] Backend API is accessible at `http://localhost:8000/api/v1/health`
- [ ] `npm install` completed without errors
- [ ] Development server starts with `npm run dev`
- [ ] Application loads at `http://localhost:3000`
- [ ] Navigation to `/auth/login` works
- [ ] Environment variables are properly configured

## Next Steps

Once setup is complete:

1. Review the [Architecture Guide](./ARCHITECTURE.md)
2. Understand the [Authentication Flow](./API_INTEGRATION.md#authentication)
3. Read the [Component Guide](./COMPONENTS.md)
4. Start the development server and explore the application

## Common Development Workflow

```bash
# 1. Start development server
npm run dev

# 2. Make code changes
# Files are automatically reloaded

# 3. Test your changes in browser
# http://localhost:3000

# 4. Before committing
npm run build
npm run lint

# 5. Deploy (production)
# See DEPLOYMENT.md for deployment instructions
```

## Getting Help

If you encounter issues:

1. Check [DEVELOPMENT.md](./DEVELOPMENT.md#troubleshooting) for common issues
2. Review error messages carefully - they often indicate the solution
3. Check that the backend API is running and accessible
4. Verify environment variables are correctly set

---

**Last Updated**: February 19, 2026
