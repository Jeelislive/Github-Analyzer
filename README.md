# 🚀 GitHub Analyzer

> **Advanced AI-Powered Repository Analysis Platform**

A sophisticated Next.js application that provides deep insights into GitHub repositories through intelligent code analysis, architectural visualization, and AI-powered recommendations.

![GitHub Analyzer Demo](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-06B6D4?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🔍 **Intelligent Code Analysis**
- **Multi-language Support** - Analyze JavaScript, TypeScript, Python, and more
- **Complexity Metrics** - Cyclomatic complexity, maintainability index
- **Dependency Mapping** - Visualize import/export relationships
- **Code Quality Assessment** - Best practices compliance scoring

### 🏗️ **Architecture Visualization**
- **Interactive Mermaid Diagrams** - Professional flowcharts, timelines, and mindmaps
- **D3.js Force Graphs** - Advanced interactive network visualizations
- **Layer-Based Architecture** - Smart component categorization
- **Real-time Updates** - Dynamic diagram generation

### 🤖 **AI-Powered Insights**
- **Google Gemini Integration** - Advanced code analysis and recommendations
- **Architecture Assessment** - Quality scoring and improvement suggestions
- **Pattern Recognition** - Identify anti-patterns and code smells
- **Refactoring Opportunities** - AI-suggested code improvements

### 📊 **Advanced Analytics**
- **Repository Evolution** - Track changes over time
- **Contributor Analytics** - Team collaboration insights
- **Performance Metrics** - Code efficiency measurements
- **Documentation Generation** - Auto-generated project documentation

### 🔐 **Enterprise Security**
- **NextAuth.js Authentication** - Secure user management
- **GitHub OAuth Integration** - Seamless repository access
- **Role-based Access Control** - Team permission management
- **Data Encryption** - Secure data storage with Prisma

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Robust relational database
- **NextAuth.js** - Authentication framework
- **bcryptjs** - Secure password hashing

### Data Visualization
- **Mermaid.js** - Diagram generation
- **D3.js** - Interactive data visualizations
- **Chart.js** - Statistical charts and graphs

### AI & Analytics
- **Google Generative AI** - Advanced language models
- **Babel Parser** - JavaScript/TypeScript AST analysis
- **Web Tree-sitter** - Multi-language parsing
- **Octokit** - GitHub API integration

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database
- **GitHub OAuth App** (for authentication)
- **Google Gemini API** key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/github-analyzer.git
cd github-analyzer
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
```

Configure your `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/github_analyzer"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Additional APIs
OPENAI_API_KEY="your-openai-key"
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

5. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage Guide

### 1. **Authentication**
- Sign in with your GitHub account
- Grant repository access permissions
- Complete profile setup

### 2. **Repository Analysis**
```bash
# Navigate to analyze page
/analyze

# Enter repository URL or select from your repositories
# Choose analysis options:
- Full codebase scan
- Architecture analysis
- AI insights generation
- Documentation preview
```

### 3. **Visualization Options**
- **Mermaid Pro** - Clean, professional diagrams
- **D3 Advanced** - Interactive force-directed graphs
- **Timeline View** - Evolution over time
- **Mindmap** - Hierarchical component structure

### 4. **AI Insights**
- View architecture quality scores
- Get refactoring recommendations
- Identify potential issues
- Export analysis reports

## 🏗️ Project Structure

```
github-analyzer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── analyze/       # Repository analysis endpoints
│   │   │   ├── auth/          # Authentication routes
│   │   │   └── repos/         # Repository management
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   └── repos/             # Repository pages
│   ├── components/            # React components
│   │   ├── sections/          # Page sections
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utility libraries
│   │   ├── analyzers/         # Code analysis engines
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── prisma.ts          # Database client
│   └── types/                 # TypeScript definitions
├── prisma/                    # Database schema & migrations
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🔧 Development

### Code Analysis
The platform uses multiple analysis engines:

```typescript
// Example: Analyzing a TypeScript file
import { EnhancedGitHubAnalyzer } from '@/lib/enhanced-github-analyzer'

const analyzer = new EnhancedGitHubAnalyzer(apiKey)
const results = await analyzer.analyzeRepository(repoUrl, {
  includeAI: true,
  generateDocs: true,
  visualize: true
})
```

### Custom Analyzers
Extend analysis capabilities:

```typescript
// lib/analyzers/custom-analyzer.ts
export class CustomAnalyzer extends BaseAnalyzer {
  analyze(code: string): AnalysisResult {
    // Your custom analysis logic
    return {
      complexity: calculateComplexity(code),
      patterns: identifyPatterns(code),
      suggestions: generateSuggestions(code)
    }
  }
}
```

### Database Schema
Key models in `prisma/schema.prisma`:

```prisma
model Repository {
  id          String   @id @default(cuid())
  name        String
  url         String
  owner       String
  analyses    Analysis[]
  createdAt   DateTime @default(now())
}

model Analysis {
  id           String   @id @default(cuid())
  repositoryId String
  results      Json
  status       String
  createdAt    DateTime @default(now())
}
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker
```bash
# Build image
docker build -t github-analyzer .

# Run container
docker run -p 3000:3000 github-analyzer
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with conventional commits: `git commit -m "feat: add amazing feature"`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Submit a Pull Request

### Code Style
- Follow TypeScript best practices
- Use Prettier for formatting
- Follow conventional commit messages
- Add tests for new features

## 📄 API Reference

### Analysis Endpoints

#### Analyze Repository
```http
POST /api/analyze
Content-Type: application/json

{
  "repoUrl": "https://github.com/owner/repo",
  "options": {
    "includeAI": true,
    "generateDocs": true,
    "depth": "full"
  }
}
```

#### Get Architecture
```http
GET /api/repos/{repoId}/architecture
```

#### Repository Files
```http
GET /api/repos/{repoId}/files/{fileId}
```

## 🛡️ Security

- All data is encrypted in transit and at rest
- GitHub tokens are securely stored and never logged
- AI analysis is performed on sanitized code only
- Rate limiting prevents abuse
- Regular security audits and updates

## 📊 Performance

- **Analysis Speed**: ~10,000 LOC per minute
- **Memory Usage**: Optimized for large repositories
- **Caching**: Intelligent caching reduces repeated analysis
- **Streaming**: Real-time analysis progress updates

## 🎯 Roadmap

### Q1 2025
- [ ] Multi-repository analysis
- [ ] Team collaboration features
- [ ] Advanced AI models integration
- [ ] Mobile-responsive improvements

### Q2 2025
- [ ] VS Code extension
- [ ] CI/CD integrations
- [ ] Custom analysis rules
- [ ] Enterprise SSO support

### Q3 2025
- [ ] Machine learning recommendations
- [ ] Code generation features
- [ ] Advanced visualization options
- [ ] Multi-language documentation

## 🆘 Support

- **Documentation**: [docs.github-analyzer.com](https://docs.github-analyzer.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/github-analyzer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/github-analyzer/discussions)
- **Email**: support@github-analyzer.com

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mermaid.js** - Excellent diagramming library
- **Vercel** - Outstanding deployment platform
- **GitHub** - Powerful API and platform
- **Google** - Advanced AI capabilities
- **Open Source Community** - Inspiration and contributions

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

[Website](https://github-analyzer.com) • [Documentation](https://docs.github-analyzer.com) • [Blog](https://blog.github-analyzer.com)

Made with ❤️ by the GitHub Analyzer Team

</div>
