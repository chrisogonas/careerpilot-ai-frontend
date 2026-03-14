# CareerPilot AI — Product Improvement Plan

**Created:** July 2025  
**Goal:** Transform CareerPilot from a feature-complete MVP into a polished, professional, intuitive product that users trust and recommend.  
**Principles:** Intuitive UX · Minimal clutter · Professional design · Clear value communication

---

## Executive Summary

CareerPilot AI has strong bones: 55+ pages, 8 major AI features, Stripe billing, admin dashboard, and a comprehensive backend. However, the **user-facing experience** has significant gaps that undermine trust and conversion:

1. **Emoji icons everywhere** — the single biggest amateur signal
2. **No onboarding** — new users land on a dashboard of zeroes
3. **No design system** — every page rebuilds buttons, cards, inputs from scratch
4. **No loading polish** — spinners instead of skeletons, no error boundaries
5. **Sidebar always hidden** — even on desktop, users must click the hamburger every time
6. **Brand inconsistency** — blue on the landing page, purple on subscribe, no unified palette

The plan below is organized into three tiers: **Quick Wins** (< 1 week each), **Strategic Bets** (1–4 weeks), and **Long-Term Moats** (1–3 months). Each item includes what, why, complexity, affected files, and monetization mapping.

---

## Current State Audit

### What Works Well
- Comprehensive feature set (resume tailoring, cover letters, STAR stories, mock interviews, application tracking, TODOs, analytics)
- Solid backend architecture (async FastAPI, proper credit system, Stripe webhooks)
- Dynamic pricing from API (not hardcoded)
- Grace period system with email reminders
- Reminder banner with audio chime and notification tray
- 8 feature marketing pages + 6 resource/blog pages
- 14-page admin panel with revenue analytics, feature flags, observability

### Critical Gaps
| Gap | Impact | Current State |
|-----|--------|---------------|
| Emoji icons | Trust, professionalism | 28+ emoji icons in sidebar alone |
| No onboarding | Activation, retention | New users see a wall of zeroes |
| No design system | Consistency, dev velocity | Every page builds its own UI primitives |
| No skeleton loading | Perceived performance | Full-screen spinner → content flash |
| No error boundaries | Reliability perception | Unhandled crashes show React error overlay |
| Sidebar hidden on desktop | Discoverability, navigation | Must click hamburger on every page load |
| Brand color inconsistency | Trust, premium feel | Blue (landing) vs purple (subscribe) |
| Monolithic AuthContext | Maintainability, performance | Auth + resumes + apps + reminders + todos in one context |
| No social proof | Conversion | No testimonials, user counts, or trust signals |
| Landing page too long | Engagement | Hero → 8 features → How It Works → Pricing → Credit Packs → 12 FAQs → 6 Resources → CTA |

---

## Phase 1: Quick Wins (< 1 week each)

These are high-impact, low-effort changes that immediately elevate the product's professional feel.

---

### 1.1 [Priority: CRITICAL] Replace Emoji Icons with Lucide React

**What:** Install `lucide-react` and replace every emoji icon (sidebar, dashboard, landing page, subscribe page, feature cards) with consistent SVG icons.

**Why:** Emoji icons are the single most visible amateur signal. They render inconsistently across OS/browsers, can't be styled (color, size, stroke width), and signal "side project" rather than "professional tool." This one change transforms the perceived quality of the entire app.

**Complexity:** S (2–3 days) — Mechanical replacement across ~10 files

**Affected files:**
- `app/components/Sidebar.tsx` — 28+ nav item icons
- `app/dashboard/page.tsx` — Quick Actions cards, stats cards
- `app/page.tsx` — Feature cards, How It Works, resource cards
- `app/subscribe/page.tsx` — Plan feature lists
- `app/todos/page.tsx` — Category/priority icons
- `app/applications/page.tsx` — Status icons

**Monetization:** Indirect — professional appearance increases trust and conversion rate.

**Implementation spec:**
```
npm install lucide-react
```
Icon mapping (representative):
| Current Emoji | Lucide Icon | Context |
|---------------|-------------|---------|
| 🏠 | `Home` | Dashboard nav |
| 📄 | `FileText` | Resumes nav |
| ✂️ | `Scissors` or `Sparkles` | Tailor Resume nav |
| 💼 | `Briefcase` | Applications nav |
| 🔍 | `Search` | Job Search nav |
| 🎤 | `Mic` | Mock Interview nav |
| 📋 | `ClipboardList` | TODOs nav |
| 📊 | `BarChart3` | Analytics nav |
| 👤 | `User` | Profile nav |
| 🔐 | `Shield` | Security nav |
| ⭐ | `Star` | STAR Stories |
| ✍️ | `PenTool` | Cover Letter |
| 🔔 | `Bell` | Reminders |
| 💳 | `CreditCard` | Billing |
| 🚪 | `LogOut` | Logout |

---

### 1.2 [Priority: HIGH] Persistent Sidebar on Desktop

**What:** On screens >= 1024px (lg breakpoint), show the sidebar as a permanent left rail (w-64) instead of a hidden hamburger menu. Keep the hamburger behavior on mobile/tablet.

**Why:** Every serious SaaS product (Notion, Linear, Vercel, Stripe Dashboard) uses a persistent sidebar on desktop. Hiding it behind a hamburger on all screen sizes makes navigation slower and hides feature discoverability. Users shouldn't have to click twice to navigate.

**Complexity:** S (1–2 days) — CSS/layout change in Sidebar.tsx and root layout

**Affected files:**
- `app/components/Sidebar.tsx` — Add `lg:translate-x-0 lg:static` to sidebar, remove overlay on desktop
- `app/layout.tsx` — Add `lg:ml-64` to main content area
- All pages — No changes needed (content already responsive)

**Monetization:** Indirect — reduces friction, increases feature discovery (especially paid features like Mock Interview, analytics).

**Implementation spec:**
- Sidebar: `className="fixed lg:static lg:translate-x-0 ..."` (always visible on lg+)
- Hamburger: `className="lg:hidden"` (only on mobile)
- Main content: `className="lg:ml-64"` (offset for sidebar)
- Top bar: remains on mobile; collapses into sidebar header on desktop

---

### 1.3 [Priority: HIGH] Dashboard Onboarding for New Users

**What:** When a user has zero usage (no resumes, no applications, no tailored resumes), replace the dashboard's wall-of-zeroes with a **Getting Started** checklist card that guides them through their first actions.

**Why:** The #1 activation killer is an empty dashboard with no guidance. New users don't know where to start. A checklist creates a clear path to value and increases the chance they experience the core "aha moment" (tailoring a resume) within the first session.

**Complexity:** S (2–3 days) — New component + conditional rendering on dashboard

**Affected files:**
- `app/dashboard/page.tsx` — Conditional rendering based on usage data
- New: `app/components/GettingStartedChecklist.tsx`

**Monetization:** Direct — drives users to use credits (which drives upgrades when free credits run out).

**Implementation spec:**
```
Getting Started Checklist (shown when all usage metrics are 0):

[ ] Upload your first resume                    → /resumes/new
[ ] Find a job to target                        → /jobs/search
[ ] Tailor your resume for a specific job        → /tailor
[ ] Track your first application                → /applications/new
[ ] Generate a cover letter                      → /cover-letter

Progress: 0 of 5 completed ━━━━━━━━━━━━ 0%

"Complete all 5 steps to master your job search workflow"
```
- Persist checklist state in localStorage (key: `onboarding_checklist_{userId}`)
- Show "Welcome to CareerPilot!" header with user's name
- Dismiss checklist after all items complete or user clicks "Skip — show dashboard"
- Returning users with usage > 0 see the normal dashboard

---

### 1.4 [Priority: HIGH] Skeleton Loading States

**What:** Replace the `animate-spin` full-screen spinner with skeleton loading placeholders that match the page layout (gray pulsing rectangles in the shape of cards, text, and stats).

**Why:** Skeleton loaders dramatically improve perceived performance. Users feel the page is "almost ready" instead of staring at a blank screen. Every modern SaaS app uses them.

**Complexity:** S (2–3 days) — Reusable skeleton components + integration on key pages

**Affected files:**
- New: `app/components/ui/Skeleton.tsx` — base `<Skeleton />` component (simple `animate-pulse bg-gray-200 rounded` div)
- `app/dashboard/page.tsx` — Skeleton grid matching card layout
- `app/subscribe/page.tsx` — Skeleton plan cards
- `app/applications/page.tsx` — Skeleton list rows
- `app/resumes/page.tsx` — Skeleton card grid

**Monetization:** Indirect — reduces bounce rate from perceived slowness.

---

### 1.5 [Priority: HIGH] Global Error Boundary

**What:** Add Next.js `error.tsx` and `not-found.tsx` at the root app level and key route groups. Add a global `global-error.tsx` for unrecoverable crashes.

**Why:** Currently there are ZERO error boundary files. Any unhandled error shows the React development error overlay or a white screen in production. This is a reliability and trust issue.

**Complexity:** S (1 day) — Create 3 files, following Next.js patterns

**Affected files:**
- New: `app/error.tsx` — Friendly error page with "Try again" button
- New: `app/not-found.tsx` — Custom 404 page (not the default Next.js one)
- New: `app/global-error.tsx` — Last-resort crash screen

**Implementation spec:**
- 404 page: "Page not found" with search suggestions (Dashboard, Resumes, Applications) and illustration
- Error page: "Something went wrong" with `reset()` retry button and link to Dashboard
- Both should match the app's design language (same colors, fonts, layout)

---

### 1.6 [Priority: MEDIUM] Unified Brand Color Palette

**What:** Standardize on a single primary color across the app (recommend: blue-600 `#2563eb` as primary) and define a consistent palette in Tailwind config. Eliminate the blue-vs-purple split between landing and subscribe pages.

**Why:** Two different accent colors across the app signals "nobody reviewed the design." A unified palette builds brand recognition and trust.

**Complexity:** S (1 day) — Tailwind config update + find-and-replace in subscribe page

**Affected files:**
- `tailwind.config.ts` — Define `colors.brand` with primary, accent, success, warning, danger
- `app/subscribe/page.tsx` — Replace purple gradients/buttons with brand primary
- `app/components/Sidebar.tsx` — Use brand primary for active states

---

### 1.7 [Priority: MEDIUM] Collapse "Insights" Into "Main" Section

**What:** Remove the single-item "Insights" collapsible section in the sidebar and move "Analytics" into the "Main" section.

**Why:** A collapsible section with only one item looks odd and wastes vertical space. Reduces cognitive load.

**Complexity:** XS (30 minutes) — Move one item in Sidebar.tsx

**Affected files:**
- `app/components/Sidebar.tsx`

---

## Phase 2: Strategic Bets (1–4 weeks each)

These are medium-effort changes that significantly improve user experience, retention, and conversion.

---

### 2.1 [Priority: HIGH] Shared UI Component Library

**What:** Create a set of reusable UI primitives that every page uses instead of rebuilding from raw Tailwind classes each time.

**Why:** Currently every page builds its own buttons, inputs, cards, modals, and badges from scratch. This causes visual inconsistency (different border radii, shadows, focus rings, padding) and slows development. A shared library ensures every interaction looks and feels identical.

**Complexity:** M (1–2 weeks) — Build components, then gradually migrate pages

**Affected files:**
- New directory: `app/components/ui/`
- Components to build:

| Component | Purpose |
|-----------|---------|
| `Button.tsx` | Primary, secondary, outline, ghost, danger variants. Loading state (spinner inside button). |
| `Input.tsx` | Text, email, password, textarea. Label, helper text, error state built in. |
| `Card.tsx` | Container with consistent padding, shadow, border-radius. Optional header/footer slots. |
| `Badge.tsx` | Status badges (active, pending, expired, etc.) with color mapping. |
| `Modal.tsx` | Dialog overlay with title, content, actions. Escape to close, click-outside to close. |
| `Select.tsx` | Dropdown with consistent styling. |
| `Skeleton.tsx` | Loading placeholder (from 1.4). |
| `EmptyState.tsx` | Illustration + title + description + CTA button. Reused across all list pages. |
| `Alert.tsx` | Success, warning, error, info banners with icon + dismiss. |
| `Tabs.tsx` | Tab navigation for multi-view pages. |

**Monetization:** Indirect — faster development velocity for new features, consistent professional appearance.

**Implementation approach:**
1. Build components in isolation (can use a simple preview page at `/dev/components` if needed)
2. Start using on new pages immediately
3. Migrate existing pages incrementally (dashboard first, then applications, then others)
4. Do NOT add a heavy dependency like shadcn/ui — keep it lightweight and custom

---

### 2.2 [Priority: HIGH] Dashboard Activity Feed & Recent Activity

**What:** Add a "Recent Activity" section to the dashboard showing the user's last 5–10 actions (tailored a resume, started an interview, applied to a job, etc.) with timestamps.

**Why:** A static dashboard full of numbers feels dead. Activity feeds create a sense of progress and motion — "I did 3 things this week!" This drives daily return visits (retention) and reminds users of features they haven't tried.

**Complexity:** M (1 week) — Backend endpoint + frontend component

**Affected files:**
- Backend: New `GET /api/v1/activity/recent` endpoint (query `usage_logs` + `job_applications` + `mock_interview_sessions` ordered by timestamp)
- Frontend: `app/dashboard/page.tsx` — New `<RecentActivity />` section below Quick Actions
- Frontend: New `app/components/ActivityFeed.tsx`

**Monetization:** Retention — brings users back to dashboard, reminds them of features, shows credit consumption (driving upgrades).

**Feed item format:**
```
📝 Tailored resume for "Senior SWE at Google"          2 hours ago
💼 Applied to "ML Engineer at Meta"                     Yesterday
🎤 Completed mock interview (Score: 7.4/10)            3 days ago
✍️ Generated cover letter for Stripe                    4 days ago
```

---

### 2.3 [Priority: HIGH] Smart Dashboard for Returning Users

**What:** Make the dashboard contextually aware of the user's current job search stage and show relevant next-step suggestions instead of generic Quick Actions.

**Why:** A job seeker who has 15 applications but zero mock interviews needs different guidance than someone who just signed up. Context-aware suggestions increase feature discovery and engagement.

**Complexity:** M (1 week) — Logic layer on dashboard based on user's data

**Affected files:**
- `app/dashboard/page.tsx` — Replace static Quick Actions with dynamic suggestions

**Suggestion logic:**
```
IF has_resumes AND has_no_tailored_resumes → "Try tailoring your resume for a specific job"
IF has_applications AND no_follow_ups → "Add a follow-up reminder to stay on track"
IF has_tailored_resumes AND no_cover_letters → "Complete your application with a cover letter"
IF has_applications(status=interviewing) AND no_mock_interviews → "Practice with a mock interview"
IF has_mock_interviews(score < 7) → "Your last score was 6.2 — practice again to improve"
IF credits_remaining < 10 → "Running low on credits — upgrade or buy a credit pack"
IF has_active_applications > 5 → "You have 5 active applications — check your reminders"
```

---

### 2.4 [Priority: HIGH] Landing Page Optimization

**What:** Restructure the landing page to reduce scroll fatigue and increase conversion:
1. Shorten to: Hero → 3 Key Features (not 8) → Social Proof → Pricing → CTA
2. Move detailed features to `/features` page
3. Add social proof section (even placeholder: "Trusted by 500+ job seekers")
4. Add sticky section navigation (jump to Pricing, Features, FAQ)

**Why:** The current landing page has 8+ sections requiring significant scrolling. Most visitors won't scroll past the third fold. A focused page with clear CTAs converts better.

**Complexity:** M (1 week) — Restructure existing content

**Affected files:**
- `app/page.tsx` — Restructure and trim
- Possibly new: `app/features/page.tsx` — Combined features overview page

**Implementation spec:**
- Hero: Keep as-is but replace emoji with Lucide icons
- Highlight 3 features max (Resume Tailoring, Mock Interviews, Application Tracker — the most differentiated)
- "See all features →" link to /features
- Social proof bar: "Join 500+ job seekers" (update with real number when available) + trust badges
- Pricing: Keep as-is (already good)
- Remove: Resources section (move to footer link), reduce FAQ to 5 most common questions
- Sticky nav: Home | Features | Pricing | FAQ — transparent on top, solid on scroll

---

### 2.5 [Priority: MEDIUM] Upgrade CTA Intelligence

**What:** Make the "Upgrade" card on the dashboard context-aware:
- Free users: Show "Upgrade to Pro" with top 3 Pro benefits
- Pro users: Show "Upgrade to Premium" with Premium benefits
- Premium users: Hide the upgrade card entirely (or show "Buy Credit Pack" if low)
- Grace period: Show "Renew Now" with urgency

**Why:** Showing a generic upgrade card to Premium users wastes valuable dashboard space. Targeted messaging converts better.

**Complexity:** S (1–2 days) — Conditional rendering based on plan

**Affected files:**
- `app/dashboard/page.tsx` — Upgrade card logic

---

### 2.6 [Priority: MEDIUM] Consistent FAQ Component

**What:** Create a single reusable `<Accordion />` component and use it on both landing and subscribe pages.

**Why:** Currently two different FAQ implementations exist (custom React state on landing, native `<details>` on subscribe). Inconsistent behavior and appearance.

**Complexity:** S (1 day) — Build component, replace both implementations

**Affected files:**
- New: `app/components/ui/Accordion.tsx`
- `app/page.tsx` — Replace custom FAQ
- `app/subscribe/page.tsx` — Replace `<details>` FAQ

---

### 2.7 [Priority: MEDIUM] Polish Empty States

**What:** Replace plain-text empty states ("No applications found") with the shared `<EmptyState />` component featuring:
- A relevant illustration or icon (from Lucide)
- Descriptive title ("No applications yet")
- Helpful subtitle ("Start tracking your job applications to stay organized")
- Clear CTA button ("Add Your First Application →")

**Why:** Empty states are the most common page a new user sees. They should sell the feature, not just say "nothing here."

**Complexity:** S (2–3 days) — Create EmptyState component + update ~8 pages

**Affected pages:**
- `/applications` — No applications
- `/resumes` — No resumes
- `/todos` — No TODOs
- `/analytics` — No data yet
- `/mock-interview` — No sessions
- `/cover-letter` — No cover letters
- `/star-stories` — No stories

---

## Phase 3: Long-Term Moats (1–3 months)

These are larger initiatives that create defensible advantages and significant user value.

---

### 3.1 [Priority: HIGH] Guided Job Application Workflow

**What:** Create a unified "Apply to Job" workflow that connects the entire tool suite in one flow:
1. Find/paste a job → auto-analyze
2. Select a resume → auto-tailor
3. Generate cover letter
4. Set up application tracking + reminders
5. (Optional) Practice with mock interview

Currently these are all separate pages users must navigate between manually. A guided flow would chain them together with clear "Next Step →" buttons.

**Why:** The biggest retention lever is making the complete workflow feel effortless. Currently, power users must navigate 4+ separate pages and manually connect the dots. A guided flow reduces friction from 15+ clicks to a single 5-step wizard.

**Complexity:** L (3–4 weeks) — New page/workflow component orchestrating existing endpoints

**Affected files:**
- New: `app/apply/page.tsx` — Multi-step wizard page
- Reuses existing API endpoints (no backend changes needed)
- Links to existing pages for detail editing

**Monetization:** This workflow naturally consumes 8+ credits per run (1 analysis + 5 tailoring + 2 cover letter), driving credit pack purchases and upgrades.

---

### 3.2 [Priority: HIGH] Application Status Pipeline View

**What:** Add a Kanban/pipeline view to the Applications page showing cards in columns: Saved → Applied → Phone Screen → Interview → Offer → Rejected. Users can drag cards between columns.

**Why:** Job seekers manage a pipeline, not a list. Every recruiter and sales tool uses pipeline views because they map to human mental models. This is the most requested feature pattern in career tools (Teal, Huntr both have it).

**Complexity:** M–L (2–3 weeks) — Install a lightweight drag library, new view component

**Affected files:**
- `app/applications/page.tsx` — Add toggle between list view and pipeline view
- New: `app/components/ApplicationPipeline.tsx`
- Backend: No changes (status field already exists on applications)

**Monetization:** Retention — daily engagement as users move cards through their pipeline.

---

### 3.3 [Priority: MEDIUM] AI Career Coach (Chat Interface)

**What:** A conversational AI assistant accessible from every page (floating button bottom-right) that can:
- Answer career questions ("How do I negotiate salary?")
- Help craft responses to recruiter messages
- Suggest next actions based on current application status
- Explain what each tool does and when to use it

**Why:** Differentiation moat. No competitor offers an embedded career coach that knows your resume, applications, and interview history. This transforms CareerPilot from "a bag of tools" into a "career partner."

**Complexity:** L (4–6 weeks) — New chat endpoint, context injection, frontend chat widget

**Affected files:**
- Backend: New `POST /api/v1/chat` endpoint with RAG-style context injection
- Frontend: New `app/components/ChatWidget.tsx` — floating button + drawer
- Credit cost: 1 credit per conversation turn

**Monetization:** Free: 5 messages/day. Pro: 50/day. Premium: Unlimited.

---

### 3.4 [Priority: MEDIUM] Interview Score Trends & Progress Tracking

**What:** Add a "My Progress" page that tracks:
- Mock interview scores over time (line chart)
- ATS scores over time
- Applications by week (bar chart)
- Response rate (% of applications that got callbacks)

**Why:** Progress visualization is one of the strongest retention hooks. Users who see improvement keep coming back. Users who see stagnation are motivated to practice more (using credits).

**Complexity:** M (2 weeks) — Aggregate existing data into chart-friendly format

**Affected files:**
- Backend: New `GET /api/v1/progress/summary` endpoint
- Frontend: `app/analytics/page.tsx` — Add charts (use a lightweight chart library like recharts)
- New: `app/components/ProgressChart.tsx`

**Monetization:** Free: Basic stats only. Pro/Premium: Full charts and trends.

---

### 3.5 [Priority: MEDIUM] Referral System

**What:** Users can invite friends via a unique link. Both referrer and invitee get bonus credits (e.g., 50 credits each) when the invitee signs up and uses their first feature.

**Why:** Virality lever. Career tools are inherently social — people ask friends "what tool did you use?" A referral system with credit incentives creates organic growth with zero ad spend.

**Complexity:** M (2 weeks) — Referral code generation, tracking, reward disbursement

**Affected files:**
- Backend: New `referrals` table, new endpoints for generating/redeeming codes
- Frontend: Profile page section or `/referral` page showing referral link + stats
- Email: Invitation email template

**Monetization:** Growth — reduces CAC, increases user base at low cost (50 credits ≈ $1.25 cost).

---

### 3.6 [Priority: LOW] Resume Template Library

**What:** Offer 5–10 professionally designed resume templates that users can choose when exporting their tailored resume to PDF. Currently export is plain text → basic PDF.

**Why:** Differentiation from competitors who only score/tailor but don't help with visual design. Premium templates are a strong Pro/Premium conversion lever.

**Complexity:** L (3–4 weeks) — PDF template engine, template designs, preview/selection UI

**Affected files:**
- Backend: Update PDF export endpoint to accept template parameter
- Frontend: Template gallery in resume export flow

**Monetization:** Free: 1 basic template. Pro: 5 templates. Premium: All templates + custom colors.

---

## Implementation Roadmap

### Sprint 1 (Week 1–2): Foundation Polish
| # | Item | Est. | Priority |
|---|------|------|----------|
| 1.1 | Replace emoji icons with Lucide React | 2–3 days | CRITICAL |
| 1.2 | Persistent sidebar on desktop | 1–2 days | HIGH |
| 1.5 | Global error boundary | 1 day | HIGH |
| 1.6 | Unified brand color palette | 1 day | MEDIUM |
| 1.7 | Collapse "Insights" into "Main" | 30 min | MEDIUM |

### Sprint 2 (Week 3–4): User Experience
| # | Item | Est. | Priority |
|---|------|------|----------|
| 1.3 | Dashboard onboarding checklist | 2–3 days | HIGH |
| 1.4 | Skeleton loading states | 2–3 days | HIGH |
| 2.1 | Shared UI component library (start) | 1 week | HIGH |
| 2.6 | Consistent FAQ component | 1 day | MEDIUM |

### Sprint 3 (Week 5–6): Dashboard Intelligence
| # | Item | Est. | Priority |
|---|------|------|----------|
| 2.2 | Dashboard activity feed | 1 week | HIGH |
| 2.3 | Smart contextual suggestions | 1 week | HIGH |
| 2.5 | Upgrade CTA intelligence | 1–2 days | MEDIUM |
| 2.7 | Polish empty states | 2–3 days | MEDIUM |

### Sprint 4 (Week 7–8): Landing & Conversion
| # | Item | Est. | Priority |
|---|------|------|----------|
| 2.4 | Landing page optimization | 1 week | HIGH |
| 2.1 | UI component library (continued migration) | ongoing | HIGH |

### Sprint 5–8 (Month 2–3): Strategic Features
| # | Item | Est. | Priority |
|---|------|------|----------|
| 3.1 | Guided job application workflow | 3–4 weeks | HIGH |
| 3.2 | Application pipeline (Kanban) view | 2–3 weeks | HIGH |
| 3.4 | Progress tracking & charts | 2 weeks | MEDIUM |

### Sprint 9–12 (Month 3–4): Growth & Differentiation
| # | Item | Est. | Priority |
|---|------|------|----------|
| 3.3 | AI Career Coach chat | 4–6 weeks | MEDIUM |
| 3.5 | Referral system | 2 weeks | MEDIUM |
| 3.6 | Resume template library | 3–4 weeks | LOW |

---

## Success Metrics

| Metric | Current (est.) | Target (3 months) | How to Measure |
|--------|---------------|-------------------|----------------|
| Time to first value | Unknown (no tracking) | < 3 minutes | Time from registration to first resume tailor |
| Activation rate | Unknown | > 40% | % of signups who use at least 1 AI feature in first session |
| Free → Pro conversion | Unknown | > 5% | Stripe subscription events / total free users |
| Daily active users | Unknown | Benchmark then +30% | Backend analytics |
| Bounce rate (landing) | Unknown | < 40% | Analytics |
| NPS score | Not measured | > 40 | In-app survey (future) |

---

## Technical Prerequisites

Before starting implementation, ensure:

1. **Install Lucide React:** `npm install lucide-react` (needed for Phase 1.1)
2. **Create `app/components/ui/` directory** for shared components
3. **Set up Next.js error/loading conventions** (error.tsx, not-found.tsx)
4. **Consider adding a lightweight chart library** for Phase 3.4: `npm install recharts` (only when needed)
5. **Consider adding a drag-and-drop library** for Phase 3.2: `npm install @dnd-kit/core @dnd-kit/sortable` (only when needed)

---

## What NOT To Do

- **Don't add a heavy UI library** (shadcn, Material UI, Ant Design). The app is too far along for a framework migration. Build lightweight custom components.
- **Don't redesign the backend.** The backend is solid. Focus all effort on the frontend experience.
- **Don't launch new AI features** before polishing the existing ones. More features on a rough UX doesn't help.
- **Don't add dark mode yet.** Get the light theme polished first. Dark mode is a nice-to-have, not a conversion driver.
- **Don't over-engineer animations.** Subtle transitions (150–200ms) on hover, modal open/close, and page transitions are sufficient. No complex motion design.
