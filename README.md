# GitHub Analyzer

<div align="center">

![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)
![GitHub contributors](https://img.shields.io/github/contributors/Jeelislive/Github-Analyzer)
![GitHub stars](https://img.shields.io/github/stars/Jeelislive/Github-Analyzer?style=social)
![GitHub forks](https://img.shields.io/github/forks/Jeelislive/Github-Analyzer?style=social)

**A Next.js application that analyzes GitHub repositories and presents AI-powered insights, architecture visualizations, and project health metrics through a modern dashboard.**

[Features](#features) • [Getting Started](#getting-started) • [Documentation](#how-it-works) • [Contributing](#contributing) • [Community](#community)

</div>

---

## 📸 Screenshots

<div align="center">
  <img src="https://res.cloudinary.com/dupv4u12a/image/upload/v1759304069/Screenshot_from_2025-10-01_13-02-08_afdxk1.png" alt="Dashboard Overview" width="800"/>
  <br/>
  <em>AI-Powered Repository Analysis Dashboard</em>
</div>

<details>
<summary>View More Screenshots</summary>
<br/>
<div align="center">
  <img src="https://res.cloudinary.com/dupv4u12a/image/upload/v1759304086/Screenshot_from_2025-10-01_13-03-07_m74vvw.png" alt="Analytics View" width="800"/>
  <br/>
  <em>Detailed Analytics and Insights</em>
  <br/><br/>
  <img src="https://res.cloudinary.com/dupv4u12a/image/upload/v1758908146/Screenshot_from_2025-09-26_13-49-33_fmn68w.png" alt="Repository Analyzer" width="800"/>
  <br/>
  <em>Repository Analysis Interface</em>
</div>
</details>

---

## ✨ Features

- 🤖 **AI-Powered Insights** - Comprehensive dashboard with Overview, Team, Business, and Recommendations tabs
- 🏗️ **Architecture Visualization** - Mermaid-based diagrams and dependency mapping
- 🔐 **GitHub OAuth** - Secure authentication using NextAuth and Prisma
- 💾 **PostgreSQL Database** - Persistent storage via Prisma ORM
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS and Radix UI
- 📊 **Analytics Dashboard** - Contribution heatmaps, streak tracking, and activity metrics
- 🔄 **Graceful Fallback** - Works with sample data when AI key is not configured

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.x |
| **UI/Styling** | Tailwind CSS, Radix UI, Lucide Icons |
| **Authentication** | NextAuth.js with GitHub Provider |
| **Database** | PostgreSQL, Prisma ORM |
| **Visualization** | Chart.js, D3.js, Mermaid |
| **AI** | Google Generative AI (Gemini) - Optional |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ (recommended 20+)
- npm 9+ or pnpm/yarn
- PostgreSQL 13+
- GitHub OAuth App (Client ID and Secret)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jeelislive/Github-Analyzer.git
   cd Github-Analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:

   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/github_analyzer"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-strong-random-secret"

   # GitHub OAuth (required)
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"

   # Gemini AI (optional)
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Configure GitHub OAuth**
   
   Create a GitHub OAuth App at [GitHub Developer Settings](https://github.com/settings/applications/new):
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
   
   Copy the Client ID and Secret to your `.env.local` file.

5. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 How It Works

1. **Authentication** - Sign in with GitHub using NextAuth (configured in `src/lib/auth.ts`)
2. **Repository Input** - Enter any GitHub repository URL on the homepage
3. **AI Analysis** - The system analyzes code structure, dependencies, and metrics
4. **Visualization** - View insights through an interactive dashboard with multiple tabs:
   - **Overview**: Health scores, metrics, technologies, and project purpose
   - **Team Insights**: Activity and collaboration patterns
   - **Business**: Value and risk analysis
   - **Recommendations**: Automated improvement suggestions

> **Note**: If `GEMINI_API_KEY` is not configured, the app uses fallback data to maintain functionality.

---

## 📂 Project Structure

```text
Github-Analyzer/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   └── sections/           # Landing page sections
│   └── lib/
│       ├── auth.ts             # NextAuth configuration
│       └── prisma.ts           # Prisma client
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── public/                     # Static assets & icons
└── README.md
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint checks |

---

## ❓ Troubleshooting

<details>
<summary><b>Authentication callback error</b></summary>
<br/>
Verify that your GitHub OAuth app callback URL matches <code>http://localhost:3000/api/auth/callback/github</code> and that <code>GITHUB_ID</code> and <code>GITHUB_SECRET</code> are correctly set in <code>.env.local</code>.
</details>

<details>
<summary><b>Database connection issues</b></summary>
<br/>
Check that your <code>DATABASE_URL</code> is correct and PostgreSQL is running. Run <code>npx prisma migrate dev</code> to apply migrations.
</details>

<details>
<summary><b>Missing AI insights</b></summary>
<br/>
The app works without <code>GEMINI_API_KEY</code> using fallback data. To enable AI features, get an API key from <a href="https://makersuite.google.com/app/apikey">Google AI Studio</a>.
</details>

<details>
<summary><b>Build or type errors</b></summary>
<br/>
Run <code>npm run lint</code> and ensure you're using Node.js 18.18+. Try reinstalling dependencies with <code>npm install</code>.
</details>

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - Use our [issue templates](.github/ISSUE_TEMPLATE/)
- ✨ **Suggest Features** - Share your ideas for improvements
- 📝 **Improve Documentation** - Help make our docs better
- 🔧 **Submit Pull Requests** - Fix bugs or add new features

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run `npm run lint` to ensure code quality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Guidelines

- Keep PRs focused on a single feature or fix
- Add tests or sample data where applicable
- Update relevant documentation
- Ensure `npm run lint` passes before submitting
- For major changes (auth, database schema, analysis pipeline), include a migration plan

---

## 👥 Community

<div align="center">

### Join Our Open Source Community! 🌟

We believe in the power of open source and collaborative development. This project thrives because of amazing contributors like you!

[![Contributors](https://img.shields.io/github/contributors/Jeelislive/Github-Analyzer?style=for-the-badge)](https://github.com/Jeelislive/Github-Analyzer/graphs/contributors)
[![Stargazers](https://img.shields.io/github/stars/Jeelislive/Github-Analyzer?style=for-the-badge)](https://github.com/Jeelislive/Github-Analyzer/stargazers)
[![Forks](https://img.shields.io/github/forks/Jeelislive/Github-Analyzer?style=for-the-badge)](https://github.com/Jeelislive/Github-Analyzer/network/members)
[![Issues](https://img.shields.io/github/issues/Jeelislive/Github-Analyzer?style=for-the-badge)](https://github.com/Jeelislive/Github-Analyzer/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Jeelislive/Github-Analyzer?style=for-the-badge)](https://github.com/Jeelislive/Github-Analyzer/pulls)

### 🎉 Thanks to All Contributors

<a href="https://github.com/Jeelislive/Github-Analyzer/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Jeelislive/Github-Analyzer" alt="Contributors" />
</a>

Made with ❤️ by developers, for developers

**[⭐ Star this repo](https://github.com/Jeelislive/Github-Analyzer)** • **[🐛 Report Bug](https://github.com/Jeelislive/Github-Analyzer/issues)** • **[💡 Request Feature](https://github.com/Jeelislive/Github-Analyzer/issues)**

</div>

---

## 🔒 Security

- 🚫 Never commit `.env*` files or secrets to version control
- 🔄 Rotate OAuth credentials immediately if exposed
- 🔐 Use a strong, randomly generated `NEXTAUTH_SECRET` in production
- 📋 Review the [Security Policy](SECURITY.md) for reporting vulnerabilities

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgements

This project is built with amazing open-source technologies:

- [Next.js](https://nextjs.org/) - React framework for production
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Chart.js](https://www.chartjs.org/) - Simple yet flexible charting
- [D3.js](https://d3js.org/) - Data visualization library
- [Mermaid](https://mermaid.js.org/) - Diagram and flowchart generation
- [Google Generative AI](https://ai.google.dev/) - Gemini AI SDK

---

<div align="center">

### Built with 💙 by the open-source community

If you find this project helpful, consider giving it a ⭐!

[![Star History Chart](https://api.star-history.com/svg?repos=Jeelislive/Github-Analyzer&type=Date)](https://star-history.com/#Jeelislive/Github-Analyzer&Date)

</div>
