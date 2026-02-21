# Manual Smoke Test Guide - Resume File Upload Feature

**Date**: February 20, 2026  
**Server**: http://localhost:3001  
**Feature**: Resume Upload (Paste Text & File Upload)  
**Build Version**: 0eb3857 (file upload feature)

---

## Pre-Test Checklist
- [ ] Dev server running on port 3001
- [ ] Browser: Chrome/Firefox/Safari
- [ ] Dev tools open (F12) to check for console errors
- [ ] Test user account ready for login (or use existing)

---

## Smoke Test Scenarios

### Test 1: Navigate to Resume Upload Page
**Goal**: Verify page loads and renders correctly

1. [ ] Go to `http://localhost:3001`
2. [ ] Click "Dashboard" or navigate to `/resumes`
3. [ ] Click "Create New Resume" or "Upload Resume" button
4. [ ] **Expected**: Page loads at `/resumes/new` without errors
5. [ ] **Verify**: 
   - [ ] "Upload Resume" heading visible
   - [ ] Subtitle "Add your resume by uploading a file or pasting text" visible
   - [ ] Resume title input field shows
   - [ ] Two method buttons visible: "📋 Paste Text" and "📤 Upload File"
   - [ ] "Paste Text" button selected by default
   - [ ] No console errors (check Dev Tools)

**Status**: ☐ Pass / ☐ Fail
**Notes**: 

---

### Test 2: Paste Text Method - Basic Flow
**Goal**: Test pasting resume text and creating a resume

1. [ ] Ensure on `/resumes/new` page with "Paste Text" selected
2. [ ] Enter resume title: `"Test Resume - Paste Text"` in title input
3. [ ] Click in textarea and paste sample resume text:
   ```
   John Doe
   john.doe@example.com | (555) 123-4567

   PROFESSIONAL SUMMARY
   Software engineer with 5 years of experience

   EXPERIENCE
   Senior Software Engineer | TechCorp | 2021 - Present
   - Led development of microservices architecture
   - Improved API performance by 40%
   - Mentored 3 junior developers

   Software Engineer | StartupXYZ | 2019 - 2021
   - Built REST APIs using Node.js and Express
   - Implemented CI/CD pipelines with GitHub Actions

   EDUCATION
   Bachelor of Science in Computer Science | University State | 2019

   SKILLS
   Languages: JavaScript, TypeScript, Python, Java
   Frameworks: Next.js, React, Express, FastAPI
   Tools: Git, Docker, AWS, PostgreSQL
   ```
4. [ ] **Verify**:
   - [ ] Text appears in textarea
   - [ ] Character count updates (should show ~500+ characters)
   - [ ] Text appears in preview section below
   - [ ] Create button enabled (not greyed out)

5. [ ] Click "✓ Create Resume" button
6. [ ] **Expected**: 
   - [ ] Loading indicator appears briefly
   - [ ] Success: Redirects to resume edit page (`/resumes/[id]/edit`)
   - [ ] Resume title displays on edit page
   - [ ] No console errors

**Status**: ☐ Pass / ☐ Fail
**Errors Found**: 

---

### Test 3: Switch to Upload File Method
**Goal**: Test switching between methods

1. [ ] Go back to `/resumes/new`
2. [ ] Click "📤 Upload File" button
3. [ ] **Verify**:
   - [ ] Button changes to highlighted/blue state
   - [ ] Textarea disappears
   - [ ] File upload zone appears with "📄 Click to select file" message
   - [ ] Blue info box shows "Supported formats: PDF, DOCX, TXT • Maximum size: 5 MB"
   - [ ] "Paste Text" button is no longer highlighted
   - [ ] Any previous text is cleared

4. [ ] Click "📋 Paste Text" to switch back
5. [ ] **Verify**: Textarea reappears, file zone disappears

**Status**: ☐ Pass / ☐ Fail
**Notes**: 

---

### Test 4: File Upload Method - Text File (.txt)
**Goal**: Test uploading a plain text file

1. [ ] On `/resumes/new` with "📤 Upload File" selected
2. [ ] Enter resume title: `"Test Resume - TXT Upload"`
3. [ ] Create a test file with `.txt` extension containing:
   ```
   Jane Smith
   jane.smith@example.com

   PROFILE
   Experienced product manager with 7 years in SaaS

   EXPERIENCE
   Product Manager | CloudServices Inc | 2022 - Present
   - Managed product roadmap for 50k+ users
   - Increased user retention by 25%

   Product Manager | DataStartup | 2019 - 2022
   - Led cross-functional team of 8 people
   - Launched 3 major features

   EDUCATION
   MBA | Business School | 2019

   SKILLS
   Product Strategy, Agile, Jira, Analytics
   ```
4. [ ] Click in the file upload zone (or drag-drop the .txt file)
5. [ ] Select the text file
6. [ ] **Verify**:
   - [ ] Filename appears in upload zone: "resume.txt" or your filename
   - [ ] No error message shows
   - [ ] Content appears in preview section below
   - [ ] Character count shows the file size
   - [ ] Create button is enabled

7. [ ] Click "✓ Upload & Create Resume" button
8. [ ] **Expected**:
   - [ ] Loading spinner appears briefly
   - [ ] HTTP POST to `/api/v1/resumes/upload-file` succeeds (check Network tab)
   - [ ] Response contains `resume_id` and `parsed.experience_text`
   - [ ] Redirects to resume edit page
   - [ ] Extracted text displays on resume

**Status**: ☐ Pass / ☐ Fail
**API Response**: 
**Console Errors**: 

---

### Test 5: File Upload Method - PDF File
**Goal**: Test uploading a PDF file

1. [ ] Go back to `/resumes/new`
2. [ ] Enter title: `"Test Resume - PDF Upload"`
3. [ ] Create a simple PDF file with resume text (or use existing PDF resume)
4. [ ] Upload the PDF file
5. [ ] **Verify**:
   - [ ] Filename shows in upload zone (e.g., "resume.pdf")
   - [ ] No error message
   - [ ] Loading indicator shows during upload (may be quick)
   - [ ] Extracted text appears in preview
   - [ ] Redirects successfully after creation

**Status**: ☐ Pass / ☐ Fail
**Notes**: _If PDF upload fails, check backend for libreoffice or text extraction library_

---

### Test 6: File Upload Method - DOCX File
**Goal**: Test uploading a DOCX (Word) file

1. [ ] Go back to `/resumes/new`
2. [ ] Enter title: `"Test Resume - DOCX Upload"`
3. [ ] Create a Word document with resume content or use existing
4. [ ] Upload the DOCX file
5. [ ] **Verify**:
   - [ ] Filename shows in upload zone (e.g., "resume.docx")
   - [ ] No error message
   - [ ] Loading indicator shows
   - [ ] Extracted text appears in preview
   - [ ] Character count updates correctly
   - [ ] Successfully creates resume

**Status**: ☐ Pass / ☐ Fail
**Notes**: 

---

### Test 7: File Type Validation - Reject Invalid Type
**Goal**: Verify invalid file types are rejected

1. [ ] On `/resumes/new` with "📤 Upload File"
2. [ ] Try to upload a file with invalid extension:
   - [ ] `.jpg` image file
   - [ ] `.png` image file
   - [ ] `.zip` archive
   - [ ] `.exe` executable (if available)
3. [ ] **Expected**: Error message appears:
   - [ ] Red error box displays
   - [ ] Message: `"Invalid file type. Accepted types: .pdf, .docx, .txt"`
   - [ ] File is NOT uploaded
   - [ ] Upload zone returns to initial state
   - [ ] Create button remains disabled

**Status**: ☐ Pass / ☐ Fail
**Error Messages Shown**: 

---

### Test 8: File Size Validation
**Goal**: Verify file size limit is enforced

#### Test 8a: File Under 5 MB (Should Accept)
1. [ ] Create a valid text file around 4.5 MB
2. [ ] Try to upload it
3. [ ] **Expected**: Accepts file, no error message

**Status**: ☐ Pass / ☐ Fail

#### Test 8b: File Exactly 5 MB (Should Accept)
1. [ ] Create a text file approximately 5 MB
2. [ ] Upload it
3. [ ] **Expected**: Accepts file

**Status**: ☐ Pass / ☐ Fail

#### Test 8c: File Over 5 MB (Should Reject)
1. [ ] Create a text file over 5 MB (e.g., 5.5 MB or 10 MB)
2. [ ] Try to upload it
3. [ ] **Expected**: Red error message shows:
   - [ ] `"File size exceeds 5 MB limit. Your file is X.XX MB"`
   - [ ] File is rejected
   - [ ] No upload attempt made

**Status**: ☐ Pass / ☐ Fail
**Error Message**: 

---

### Test 9: Empty File Handling
**Goal**: Verify empty files are handled gracefully

1. [ ] Create an empty `.txt` file (0 bytes)
2. [ ] Try to upload it
3. [ ] **Expected**: 
   - [ ] Error from backend (400 Bad Request)
   - [ ] Error message displays: "Empty file" or similar
   - [ ] No resume created

**Status**: ☐ Pass / ☐ Fail
**Error Message**: 

---

### Test 10: Empty Title Validation
**Goal**: Verify title is required

1. [ ] On `/resumes/new` with title field empty
2. [ ] Enter text in textarea (Paste Text method)
3. [ ] Click "✓ Create Resume"
4. [ ] **Expected**: Error message: `"Please enter a resume title"`
5. [ ] Form does NOT submit

6. [ ] Try same with Upload File method (select file but no title)
7. [ ] Click "✓ Upload & Create Resume"
8. [ ] **Expected**: Same error message

**Status**: ☐ Pass / ☐ Fail

---

### Test 11: Empty Content Validation
**Goal**: Verify content is required

1. [ ] Enter title: `"Test Resume"`
2. [ ] Leave textarea empty (Paste Text method)
3. [ ] Click "✓ Create Resume"
4. [ ] **Expected**: Error message: `"Please paste resume content"`
5. [ ] Form does NOT submit

**Status**: ☐ Pass / ☐ Fail

---

### Test 12: Error Recovery
**Goal**: Verify user can recover from errors

1. [ ] Select an invalid file type
2. [ ] See error message
3. [ ] [Error message should clear if user selects a valid file]
4. [ ] Select a valid file
5. [ ] **Verify**: 
   - [ ] Error message clears automatically
   - [ ] New file is accepted
   - [ ] Can proceed with upload

**Status**: ☐ Pass / ☐ Fail
**Notes**: 

---

### Test 13: Dark Mode Toggle
**Goal**: Verify dark mode works on upload page

1. [ ] On `/resumes/new`
2. [ ] Click theme toggle button in navbar (☀️ or 🌙)
3. [ ] **Verify in Dark Mode**:
   - [ ] Background is dark (slate-950)
   - [ ] Text is light (readable)
   - [ ] Input fields have dark styling
   - [ ] Buttons are visible and styled
   - [ ] Upload zone has dark background
   - [ ] Error messages readable
   - [ ] All contrast is adequate (WCAG AA)

4. [ ] Toggle back to Light Mode
5. [ ] **Verify** all elements return to light styling

**Status**: ☐ Pass / ☐ Fail
**Dark Mode Issues**: 

---

### Test 14: Logout and Re-login
**Goal**: Verify authentication persists correctly

1. [ ] Navigate to `/resumes/new`
2. [ ] Logout (click Profile → Logout or similar)
3. [ ] **Expected**: Redirects to login page
4. [ ] Login again with same credentials
5. [ ] Navigate back to `/resumes/new`
6. [ ] **Expected**: Page loads successfully (still authenticated)
7. [ ] Try to upload a resume
8. [ ] **Expected**: Succeeds and creates resume

**Status**: ☐ Pass / ☐ Fail
**Notes**: 

---

### Test 15: Browser Responsiveness
**Goal**: Verify UI is responsive on different screen sizes

1. [ ] On `/resumes/new` page
2. [ ] Open browser DevTools (F12)
3. [ ] Toggle device toolbar (Ctrl+Shift+M)

#### Mobile (375px)
- [ ] Upload zone fits on screen
- [ ] Title input readable and clickable
- [ ] Buttons properly sized (44+px touch targets)
- [ ] No horizontal scrolling
- [ ] File input zone responsive

**Status**: ☐ Pass / ☐ Fail

#### Tablet (768px)
- [ ] Layout adapts well
- [ ] All elements accessible
- [ ] Two-column layouts if applicable

**Status**: ☐ Pass / ☐ Fail

#### Desktop (1920px)
- [ ] Full layout displays correctly
- [ ] Content not too wide
- [ ] Centered appropriately

**Status**: ☐ Pass / ☐ Fail

---

### Test 16: Console Errors Check
**Goal**: Verify no errors in browser console

1. [ ] Throughout all tests above, monitor browser console (F12 → Console tab)
2. [ ] After each action, check for:
   - [ ] Any red error messages
   - [ ] TypeScript errors
   - [ ] Network request failures (check Network tab)
   - [ ] XSS warnings
   - [ ] CORS errors

3. [ ] **Expected**: Only pre-existing warnings (if any), zero new errors

**Console Status**: ☐ Clean / ☐ Errors Found

**Pre-existing Issues**: 
```
(List any known issues that are expected)
```

**New Issues Found**: 
```
(List any new issues discovered)
```

---

### Test 17: Network Requests Check
**Goal**: Verify API calls are correct

1. [ ] Open Dev Tools → Network tab
2. [ ] On `/resumes/new`, upload a resume
3. [ ] Monitor network requests
4. [ ] **Verify**:
   - [ ] POST request to `/api/v1/resumes/upload-file` (for file upload)
   - [ ] POST request to `/api/v1/resumes/upload` (for text paste)
   - [ ] Authorization header: `Authorization: Bearer <token>`
   - [ ] Status: 200 or 201 (success)
   - [ ] Response contains:
     ```json
     {
       "resume_id": "uuid",
       "filename": "resume.pdf",
       "parsed": {
         "name": null,
         "email": null,
         "skills": [],
         "experience_text": "..."
       }
     }
     ```

**Status**: ☐ Pass / ☐ Fail
**Request Details**: 

---

## Summary Results

| Test | Status | Notes |
|------|--------|-------|
| 1. Page Load | ☐ | |
| 2. Paste Text Flow | ☐ | |
| 3. Method Toggle | ☐ | |
| 4. TXT File Upload | ☐ | |
| 5. PDF File Upload | ☐ | |
| 6. DOCX File Upload | ☐ | |
| 7. Invalid Type Rejection | ☐ | |
| 8. File Size Validation | ☐ | |
| 9. Empty File Handling | ☐ | |
| 10. Title Validation | ☐ | |
| 11. Content Validation | ☐ | |
| 12. Error Recovery | ☐ | |
| 13. Dark Mode | ☐ | |
| 14. Auth Persistence | ☐ | |
| 15. Responsiveness | ☐ | |
| 16. Console Errors | ☐ | |
| 17. Network Requests | ☐ | |

---

## Overall Status

**Date Tested**: ________________  
**Tester Name**: ________________  
**Browser**: ________________  
**OS**: ________________  

**Total Passed**: _____ / 17  
**Total Failed**: _____ / 17  
**Blockers Found**: ☐ Yes ☐ No  

**Recommendation**:
- [ ] ✅ READY FOR DEPLOYMENT
- [ ] ⚠️ FIX CRITICAL ISSUES FIRST
- [ ] ❌ STOP - MAJOR ISSUES FOUND

**Critical Issues Summary**:
```
1. 
2. 
3. 
```

**Additional Notes**:
```
```

---

## How to Use This Guide

1. **Work through tests sequentially** - Each builds on previous ones
2. **Record results** - Check boxes and note any issues
3. **Test in multiple browsers** - At least Chrome and Firefox
4. **Check console frequently** - Monitor for errors throughout
5. **Document issues** - Note exact error messages and reproduction steps
6. **Take screenshots** - If issues found, capture evidence

---

## Contact & Support

If you encounter issues:
1. Check the console for error messages
2. Verify backend is running and responding
3. Check network tab for API response status
4. Create a GitHub issue with:
   - Test description
   - Steps to reproduce
   - Error messages
   - Screenshots
   - Browser/OS info

