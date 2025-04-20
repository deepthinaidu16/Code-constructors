
# Resume Job Matching Application

This project is a web application that helps users manage their resumes and find matching job opportunities. It provides features like CV uploading, job matching, cover letter generation, and skill gap analysis.

## Features

- **Resume Management**
  - Upload and store CVs
  - Parse resume data
  - Generate QR codes for easy sharing

- **Job Matching**
  - Automated job matching based on skills and experience
  - Real-time job listings integration
  - Detailed job view with match percentage

- **AI Features**
  - Cover letter generation
  - Skill gap analysis
  - Resume improvement suggestions

## Tech Stack

- **Frontend**
  - React with TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - shadcn/ui for UI components
  - Tanstack Query for data fetching

- **Backend (Supabase)**
  - PostgreSQL database
  - Edge Functions for serverless computing
  - Storage for file management
  - Row Level Security for data protection

## Getting Started

1. **Prerequisites**
   - Node.js (v18 or higher)
   - npm or yarn
   - Supabase account

2. **Installation**
   ```bash
   # Clone the repository
   git clone <your-repo-url>

   # Install dependencies
   npm install

   # Start the development server
   npm run dev
   ```

3. **Environment Setup**
   Create a Supabase project and configure the following:
   - Supabase URL
   - Supabase Anon Key
   - OpenAI API Key (for AI features)

4. **Database Setup**
   The project uses the following main tables:
   - `user_cvs`: Stores user resume information
   - `profiles`: User profile data

## Project Structure

```
/src
  /components
    /resume        # Resume-related components
    /ui           # Reusable UI components
  /integrations   # External service integrations
  /pages         # Application pages
  /utils         # Utility functions
/supabase
  /functions     # Edge Functions
```

## Deployment

1. **Frontend Deployment**
   - The application can be deployed using any static hosting service
   - Configure environment variables for production

2. **Backend Deployment**
   - Supabase handles backend deployment automatically
   - Edge Functions are deployed through Supabase

## API Documentation

### Edge Functions
- `fetch-jobs`: Fetches job listings and matches them with resume data
- `analyze-resume`: Analyzes uploaded resumes for skill extraction
- `generate-cover-letter`: Generates customized cover letters

### Database Schema

Key tables and their purposes:
- `user_cvs`: Stores CV files and parsed data
- `profiles`: User profile information

## Security

- Row Level Security (RLS) policies ensure users can only access their own data
- All API keys and secrets are stored securely in Supabase
- File uploads are validated and secured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License.

