    # GitHub Repository Analyzer - Backend Setup Guide

## Features Implemented

### 🔍 Repository Analysis
- **Complete code structure analysis** - Extracts components, functions, classes, hooks
- **Import/export relationship mapping** - Visual component flow tracking
- **Complexity analysis** - Cyclomatic complexity calculation for maintainability
- **Language detection** - Supports TypeScript, JavaScript, Python, Java, and more
- **Dependency analysis** - Analyzes package.json and other dependency files

### 📊 Analytics & Insights
- **Real-time metrics** - Lines of code, file counts, complexity scores
- **Language distribution** - Breakdown by programming languages
- **Component categorization** - React components, hooks, utilities, classes
- **Maintainability index** - Code quality scoring
- **Architecture visualization** - Component relationship diagrams

### 📖 Documentation Generation
- **Auto-generated API docs** - Component interfaces and usage examples
- **Code flow visualization** - Import/export relationship maps
- **Usage examples** - Automatic code snippets for components
- **Architecture insights** - High-level project structure analysis

### 🎨 Advanced UI Features
- **Interactive dashboards** - Repository overview with analytics
- **Component explorer** - Deep dive into individual files and components
- **Search & filtering** - Find components by type, complexity, or name
- **Real-time analysis status** - Live updates during repository processing

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `GITHUB_TOKEN` - GitHub Personal Access Token for API access

**GitHub OAuth (Optional but recommended):**
- `GITHUB_ID` & `GITHUB_SECRET` - GitHub OAuth app credentials

### 2. Database Setup
```bash
# Install dependencies
npm install

# Setup database schema
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 3. GitHub Token Setup
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Create a new token with these scopes:
   - `repo` (for public/private repository access)
   - `read:org` (for organization repositories)
3. Add the token to your `.env` file as `GITHUB_TOKEN`

### 4. Run the Application
```bash
npm run dev
```

## API Endpoints Created

### Analysis
- `POST /api/analyze` - Start repository analysis
- `GET /api/analyze` - Get analysis status and repository list
- `GET /api/analyze?repoId=xxx` - Get specific repository status

### Repository Data
- `GET /api/repos/[repoId]` - Get repository details with optional includes
- `GET /api/repos/[repoId]/architecture` - Get architecture diagram data
- `GET /api/repos/[repoId]/files/[fileId]` - Get file details with relationships

### Analytics & Components
- `GET /api/analytics?repoId=xxx` - Get comprehensive analytics
- `GET /api/components?repoId=xxx` - Search and filter components

## Database Schema

The system uses a comprehensive schema with these main entities:
- **AnalyzedRepo** - Repository metadata and analysis status
- **RepoFile** - Individual file information and content
- **RepoComponent** - Extracted components (React, functions, classes)
- **FileImport** - Import/export relationships between files
- **RepoDependency** - Package dependencies
- **RepoAnalytics** - Calculated metrics and scores
- **RepoDocumentation** - Generated documentation

## Usage Flow

1. **Submit Repository URL** - Enter any GitHub repository URL
2. **Automated Analysis** - System fetches and analyzes all files
3. **Real-time Updates** - Watch analysis progress with live status
4. **Explore Results** - Browse components, architecture, and analytics
5. **Generate Documentation** - Auto-generated API docs and usage guides

## Architecture Highlights

### Code Analysis Engine
- TypeScript/JavaScript AST parsing with Babel and TypeScript compiler
- Component detection (React components, hooks, utilities)
- Complexity calculation using cyclomatic complexity
- Import/export relationship resolution

### Scalable Processing
- Background job processing for large repositories
- Rate limiting compliance with GitHub API
- Efficient database queries with Prisma ORM
- Chunked file processing to prevent timeouts

### Visual Analytics
- Interactive component relationship diagrams
- Language distribution charts
- Complexity heat maps
- Maintainability scoring

The backend is now fully functional and ready to analyze any GitHub repository!