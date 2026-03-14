# Apply Job Wizard — Redesign Workplan

## Overview

The Apply Wizard was redesigned from a 5-step flow into a comprehensive 6-step guided application pipeline. The goal is to consolidate the best features from the standalone Tailor, Cover Letter, and Tailor/Apply pages into a single, seamless wizard that walks the user through every stage of a job application.

---

## Architecture

- **File:** `app/apply/page.tsx`
- **Framework:** Next.js (App Router), React 19, Tailwind CSS 4, TypeScript 5
- **Backend APIs:** FastAPI (Python)
- **Key Dependencies:** `lucide-react` (icons), `TemplateSelector` component (PDF templates)

---

## Step-by-Step Design

### Step 1 — Job Details (`StepJobInput`)

| Feature | Description |
|---|---|
| URL Import | Paste a job posting URL → `apiClient.extractJobFromURL()` auto-fills description, title, company |
| Role & Company | Manual text inputs for role title and company name |
| Job Description | Large textarea (10 rows) for the full posting; minimum 20 characters to proceed |
| Navigation | **Next →** "Analyze Job" triggers `apiClient.analyzeJob()` |

### Step 2 — Analysis (`StepAnalysis`)

| Feature | Description |
|---|---|
| Extracted Requirements | AI-parsed requirements displayed in a scrollable card (max-h-80) |
| Resume Selector | Dropdown of saved resumes + blue info card (title, version, character count, last updated) |
| View Text Toggle | Expand/collapse to preview the selected resume's raw content |
| Tailor Checkbox | Purple gradient card — "Should we tailor your resume to match these requirements?" (default: checked, costs 1 credit) |
| Navigation | **Next →** If tailor enabled: calls `apiClient.tailorResume()` → moves to Step 3. If disabled: stores original resume text → moves to Step 3 |

### Step 3 — Resume (`StepResume`)

Two rendering paths depending on whether tailoring was performed:

#### Tailored Path
| Feature | Description |
|---|---|
| ATS Match Score | Color-coded score badge (green ≥80%, yellow ≥60%, red <60%) with progress bar, matched/missing keyword pills, and suggestions |
| Formatted Resume | Rendered with `renderFormattedText()` — bold headings, bullet lists, inline formatting |
| Section-level Editing | Extracts `**SECTION_NAME**` headings as clickable pills → user types instructions → `apiClient.editResumeSection()` regenerates that section only |
| Gap Analysis | Collapsible amber card — highlights gaps between resume and job requirements |
| Customization Explanation | Collapsible blue card — AI explains what was changed and why |
| PDF Download | Opens `TemplateSelector` modal → `apiClient.exportResumePDF()` → browser download |

#### Untailored Path
| Feature | Description |
|---|---|
| Plain Resume | Raw text display in a scrollable container |
| PDF Download | Same TemplateSelector + PDF export flow |

### Step 4 — Cover Letter (`StepCoverLetter`)

| Feature | Description |
|---|---|
| Tone Selector | Three card buttons: Professional 👔, Conversational 💬, Concise 📝 |
| Generate Button | `apiClient.generateCoverLetter()` — within-step action (not triggered by nav) |
| Editable Result | Full textarea for manual edits after generation + "Copy to clipboard" |
| PDF Download | `apiClient.exportResumePDF()` with "classic" template for cover letters |
| Skip Option | User can proceed to Step 5 without generating a cover letter |
| Regenerate | Button relabels to "Regenerate Cover Letter" if one already exists |

### Step 5 — Submit Application (`StepSubmit`)

| Feature | Description |
|---|---|
| Document Downloads | Always visible — Resume PDF + Cover Letter PDF (if generated) download buttons |
| Email Providers | Auto-fetched via `apiClient.getConnectedEmailProviders()` on step entry |
| Credit Balance | Fetched via `apiClient.getProfile()` for AI compose cost display |

#### With Connected Email
| Feature | Description |
|---|---|
| Attachment Badges | Visual pills: "📄 Resume.pdf" (blue) and "✉️ Cover_Letter.pdf" (purple, conditional) |
| Provider Selector | Dropdown of Gmail/Outlook accounts |
| Recipient Input | Email address of hiring manager / recruiter |
| Subject | Auto-filled: "Application for {role} – {company}" |
| Body Textarea | Manual entry or AI-assisted |
| AI Compose | `apiClient.generateApplyBody()` — costs 2 credits, generates subject + body |
| Send Button | `apiClient.tailorApply(payload)` — sends email with PDF attachments |
| Success State | Green checkmark, confirmation message, link to application details |

#### Without Connected Email
| Feature | Description |
|---|---|
| Prompt | Amber card directing user to Profile Settings to connect Gmail/Outlook |
| Fallback | Download buttons remain available for manual submission |

### Step 6 — Track Application (`StepTrack`)

| Feature | Description |
|---|---|
| Summary Card | Grid showing: role, company, tailored (yes/no), cover letter (yes/skipped), ATS score, email sent (yes/no) |
| Location | Text input |
| Job Type | Dropdown: Full-time, Part-time, Contract, Remote |
| Salary Range | Text input |
| Notes | Textarea for personal notes |
| Status Logic | If email was sent in Step 5 → status = "applied"; otherwise → status = "saved" |
| Navigation | **Save & Track** → `apiClient.createApplication()` → redirects to `/applications` |

---

## API Endpoints Used

| Endpoint | Step | Purpose |
|---|---|---|
| `extractJobFromURL(url)` | 1 | Import job from URL |
| `analyzeJob({ job_description })` | 1→2 | Extract requirements |
| `tailorResume({ user_id, resume_text, job_description, options })` | 2→3 | Tailor resume to job |
| `editResumeSection({ full_resume, section_name, instructions, job_description })` | 3 | Edit specific resume section |
| `exportResumePDF({ resume_text, title, template })` | 3, 4, 5 | Generate downloadable PDF |
| `generateCoverLetter({ user_id, resume_text, job_description, company_name, role_title, tone })` | 4 | Generate cover letter |
| `getConnectedEmailProviders()` | 5 | Fetch linked email accounts |
| `getProfile()` | 5 | Fetch credit balance |
| `generateApplyBody({ job_title, company_name, include_cover_letter, user_name, resume_text, job_description })` | 5 | AI compose email (2 credits) |
| `tailorApply(payload)` | 5 | Send application email |
| `createApplication({ ... })` | 6 | Save to application pipeline |

---

## Helper Functions

### `getCleanResume(text: string): string`
Strips `CUSTOMIZATION EXPLANATION` and `GAP ANALYSIS` markers from the tailored resume text so only the actual resume content is used for PDFs, emails, and display.

### `renderFormattedText(text: string): ReactNode[]`
Converts plain text with `**bold**` markers into `<strong>` elements and bullet lines (`•`, `-`, `*`) into proper `<ul>/<li>` lists. Used for rendering tailored resume, gap analysis, and customization explanation.

---

## State Management

All wizard state is held in a single `WizardState` interface with `useState`. Key additions over the original 5-step wizard:

| Field | Type | Purpose |
|---|---|---|
| `shouldTailor` | `boolean` | Whether to run resume tailoring (Step 2 checkbox) |
| `originalResumeText` | `string` | Pre-tailoring resume content for reference |
| `customizationText` | `string` | Extracted from tailored resume — explains AI changes |
| `tone` | `"professional" \| "conversational" \| "concise"` | Cover letter tone selection |

Email-related state is managed with separate `useState` hooks (not in `WizardState`) since it's only relevant to Step 5 and doesn't persist across steps.

---

## Navigation Logic

| From | Action | Behavior |
|---|---|---|
| Step 1 → 2 | "Analyze Job" | Calls `analyzeJob()`, sets extracted requirements |
| Step 2 → 3 | "Tailor Resume & Continue" or "Continue" | If tailor: calls `tailorResume()`. If not: stores original text |
| Step 3 → 4 | "Generate Cover Letter" | Simply advances (cover letter generation is within Step 4) |
| Step 4 → 5 | "Continue to Submit" | Advances; Step 5 auto-fetches email providers |
| Step 5 → 6 | "Continue to Track" | Advances |
| Step 6 → done | "Save & Track" | Calls `createApplication()`, redirects to `/applications` |

**Back** button: Returns to previous step (disabled on Step 1).

---

## UX Design Decisions

1. **Tailor opt-in (not forced):** Users can skip tailoring if they prefer their original resume, reducing friction for repeat applications.
2. **Cover letter generation is in-step:** The "Generate" button is inside Step 4, not triggered by navigation. This lets users skip the step entirely or regenerate freely.
3. **Section editing preserves context:** Users can refine individual resume sections without re-tailoring the whole document.
4. **Email in the wizard:** Eliminates the need to open a separate tab (`/tailor/apply`). Everything stays in one flow.
5. **Graceful email fallback:** Users without connected email still get download buttons and a clear path to connect accounts.
6. **Smart status tracking:** The final application status ("applied" vs "saved") is automatically set based on whether the email was actually sent.
7. **Collapsible details:** Gap analysis and customization explanation are collapsed by default to keep the Resume step clean while remaining accessible.

---

## Implementation Status

- [x] Step 1 — Job Details (URL import, role/company, job description)
- [x] Step 2 — Analysis (extracted requirements, resume selector with info card, tailor checkbox)
- [x] Step 3 — Resume (ATS score, formatted text, section editing, gap analysis, customization, PDF export)
- [x] Step 4 — Cover Letter (tone selector, generate, edit, copy, PDF download, skip)
- [x] Step 5 — Submit (email providers, compose with AI, send, document downloads, fallback)
- [x] Step 6 — Track (summary card, metadata fields, save with status logic)
- [x] Build verified — compiles successfully
