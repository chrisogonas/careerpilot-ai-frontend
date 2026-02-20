# Resume Library Management Documentation

## Overview

The Resume Library Management system allows users to save, organize, edit, and manage multiple resumes within CareerPilot AI. Users can maintain different versions for different job types, create customized resumes for specific applications, and easily switch between versions.

## Features

### Core Features

- **Multiple Resume Management**: Save and organize unlimited resumes
- **Resume Editor**: Professional text editor with live preview
- **Auto-Save**: Automatic saving with timestamp tracking
- **Resume Templates**: Pre-built templates (Chronological, Functional, Combination)
- **File Upload**: Import existing resumes from files
- **Resume Duplication**: Quickly clone resumes with new titles
- **Default Resume**: Set a default resume for quick access
- **Resume Status**: Track resume status (draft, active, archived)
- **Version Tracking**: Monitor resume versions and edits
- **Tailor Tracking**: See how many times each resume was tailored

### User Interface

#### `/resumes` - Resume Library
Central hub for managing all resumes

**Features**:
- Grid view of all resumes with key information
- Card-based layout with resume details
- Quick actions: Edit, Set Default, Delete
- Resume metadata: status, version, tailor count, creation date
- Last used date tracking
- Empty state with tips and quick actions
- Responsive design for mobile and desktop

**Page Elements**:
- Header with "My Resumes" title
- "New Resume" button in header
- Resume cards showing:
  - Title and filename
  - Status badge (Draft, Active, Archived)
  - Version number
  - Tailor count
  - Created date
  - Last used date (if available)
  - Default badge (if applicable)
- Action buttons:
  - Edit → Opens resume editor
  - Set Default → Marks as default resume
  - Delete → Permanently removes resume

#### `/resumes/new` - Create Resume
Multi-option resume creation interface

**Methods**:
1. **Start Blank**: Choose from 3 templates
   - Chronological: Traditional date-ordered format
   - Functional: Skills-focused format
   - Combination: Skills + chronological blend

2. **Paste Content**: Paste existing resume text
   - Perfect for copying from Word docs or PDFs
   - Plain text format recommended

3. **Upload File**: Import from file
   - Supports: .txt, .pdf, .doc, .docx
   - Automatically extracts text content
   - Preserves filename

**Components**:
- Method selector (3 options as buttons)
- Resume title input (required)
- Content area (required)
  - Textarea for manual entry
  - File uploader for imports
  - Template selector for blank resumes
- Live preview panel
- Tips section with best practices
- Create and Cancel buttons

#### `/resumes/[id]/edit` - Resume Editor
Full-featured resume editing interface

**Features**:
- **Split View**: Edit and preview side-by-side
- **Auto-Save**: Saves after 3 seconds of inactivity
- **Manual Save**: Save button for immediate saves
- **Character Count**: Display total characters
- **Last Saved Time**: Shows when resume was last saved
- **Save Status**: Visual feedback on save success
- **Auto-save Toggle**: Enable/disable auto-save
- **Resume Info**: Display version, status, tailor count, dates

**Editor Features**:
- Title field (editable)
- Content textarea with syntax highlighting
- Character counter
- Font: Monospace for consistency

**Preview Panel**:
- Live preview of resume
- Shows title as header
- Displays formatted content
- Updates in real-time

**Metadata Display**:
- Current status (Draft, Active, Archived)
- Version number
- Times tailored
- Creation date

## API Integration

### Types

```typescript
interface Resume {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  content: string;
  file_url?: string;
  is_default: boolean;
  tailor_count: number;
  version: number;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

interface ResumeVersion {
  id: string;
  resume_id: string;
  version_number: number;
  content: string;
  change_summary?: string;
  created_at: string;
}
```

### API Methods

All methods are available through `useAuth()` hook.

#### Get All Resumes
```typescript
const resumes = await getResumes();
// Returns: Resume[]
```

#### Get Single Resume
```typescript
const resume = await getResume(resumeId);
// Returns: Resume
```

#### Create Resume
```typescript
const newResume = await createResume({
  title: "Senior Developer Resume",
  content: "Full resume text...",
  file_name: "senior-dev-resume.txt",
  is_default: false
});
// Returns: Resume
```

#### Update Resume
```typescript
const updated = await updateResume(resumeId, {
  title: "New Title",
  content: "Updated content...",
  status: "active"
});
// Returns: Resume
```

#### Delete Resume
```typescript
await deleteResume(resumeId);
// Returns: void
```

#### Set Default Resume
```typescript
const resume = await setDefaultResume(resumeId);
// Only one resume can be default at a time
// Returns: Resume
```

#### Duplicate Resume
```typescript
const duplicate = await duplicateResume(originalResumeId, "New Title");
// Creates a copy of the resume with new title
// Returns: Resume
```

## Usage Examples

### Fetching Resumes
```typescript
import { useAuth } from '@/lib/context/AuthContext';

export default function MyResumes() {
  const { getResumes } = useAuth();
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    const loadResumes = async () => {
      const data = await getResumes();
      setResumes(data);
    };
    loadResumes();
  }, [getResumes]);

  return (
    <div>
      {resumes.map(resume => (
        <div key={resume.id}>
          <h3>{resume.title}</h3>
          <p>Status: {resume.status}</p>
          <p>Tailored: {resume.tailor_count} times</p>
        </div>
      ))}
    </div>
  );
}
```

### Creating a Resume
```typescript
const { createResume } = useAuth();

const handleCreate = async () => {
  try {
    const newResume = await createResume({
      title: "My Resume",
      content: "John Doe\n\nEXPERIENCE...",
      is_default: true
    });
    navigate(`/resumes/${newResume.id}/edit`);
  } catch (error) {
    console.error('Failed to create resume:', error);
  }
};
```

### Editing a Resume
```typescript
const { updateResume } = useAuth();

const handleSave = async () => {
  try {
    await updateResume(resumeId, {
      title: newTitle,
      content: newContent
    });
    showSuccessMessage('Resume saved!');
  } catch (error) {
    console.error('Failed to save resume:', error);
  }
};
```

## Best Practices

### Resume Content

1. **Formatting**
   - Use simple, clean formatting for ATS compatibility
   - Avoid tables, graphics, or special characters
   - Use standard section headings: EXPERIENCE, EDUCATION, SKILLS
   - Stick to plain text or basic markdown

2. **Content Quality**
   - Start with action verbs: Led, Developed, Implemented
   - Include quantifiable metrics: "Increased sales by 25%"
   - Keep descriptions concise: 3-4 bullet points per role
   - Tailor to job description keywords

3. **Organization**
   - Professional summary or objective (2-3 sentences)
   - Recent experience first (reverse chronological)
   - Include relevant certifications and awards
   - List technical skills prominently

### Resume Management

1. **Naming Conventions**
   - Use clear, descriptive titles
   - Examples: "Senior Dev - TechCorp", "Product Manager Resume"
   - Avoid generic names like "Resume 1"

2. **Version Control**
   - Keep one active/current resume
   - Archive old versions rather than deleting
   - Use meaningful update summaries
   - Track which version was used for which application

3. **Defaults**
   - Always set one resume as default
   - Use default for quick access
   - Update default when applying to most roles
   - Consider role-specific defaults if multiple active resumes

4. **Templates**
   - Chronological: Standard format, works for most
   - Functional: Good for career changers
   - Combination: Best for highlighting both skills and experience

## File Upload

### Supported Formats

- `.txt` - Plain text (recommended)
- `.pdf` - PDF documents
- `.doc` / `.docx` - Microsoft Word
- `.odt` - OpenDocument

### Upload Process

1. Click "Upload File" option on `/resumes/new`
2. Select file from computer
3. Review extracted content in editor
4. Add title and verify formatting
5. Click "Create Resume"

### Tips for Uploading

- PDF files work best if they were saved as text-editable
- Scanned PDFs won't extract properly (use OCR first)
- Word documents preserve basic formatting
- Plain text files are most reliable

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Storage & Limits

- **Max Resumes per Account**: Depends on plan
  - Free: 1 resume
  - Pro: 5 resumes
  - Premium: Unlimited
- **Max Resume Size**: 1MB per resume
- **Max File Upload**: 10MB

## Troubleshooting

### Issue: Resume won't save
**Solution**: Check internet connection, try manual save, check browser console

### Issue: Lost changes after navigation
**Solution**: Enable auto-save, or manually save before leaving

### Issue: File upload failed
**Solution**: Try different format (use .txt), check file size, ensure valid text

### Issue: Duplicate resume doesn't appear
**Solution**: Refresh page, check if quota exceeded

### Issue: Can't set default resume
**Solution**: You can only set one default; unset current default first

## Performance Tips

1. **Editor Performance**
   - Keep resumes under 5000 characters for smooth editing
   - Long resumes may have slight preview lag
   - Auto-save only activates after 3 seconds of inactivity

2. **Library Performance**
   - Loading many resumes (10+) may take a few seconds
   - Resumes load in grid, use search if available

3. **Mobile Performance**
   - Single-column layout on mobile
   - Most features work well on small screens
   - Consider using desktop for extensive editing

## Keyboard Shortcuts

In Resume Editor:
- `Ctrl/Cmd + S` - Manual save
- `Ctrl/Cmd + A` - Select all content
- `Ctrl/Cmd + C` - Copy content
- `Ctrl/Cmd + V` - Paste content

## Related Features

- **Resume Tailoring** (`/tailor`) - Optimize resumes for job descriptions
- **STAR Stories** (`/star-stories`) - Generate interview answers
- **Job Analysis** (`/analyze-job`) - Extract job requirements
- **Cover Letters** (`/cover-letter`) - Generate personalized letters

## Future Enhancements

Planned features for Resume Library:

- [ ] Resume version history with rollback
- [ ] Version comparison tool
- [ ] Export to PDF/Word
- [ ] Resume templates design builder
- [ ] ATS compatibility checker
- [ ] Resume analytics (view how many times downloaded/viewed)
- [ ] Sharing and collaboration
- [ ] Batch operations (delete multiple, export all)
- [ ] Resume sections editor (WYSIWYG)
- [ ] AI-powered resume suggestions
- [ ] Industry-specific templates

## Integration with Other Features

### With Tailor Resume (`/tailor`)
- Select resume before tailoring
- Tailored version creates new resume
- Tailor count tracks in library

### With Job Analysis
- Analyze job description
- Reference in resume editor
- Tailor resume based on analysis

### With Cover Letters
- Use resume as context
- Generate letters for tailored resume
- Track which resume was used

## Support & Help

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [Best Practices](#best-practices)
3. Consult [API Integration](#api-integration) docs
4. Contact support through profile settings

## Changelog

**v1.0.0** - February 20, 2026
- Initial release
- Resume CRUD operations
- Three templates included
- Auto-save functionality
- Resume editor with preview
- Multiple resume management
- File upload support

---

**Last Updated**: February 20, 2026

