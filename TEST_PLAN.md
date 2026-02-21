# CareerPilot AI Frontend - Comprehensive System Test Plan

**Test Date**: February 20, 2026  
**Environment**: Production Build (Next.js 16.1.6)  
**Build Version**: Latest (29 routes, 0 TypeScript errors)  
**Scope**: All 9 implementation phases (including AI Augmentation Features) + Dark Mode Support + Responsive Design + Browser Compatibility

---

## 1. Pre-Test Verification

### 1.1 Build Verification
- [ ] Run `npm run build` - verify all 29 routes compile
- [ ] Verify TypeScript compilation: 0 errors
- [ ] Check for warnings (pre-existing only, document any new ones)
- [ ] Verify static export or dynamic runtime capability
- [ ] Check bundle size analysis
- [ ] Verify all environment variables are set (.env.local)

### 1.2 Git State Verification
- [ ] Verify latest commit on main branch
- [ ] Running latest pushed code from GitHub
- [ ] No uncommitted changes in working directory
- [ ] All dependencies installed (node_modules present)

---

## 2. Phase 1: Core Foundation Tests

### 2.1 Landing & Navigation
**Route**: `/` (Home)
- [ ] Landing page loads without errors
- [ ] Hero section displays correctly
- [ ] CTA buttons are interactive and functional
- [ ] Navigation bar displays correctly
- [ ] Mobile responsiveness on phone/tablet/desktop
- [ ] Theme toggle button visible in navbar
- [ ] No console errors or warnings

**Route**: `/pricing`
- [ ] Pricing page loads with all tier cards visible
- [ ] Pricing tiers display: Basic, Pro, Enterprise
- [ ] Feature comparison table renders correctly
- [ ] CTA buttons ("Get Started", "Contact Sales") functional
- [ ] Responsive layout on all screen sizes
- [ ] No layout shift or CLS issues

### 2.2 Dashboard (Authenticated)
**Route**: `/dashboard`
- [ ] Dashboard loads when authenticated
- [ ] Redirects to login when not authenticated
- [ ] User information displays correctly
- [ ] Quick stats/overview section renders
- [ ] All dashboard cards load without errors
- [ ] Activity feed or recent items display

---

## 3. Phase 2: Authentication & Security Tests

### 3.1 Login Flow
**Route**: `/auth/login`
- [ ] Login page loads
- [ ] Email field accepts valid email format
- [ ] Password field is properly masked
- [ ] "Remember me" checkbox functional
- [ ] "Forgot password?" link navigates correctly
- [ ] Form validation on empty fields
- [ ] Form validation on invalid email format
- [ ] Error message displays for wrong credentials
- [ ] Successful login stores JWT token
- [ ] Redirects to dashboard post-login
- [ ] Token persisted in localStorage/secure storage

### 3.2 Email Verification
**Route**: `/auth/verify-email`
- [ ] Verification page loads with instructions
- [ ] OTP input field accepts 6-digit code
- [ ] Resend button functional (with rate limiting)
- [ ] Verification success navigates to dashboard
- [ ] Verification failure shows appropriate error
- [ ] Email displayed is correct (user's email)

### 3.3 Two-Factor Authentication (2FA)
**Route**: `/auth/2fa`
- [ ] 2FA setup page loads when enabled
- [ ] Authenticator app QR code displays correctly
- [ ] Manual entry key provided as fallback
- [ ] 2FA verification accepts 6-digit code
- [ ] Success stores 2FA status
- [ ] Backup codes generated and displayable
- [ ] Error on invalid 2FA code

### 3.4 Password Reset
**Route**: `/auth/forgot-password`
- [ ] Forgot password form accepts email
- [ ] Success message shown after submission
- [ ] Reset link sent to correct email address
- [ ] Reset link in email is valid and clickable
- [ ] Reset form validates password requirements
- [ ] Password strength indicator functional
- [ ] Confirmation message on successful reset
- [ ] Can login with new password

### 3.5 Sign Up
**Route**: `/auth/signup` (if separate from login)
- [ ] Signup page loads with form
- [ ] Email validation working
- [ ] Password strength requirements displayed
- [ ] Terms & conditions checkbox required
- [ ] Account creation succeeds with valid data
- [ ] Duplicate email prevention
- [ ] Confirmation email sent
- [ ] Auto-login or redirect to verify-email

### 3.6 Session Management
- [ ] Session persists across page navigation
- [ ] Session persists after browser refresh
- [ ] Logout clears token from storage
- [ ] Expired token redirects to login
- [ ] Unauthorized requests (401) redirect to login
- [ ] Forbidden requests (403) show error page
- [ ] CSRF protection in place (check headers)

### 3.7 Security Headers
- [ ] X-Frame-Options header present
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection header present
- [ ] Content-Security-Policy header present
- [ ] Strict-Transport-Security (HSTS) present
- [ ] No sensitive data in console logs (dev tools)

---

## 4. Phase 3: User Profile Management Tests

### 4.1 Profile Viewing
**Route**: `/profile`
- [ ] Profile page loads with user information
- [ ] User name displays correctly
- [ ] Email address displays correctly
- [ ] Profile picture displays if set
- [ ] Account creation date shown
- [ ] Account status displayed

### 4.2 Profile Editing
**Route**: `/profile/edit`
- [ ] Edit page loads with current values pre-filled
- [ ] Name field editable
- [ ] Bio/about section editable
- [ ] Profile picture upload functional
- [ ] Save changes persisted to backend
- [ ] Success message displays after save
- [ ] Form validation on required fields
- [ ] Cancel button doesn't save changes
- [ ] Image upload validates file type
- [ ] Image upload validates file size

### 4.3 Security Settings
**Route**: `/profile/security`
- [ ] Security page loads
- [ ] "Change Password" section visible
- [ ] Current password validation works
- [ ] New password meets requirements
- [ ] Password confirmation matches
- [ ] Successful password change message
- [ ] Connected devices/sessions listed
- [ ] Logout from other sessions functional
- [ ] 2FA toggle works (enable/disable)
- [ ] Login activity/history displayed
- [ ] IP address logging visible

### 4.4 Account Preferences
- [ ] Email notification preferences editable
- [ ] Marketing email opt-in/out functional
- [ ] Language preference selectable
- [ ] Timezone preference saves correctly
- [ ] Privacy settings selectable
- [ ] Data export option available

---

## 5. Phase 4: Stripe Subscription & Payment Tests

### 5.1 Subscription Page
**Route**: `/subscription`
- [ ] Subscription page loads
- [ ] Current subscription tier displayed
- [ ] Billing cycle shown (monthly/annual)
- [ ] Next billing date shown
- [ ] Upgrade/Downgrade buttons visible
- [ ] Cancel subscription option available
- [ ] Invoices/receipts listed

### 5.2 Upgrade Flow
**Route**: `/subscription/upgrade`
- [ ] Upgrade page shows available plans
- [ ] Pricing clearly displayed
- [ ] Feature comparison shown
- [ ] Stripe payment form loads
- [ ] Card number field accepts input
- [ ] Expiry date field validates format
- [ ] CVC field accepts input
- [ ] Billing address fields optional (if enabled)
- [ ] Process payment button functional
- [ ] Loading state shows during processing
- [ ] Success page displays after payment
- [ ] Subscription tier updates immediately
- [ ] Invoice generated and available
- [ ] Confirmation email sent

### 5.3 Billing Management
- [ ] Billing page loads without errors
- [ ] Payment method displayed (last 4 digits)
- [ ] Update payment method functional
- [ ] Billing address editable
- [ ] Invoice history displays
- [ ] Invoice download links work
- [ ] Refund policy link accessible
- [ ] Cancel subscription shows confirmation

### 5.4 Error Handling (Payment Specific)
- [ ] Insufficient funds error handled
- [ ] Expired card error handled
- [ ] Invalid card error handled
- [ ] Network timeout error handled gracefully
- [ ] Duplicate charge prevention

### 5.5 Webhook Verification (Backend Integration)
*Note: These verify backend receives Stripe events*
- [ ] Payment succeeded webhook received
- [ ] Subscription created webhook received
- [ ] Subscription updated webhook received
- [ ] Subscription deleted webhook received
- [ ] Payment failed webhook handled

---

## 6. Phase 5: Resume Library Management Tests

### 6.1 Resume Library Page
**Route**: `/resumes`
- [ ] Resume library page loads
- [ ] All user resumes listed in table/grid view
- [ ] Resume count displayed correctly
- [ ] Last modified date shown
- [ ] Empty state message if no resumes
- [ ] Create new resume button visible
- [ ] Search/filter functionality working
- [ ] Sort by name/date functionality works
- [ ] Delete button available for each resume
- [ ] Edit button available for each resume
- [ ] View/download button functional

### 6.2 Resume Creation
**Route**: `/resumes/new`
- [ ] Create resume page loads
- [ ] Resume title input accepts text
- [ ] Upload method toggle works (Paste Text / Upload File)
- [ ] Dark mode variants display correctly

#### Paste Text Method
- [ ] Text method tab displays textarea
- [ ] Textarea accepts resume text content
- [ ] Character count updates as user types
- [ ] Paste button enabled when title and content present
- [ ] Submission creates resume with uploaded content
- [ ] Redirects to resume edit page on success
- [ ] Error message displays for empty content
- [ ] Error message displays for empty title

#### Upload File Method
- [ ] File method tab displays file picker
- [ ] File size limit note displays (5 MB max)
- [ ] File type note displays (PDF, DOCX, TXT)
- [ ] File input accepts .pdf files
- [ ] File input accepts .docx files
- [ ] File input accepts .txt files
- [ ] File input rejects invalid file types (e.g., .jpg)
- [ ] Error displays: "Invalid file type" for unsupported format
- [ ] File accepts correctly named files with extensions
- [ ] File size validation: File under 5MB accepts
- [ ] File size validation: File over 5MB shows error
- [ ] Error displays: "File size exceeds 5 MB limit" with actual size
- [ ] Selected filename displays in file zone
- [ ] Loading spinner shows during file upload
- [ ] Success: File uploaded to `/api/v1/resumes/upload-file`
- [ ] Extracted text from file displays in preview
- [ ] Resume created with extracted text from file
- [ ] Redirects to resume edit page on success
- [ ] Error handling: Backend 400 error displays detail message
- [ ] Error handling: Network error shows friendly message
- [ ] Clear error messages if user selects new file after error

#### Resume Upload API Integration
- [ ] POST `/api/v1/resumes/upload` (paste text) called with correct payload
  - [ ] filename field populated
  - [ ] content field populated
  - [ ] Authorization header included (Bearer token)
- [ ] POST `/api/v1/resumes/upload-file` (file upload) called correctly
  - [ ] multipart/form-data sent (not JSON)
  - [ ] file field contains binary file data
  - [ ] Authorization header included (Bearer token)
  - [ ] Content-Type header NOT manually set (browser adds it)
- [ ] Response parsing: `resume_id` extracted correctly
- [ ] Response parsing: `parsed.experience_text` extracted for content
- [ ] Response parsing: `filename` used for file naming
- [ ] File upload response: `file_type` indicates format (.pdf, etc.)
- [ ] File upload response: `text_length` shows extracted character count

#### Downstream Integration
- [ ] Extracted text passes to subsequent tailor/analyze features
- [ ] Resume text available in job application flow
- [ ] Extracted text usable in STAR stories generation

### 6.3 Resume Editing
**Route**: `/resumes/[id]/edit`
- [ ] Edit page loads with resume data
- [ ] All fields pre-populated with current data
- [ ] All modification capabilities work (add/remove/edit)
- [ ] Save changes persisted
- [ ] Success message shows
- [ ] Version history preserved
- [ ] Previous versions accessible
- [ ] Restore previous version functional
- [ ] Cancel button exits without saving

### 6.4 Resume Preview
**Route**: `/resumes/[id]`
- [ ] Preview page loads
- [ ] Resume displays in professional format
- [ ] All sections display correctly
- [ ] Responsive layout for printing
- [ ] Download as PDF functional
- [ ] Download as DOCX functional
- [ ] Share link generated if enabled
- [ ] Edit button links to edit page
- [ ] Back button returns to library

### 6.5 Multiple Resume Versions
- [ ] Create version of existing resume works
- [ ] Version naming customizable
- [ ] Version history shows all versions
- [ ] Switch between versions functional
- [ ] Delete old versions functional
- [ ] Compare versions (if feature exists)

---

## 6.6 AI Augmentation Features Tests

### 6.6.1 Tailor Resume Feature
**Route**: `/tailor`
- [ ] Tailor resume page loads without errors
- [ ] "Job Description" textarea visible and functional
- [ ] "Target Role" field visible and editable
- [ ] "Tone" dropdown visible with options
- [ ] Dark mode styling applied correctly
- [ ] Page responsive on mobile/tablet/desktop

#### Resume Input Method: Select Saved Resume
- [ ] "📚 Select Saved" tab button visible
- [ ] Clicking tab switches to select method
- [ ] Resume list loads on page mount
- [ ] Saved resumes displayed with:
  - [ ] Resume title
  - [ ] Version number (if applicable)
  - [ ] Character count
  - [ ] Last update date
- [ ] Empty state message displays if no saved resumes
- [ ] "Create one now" link visible in empty state
- [ ] Click resume to select and load content
- [ ] Selected resume content loads into form
- [ ] Character count displays after selection
- [ ] Resume persists when switching tabs and back
- [ ] API call: `getResumes()` fetches saved resumes
- [ ] Error handling: If no resumes exist, fallback message shown
- [ ] Error handling: API failure shows user-friendly message
- [ ] Dark mode: Resume list styled correctly (dark:bg-slate-800, etc.)
- [ ] Dark mode: Selected state visually distinct

#### Resume Input Method: Upload File
- [ ] "📤 Upload File" tab button visible
- [ ] Clicking tab switches to upload method
- [ ] File input accepts .pdf files
- [ ] File input accepts .docx files
- [ ] File input accepts .txt files
- [ ] File input rejects .jpg files with error
- [ ] File input rejects .doc files with error
- [ ] File size limit note displays (5 MB max)
- [ ] File type note displays (PDF, DOCX, TXT accepted)
- [ ] Selected filename displays in upload zone
- [ ] File validation: File under 1 MB accepts immediately
- [ ] File validation: File between 1 MB - 5 MB accepts with size feedback
- [ ] File validation: File over 5 MB shows error:
  - [ ] Error message: "File size exceeds 5 MB limit. Your file is X.XX MB"
  - [ ] Error displayed in red box with dark mode support
  - [ ] User can select new file after error
- [ ] File validation: Invalid type shows error:
  - [ ] Error message: "Invalid file type. Accepted: .pdf, .docx, .txt"
  - [ ] User can select correct file after error
- [ ] File upload process:
  - [ ] Loading indicator shows "Extracting text..."
  - [ ] Upload spinner visible during extraction
  - [ ] Character count updates after extraction
- [ ] Success: File text extracted and displayed in form
- [ ] Success: API call `/api/v1/resumes/upload-file` made correctly
- [ ] Success: Multipart/form-data sent (not JSON)
- [ ] Success: Authorization Bearer token included
- [ ] Success: Response `parsed.experience_text` used in form
- [ ] Success message displays character count from extracted text
- [ ] File persists when switching tabs and back
- [ ] Error handling: Network error shows friendly message
- [ ] Error handling: Backend error status shows details
- [ ] Error handling: User can retry after error
- [ ] Dark mode: Upload zone styled correctly
- [ ] Dark mode: Error messages styled correctly
- [ ] Dark mode: Success message styled correctly

#### Resume Input Method: Paste Text
- [ ] "📋 Paste Text" tab button visible
- [ ] Clicking tab switches to paste method
- [ ] Textarea visible and accepts text input
- [ ] Character count displays and updates
- [ ] Placeholder text helpful and clear
- [ ] User can paste resume text directly
- [ ] Content persists when switching tabs and back
- [ ] No character limit enforced
- [ ] Dark mode: Textarea styled correctly (dark:bg-slate-700)
- [ ] Dark mode: Character count visible (dark:text-slate-50)

#### Resume Input Method Integration
- [ ] Switching between methods preserves other form fields
- [ ] Job description textarea retains content
- [ ] Target role retains content
- [ ] Tone selection retains value
- [ ] Only one method tab active at a time
- [ ] Visual indicator shows active method

#### Tailor Resume Functionality
- [ ] Job description textarea accepts job posting text
- [ ] Target role field accepts role title
- [ ] Tone dropdown shows options (Professional, Casual, etc.)
- [ ] "Tailor Resume" button visible and enabled
- [ ] Button disabled if resume/job description empty
- [ ] Tailor button shows loading spinner on click
- [ ] API call: `tailorResume()` sent with:
  - [ ] Resume content from selected method
  - [ ] Job description text
  - [ ] Target role
  - [ ] Selected tone
  - [ ] Authorization token
- [ ] Results section displays extracted requirements
- [ ] Results section displays tailored resume text
- [ ] Results styled appropriately with dark mode support
- [ ] Results can be copied to clipboard
- [ ] Results can be saved as new resume version (if applicable)
- [ ] Error message displays if tailor fails
- [ ] Error handling: Network error shows message
- [ ] Error handling: Empty resume/job description validation

#### Cross-Feature Integration
- [ ] Resume selected from library can be tailored
- [ ] Uploaded file text can be tailored
- [ ] Pasted text can be tailored
- [ ] Tailored resume can be saved to library
- [ ] Tailored resume accessible in /resumes for download

### 6.6.2 Cover Letter Generation Feature
**Route**: `/cover-letter`
- [ ] Cover letter page loads without errors
- [ ] Job description input visible
- [ ] Company name input visible
- [ ] Position title input visible
- [ ] Tone/style selector visible
- [ ] Generate button visible and functional
- [ ] Results section displays generated letter
- [ ] Generated content formatted as proper letter
- [ ] Copy to clipboard button functional
- [ ] Save as template button functional
- [ ] Dark mode styling applied throughout
- [ ] Mobile responsive layout

### 6.6.3 Analyze Job Posting Feature
**Route**: `/analyze-job`
- [ ] Analyze job page loads without errors
- [ ] Job posting textarea visible and functional
- [ ] Character count displayed
- [ ] Submit button visible
- [ ] Analysis results display:
  - [ ] Key skills extracted
  - [ ] Experience requirements identified
  - [ ] Salary range (if mentioned) highlighted
  - [ ] Company culture indicators
  - [ ] Growth opportunities
  - [ ] Red flags (if any)
- [ ] Results formatted clearly
- [ ] Dark mode styling applied
- [ ] Mobile responsive layout

### 6.6.4 STAR Stories Generator Feature
**Route**: `/star-stories`
- [ ] STAR stories page loads without errors
- [ ] Situation textarea visible
- [ ] Task textarea visible
- [ ] Action textarea visible
- [ ] Result textarea visible
- [ ] Generate/refine button visible
- [ ] Tips/guidelines section visible
- [ ] Generated story displays with:
  - [ ] Proper formatting
  - [ ] Professional language
  - [ ] Interview-ready quality
- [ ] Generate multiple versions button functional
- [ ] Save story button functional
- [ ] Copy to clipboard button functional
- [ ] Dark mode styling applied
- [ ] Mobile responsive layout

---

## 7. Phase 7: Job Application Tracker Tests

### 7.1 Applications Dashboard
**Route**: `/applications`
- [ ] Applications dashboard loads
- [ ] All applications listed
- [ ] Status filter functional (Applied, Interview, Offer, Rejected, etc.)
- [ ] Company name displays for each
- [ ] Position title displays for each
- [ ] Application date shown
- [ ] Last update date shown
- [ ] Next action/reminder shown
- [ ] Sort by company/date/status works
- [ ] Search functionality works
- [ ] Create new application button visible
- [ ] Empty state if no applications

### 7.2 Create Application
**Route**: `/applications/create`
- [ ] Create application page loads
- [ ] Form fields for:
  - [ ] Company name
  - [ ] Position title
  - [ ] Application date
  - [ ] Job description (optional)
  - [ ] Application link/URL
  - [ ] Contacts (name, email, phone)
  - [ ] Status selection
  - [ ] Salary range (if known)
  - [ ] Notes
- [ ] All fields editable
- [ ] Add multiple contacts functional
- [ ] Save application successful
- [ ] Redirects to application detail
- [ ] Success notification displays

### 7.3 Application Details & Tracking
**Route**: `/applications/[id]`
- [ ] Application detail page loads
- [ ] All application info displays
- [ ] Status can be updated
- [ ] Status change persisted
- [ ] Timeline of interactions shows
- [ ] Add note/update functional
- [ ] Notes display in order
- [ ] Contact information displayed and editable
- [ ] Resume associated with application shown
- [ ] Edit application button functional
- [ ] Delete application button functional
- [ ] Delete confirmation dialog appears

### 7.4 Application Timeline & Reminders
- [ ] Timeline shows all actions chronologically
- [ ] Set reminders functional
- [ ] Reminder notifications sent (if enabled)
- [ ] Interview dates stored
- [ ] Interview times stored
- [ ] Interview location/link stored
- [ ] Offer details stored if received
- [ ] Rejection reasons stored

### 7.5 Status Workflow
- [ ] Status transitions: Applied → Interview → Offer → Accepted
- [ ] Status transitions: Applied → Rejected
- [ ] Status updates reflected immediately
- [ ] Cannot transition to invalid states
- [ ] Status change timestamps recorded

### 7.6 Bulk Actions
- [ ] Select multiple applications checkbox works
- [ ] Bulk status update functional
- [ ] Bulk delete with confirmation works
- [ ] Export selected applications (CSV/JSON)

---

## 8. Phase 8: Advanced Analytics Tests

### 8.1 Analytics Dashboard
**Route**: `/analytics`
- [ ] Analytics page loads without errors
- [ ] Dashboard displays all charts
- [ ] Loading states visible during data fetch

### 8.2 Key Metrics
- [ ] Application metrics displayed:
  - [ ] Total applications count
  - [ ] Applications this month
  - [ ] Success rate (offers/applications)
  - [ ] Average response time
- [ ] Metrics update when data changes
- [ ] Metric cards are responsive

### 8.3 Time-Series Charts
- [ ] Applications over time chart:
  - [ ] X-axis shows dates/months
  - [ ] Y-axis shows application count
  - [ ] Line/bar chart renders correctly
  - [ ] Hover shows data points
- [ ] Status distribution chart:
  - [ ] Pie/donut chart displays correctly
  - [ ] Legend shows all statuses
  - [ ] Percentages calculated correctly
- [ ] Response time trends:
  - [ ] Trend line shows over time
  - [ ] Predictions visible (if applicable)

### 8.4 Date Range Filtering
- [ ] Date range picker functional
- [ ] Preset ranges work (Last 30 days, 3 months, etc.)
- [ ] Custom date range selection works
- [ ] Charts update when date range changes
- [ ] Data recalculates correctly

### 8.5 Insights & Recommendations
- [ ] Insights section displays recommendations
- [ ] Recommendations are contextual and helpful
- [ ] Actionable suggestions provided
- [ ] Updates based on data changes

### 8.6 Data Export
- [ ] Export to CSV functional
- [ ] Export to PDF functional
- [ ] Export includes current filters
- [ ] File downloads successfully

---

## 9. Phase 9: Dark Mode Support Tests

### 9.1 Theme Toggle
- [ ] Theme toggle button visible in navbar
- [ ] Toggle button displays correct icon:
  - [ ] Moon (🌙) in light mode
  - [ ] Sun (☀️) in dark mode
- [ ] Clicking toggle switches theme
- [ ] Theme change applies immediately
- [ ] No flash of wrong theme
- [ ] Smooth transition between themes

### 9.2 Light Mode
- [ ] Background color: light (slate-50)
- [ ] Text color: dark (slate-900)
- [ ] Cards: white background
- [ ] Borders: light (slate-200)
- [ ] Links: blue and hover correctly
- [ ] Buttons render with light styling
- [ ] Form inputs visible and styled
- [ ] Navigation bar styled correctly

### 9.3 Dark Mode
- [ ] Background color: dark (slate-950)
- [ ] Text color: light (slate-50)
- [ ] Cards: dark background (slate-800)
- [ ] Borders: dark (slate-800)
- [ ] Links: styled for dark mode
- [ ] Buttons render with dark styling
- [ ] Form inputs visible in dark mode
- [ ] Navigation bar styled correctly
- [ ] All interactive elements visible

### 9.4 System Preference Detection
- [ ] On first visit, detects system preference
- [ ] If system is light: app loads in light mode
- [ ] If system is dark: app loads in dark mode
- [ ] User can override system preference
- [ ] Override persists after refresh

### 9.5 Theme Persistence
- [ ] Selected theme saved to localStorage
- [ ] localStorage key is `careerpilot_theme`
- [ ] Theme persists after page refresh
- [ ] Theme persists after browser restart
- [ ] Clear localStorage removes preference
- [ ] Validity of stored value verified

### 9.6 Theme Consistency
- [ ] All 29 pages respect dark mode
- [ ] All components dark mode compatible:
  - [ ] Cards
  - [ ] Forms
  - [ ] Buttons
  - [ ] Links
  - [ ] Navigation
  - [ ] Tables
  - [ ] Modals/Dialogs
- [ ] No elements invisible in either mode
- [ ] Contrast ratios meet accessibility standards

### 9.7 Dark Mode Edge Cases
- [ ] Charts/graphs visible in dark mode
- [ ] Images have proper contrast
- [ ] Third-party components (e.g., Stripe form) styled appropriately
- [ ] Hover states visible in dark mode
- [ ] Focus states visible in dark mode
- [ ] Errors/warnings visible in dark mode

---

## 10. Cross-Cutting Concerns: Responsive Design Tests

### 10.1 Mobile (375px - 667px)
- [ ] All pages load without horizontal scroll
- [ ] Navigation collapses to mobile menu
- [ ] Forms are usable on mobile keyboard
- [ ] Touch targets are 44px minimum
- [ ] Buttons clickable without overlapping text
- [ ] Images scale appropriately
- [ ] Tables scroll horizontally or stack

### 10.2 Tablet (768px - 1024px)
- [ ] Layout adapts to tablet width
- [ ] All content visible without excessive scrolling
- [ ] Two-column layouts adjust appropriately
- [ ] Navigation visible and functional
- [ ] Trust elements (testimonials, badges) display well

### 10.3 Desktop (1025px+)
- [ ] Full layout displays as designed
- [ ] Multi-column layouts render correctly
- [ ] Sidebar navigation visible
- [ ] Charts and graphs display at full width
- [ ] Three-column layouts work (if applicable)

---

## 11. Cross-Cutting Concerns: Browser Compatibility Tests

**Browsers to Test**: Chrome, Firefox, Safari, Edge (latest 2 versions)

### 11.1 Chrome/Chromium
- [ ] Latest version loads without errors
- [ ] All features functional
- [ ] Performance: page load < 3 seconds
- [ ] Console shows no critical errors

### 11.2 Firefox
- [ ] Latest version loads without errors
- [ ] All features functional
- [ ] Form validation works
- [ ] Dark mode toggle functional

### 11.3 Safari (macOS & iOS)
- [ ] Latest version loads without errors
- [ ] All features functional
- [ ] iOS touch interactions work
- [ ] Dark mode respects system preference

### 11.4 Edge
- [ ] Latest version loads without errors
- [ ] All features functional
- [ ] Compatibility with Chromium engine verified

---

## 12. Performance Tests

### 12.1 Page Load Performance
- [ ] Home page: First Contentful Paint < 1.5s
- [ ] Dashboard: FCP < 2s
- [ ] Form pages: FCP < 2s
- [ ] Analytics: FCP < 2.5s
- [ ] Time to Interactive: < 5s for all pages

### 12.2 Bundle Performance
- [ ] Initial JS bundle < 150KB (gzipped)
- [ ] CSS bundle < 50KB (gzipped)
- [ ] No unused CSS in production build
- [ ] Tree-shaking working (no dead code)
- [ ] Dynamic imports reduce initial bundle

### 12.3 Runtime Performance
- [ ] Smooth interactions (60fps animations)
- [ ] Theme toggle is instant (no lag)
- [ ] Form submission doesn't freeze UI
- [ ] No memory leaks on repeated actions
- [ ] Long lists don't cause jank

### 12.4 Image Optimization
- [ ] Images are optimized (Next.js Image component)
- [ ] No render-blocking images
- [ ] Lazy loading working for below-the-fold images
- [ ] Appropriate image formats used (WebP, etc.)

---

## 13. Accessibility Tests

### 13.1 Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical and intuitive
- [ ] Focus visible with indicator
- [ ] Escape closes modals/dropdowns
- [ ] Enter activates buttons/links
- [ ] No keyboard traps

### 13.2 Screen Reader Testing
- [ ] Page structure semantic (proper headings)
- [ ] Form labels associated with inputs
- [ ] Buttons have accessible names
- [ ] Links have descriptive text
- [ ] Images have alt text
- [ ] ARIA labels where needed
- [ ] Live regions announced for dynamic content

### 13.3 Color Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Large text contrast ratio ≥ 3:1
- [ ] Interactive elements have adequate contrast
- [ ] Dark mode contrast ratios also meet standards

### 13.4 Form Accessibility
- [ ] All input fields have labels
- [ ] Error messages associated with fields
- [ ] Required fields marked
- [ ] Password fields properly masked
- [ ] Form validation messages clear

---

## 14. Data & Integration Tests

### 14.1 Data Flow Verification
- [ ] User creation data persists
- [ ] Resume data saves and retrieves correctly
- [ ] Application data saves and retrieves correctly
- [ ] Profile updates persist
- [ ] Subscription status syncs properly
- [ ] Analytics data accumulates correctly

### 14.2 API Integration
- [ ] All API endpoints respond correctly
- [ ] API errors handled with user-friendly messages
- [ ] Network timeout handled gracefully
- [ ] No API calls exposed in client code
- [ ] Request/response logging works (if applicable)

#### Resume Upload API Error Handling
- [ ] 400 Bad Request: Unsupported file type shows error
- [ ] 400 Bad Request: Empty file shows error
- [ ] 400 Bad Request: File too large shows error
- [ ] 400 Bad Request: Text extraction failed shows error
- [ ] 401 Unauthorized: Missing token redirects to login
- [ ] 401 Unauthorized: Invalid token redirects to login
- [ ] 403 Forbidden: User cannot access other user's uploads
- [ ] 413 Payload Too Large: File exceeds server limit
- [ ] 500 Server Error: Shows friendly error message
- [ ] Network error during upload: Shows retry option
- [ ] Timeout during file upload: Shows helpful message
- [ ] Partial upload recovery: Resume can be retried
- [ ] Multiple simultaneous uploads: Handled correctly
- [ ] Upload progress tracking (if applicable)
- [ ] Cancel upload mid-way (if applicable)
- [ ] Resume upload doesn't block UI
- [ ] Form data validation before sending to API
- [ ] Authorization header includes Bearer token
- [ ] No sensitive data in error responses exposed to client

### 14.3 Database Integrity
- [ ] No orphaned data after deletions
- [ ] Foreign key constraints maintained
- [ ] Data relationships intact
- [ ] Concurrent updates handled correctly

### 14.4 Cache Management
- [ ] Static content cached correctly
- [ ] Dynamic content invalidates properly
- [ ] No stale data displayed
- [ ] Cache headers set appropriately

---

## 15. Edge Cases & Error Handling

### 15.1 Network Conditions
- [ ] Slow 3G: app remains usable
- [ ] Offline: graceful error messages
- [ ] Connection drops mid-action: recoverable
- [ ] Request timeout: user-friendly error

### 15.2 Input Validation
- [ ] XSS attempt in text field blocked
- [ ] SQL injection characters handled
- [ ] Email format validation
- [ ] Phone number format validation
- [ ] URL validation

#### File Upload Validation (Resume Upload)
- [ ] Empty file rejected with error message
- [ ] File with 0 bytes rejected
- [ ] Exact 5 MB file accepted
- [ ] File slightly under 5 MB accepted
- [ ] File slightly over 5 MB rejected with size message
- [ ] Very large file (100+ MB) rejected with helpful error
- [ ] .pdf file accepted and processed
- [ ] .docx file accepted and processed
- [ ] .txt file accepted and processed
- [ ] .doc file rejected (only .docx accepted)
- [ ] .jpg file rejected with type error
- [ ] .png file rejected with type error
- [ ] .zip file rejected with type error
- [ ] File with no extension rejected
- [ ] File with double extension (.pdf.zip) rejected
- [ ] File with uppercase extension (.PDF) accepted (case insensitive)
- [ ] File with spaces in name accepted
- [ ] File with special characters in name accepted
- [ ] Unicode filename handled correctly
- [ ] Very long filename truncated appropriately
- [ ] Corrupt/unreadable file shows backend error
- [ ] Empty PDF file handled gracefully
- [ ] Text extraction failure shows error message
- [ ] Invalid UTF-8 in file handled
- [ ] File with only whitespace extracted as empty
- [ ] Uploaded file not modified after client processing

### 15.3 State Management
- [ ] Page refresh maintains scroll position
- [ ] Form data retained on validation error
- [ ] Navigation backward works correctly
- [ ] Navigation forward works correctly
- [ ] Back button doesn't cause errors

### 15.4 User Scenarios
- [ ] Rapidly clicking button (debouncing)
- [ ] Closing modal mid-action
- [ ] Navigating away from incomplete form
- [ ] Multiple tabs open with same app
- [ ] User session timeout (idle)

---

## 16. Pre-Deployment Checklist

### 16.1 Code Quality
- [ ] No console errors in production build
- [ ] No console warnings except pre-existing ones
- [ ] No TypeScript errors remaining
- [ ] No broken links in app
- [ ] No placeholder text in UI
- [ ] All TODOs/FIXMEs resolved

### 16.2 Configuration
- [ ] Environment variables configured correctly
- [ ] API endpoints point to correct environment
- [ ] Stripe keys configured (public key visible, secret key hidden)
- [ ] Database connection string correct
- [ ] Email service configured
- [ ] CORS settings appropriate

### 16.3 Documentation
- [ ] README.md up to date
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Installation steps working
- [ ] Deployment steps documented
- [ ] Known issues documented

### 16.4 Git & Version Control
- [ ] All changes committed
- [ ] Commit history is clean
- [ ] Branch protection rules enabled on main
- [ ] No secrets in git history
- [ ] Latest version on GitHub

---

## 17. Post-Deployment Tests

*Run these after deploying to production*

### 17.1 Health Checks
- [ ] Application responds at deployment URL
- [ ] All pages accessible
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Third-party services (Stripe, email) working

### 17.2 Real-World Scenario
- [ ] New user signup flow end-to-end
- [ ] Verify email functionality
- [ ] 2FA setup and verification
- [ ] Create resume end-to-end
- [ ] Create application end-to-end
- [ ] Upgrade subscription end-to-end
- [ ] Analytics data generation

### 17.3 Monitoring
- [ ] Error tracking (Sentry/similar) working
- [ ] Analytics collecting data
- [ ] Performance monitoring initiated
- [ ] Uptime monitoring active
- [ ] Log aggregation working

---

## Test Execution Strategy

### Phase 1: Automated Testing (Run Immediately)
1. Run build verification
2. Execute any existing test suites
3. Check for console errors
4. Verify all 29 routes compile

### Phase 2: Manual Smoke Testing (30 minutes)
1. Test critical user paths:
   - Signup → Email Verification → Login → 2FA
   - Create Resume → Edit → Download
   - Create Application → Status Update
   - Subscribe to Pro Plan
   - Toggle Dark Mode
2. Test on 2 browsers (Chrome + Firefox or Safari)
3. Test on mobile device/simulator

### Phase 3: Comprehensive Testing (2-4 hours)
1. Follow test plan sections 2-15 systematically
2. Document any failures with:
   - Test name and step
   - Expected vs actual result
   - Screenshots/console errors
   - Browser and device info
3. Create issues for failures

### Phase 4: Integration & Performance (1-2 hours)
1. Verify all API integrations working
2. Run performance audit (Lighthouse)
3. Test across all browser combinations
4. Responsive design on real devices

### Phase 5: Final Verification (30 minutes)
1. Resolve critical issues
2. Re-test resolved issues
3. Final go/no-go decision
4. Document results

---

## Test Results Template

```
Test Run: [Date/Time]
Tester: [Name]
Environment: Production Build
Status: [PASS/FAIL]

Tests Passed: __/__
Tests Failed: __/__
Tests Skipped: __/__

Critical Issues: [Count]
Major Issues: [Count]
Minor Issues: [Count]

Issues Found:
1. [Feature] - [Issue Description] - [Severity]
2. [Feature] - [Issue Description] - [Severity]
...

Sign-Off: ☐ Ready for Deployment / ☐ Need More Testing
```

---

## Risk Assessment

**High-Risk Areas** (test thoroughly):
- Authentication flows (JWT, 2FA, password reset)
- Payment integration (Stripe)
- File uploads (resume PDFs/DOCX)
- Dark mode theme persistence
- Session management across browser refresh

**Medium-Risk Areas**:
- Form validation and error handling
- Responsive design edge cases
- Analytics data accuracy

**Low-Risk Areas**:
- Static content pages
- Navigation between authenticated pages
- UI styling and layout

---

## Go/No-Go Criteria

**DEPLOY IF**:
- ✅ All critical paths tested and working
- ✅ Zero critical/blocker issues
- ✅ Authentication working securely
- ✅ Payments working correctly
- ✅ Dark mode functional
- ✅ Build compiles without errors
- ✅ All 29 routes accessible
- ✅ No security vulnerabilities

**HOLD DEPLOYMENT IF**:
- ❌ Auth flows broken
- ❌ Payment processing failing
- ❌ Critical data loss scenarios
- ❌ Major security vulnerabilities
- ❌ Build fails or has errors
- ❌ More than 3 major issues unresolved

---

## Next Steps After Testing

1. Document all test results
2. Create issues for any bugs found
3. Prioritize and fix issues using triage
4. Re-test fixes
5. Final approval and deployment
6. Monitor production for errors
7. Gather user feedback
8. Plan improvements for next release
