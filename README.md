# 🔍 Advanced Plagiarism Detection Suite

<div align="center">

![Plagiarism Checker](https://img.shields.io/badge/Plagiarism-Checker-blue?style=for-the-badge&logo=search&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**🚀 A cutting-edge, AI-powered plagiarism detection platform with advanced text analysis, code similarity checking, and intelligent paraphrasing capabilities.**

[🌟 Features](#-features) • [🛠️ Installation](#️-installation) • [⚙️ Configuration](#️-configuration) • [📖 Usage](#-usage) • [🎨 UI Components](#-ui-components)

</div>

---

## 🌟 Features

### 🔍 **Multi-Modal Plagiarism Detection**
- **📝 Text Plagiarism Checker** - Advanced semantic analysis with AI-powered similarity detection
- **💻 Code Plagiarism Scanner** - GitHub repository scanning with intelligent code comparison
- **📄 Article Plagiarism Analyzer** - Web-based content matching with Tavily API integration
- **🔄 Smart Paraphrasing Tool** - AI-driven text rewriting with multiple style options

### 🎨 **Modern UI/UX**
- **🌙 Dark/Light Theme Toggle** - Seamless theme switching with system preference detection
- **📱 Fully Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **⚡ Real-time Analysis** - Live character counting and instant feedback
- **🎯 Interactive Results** - Enhanced result cards with similarity meters and confidence indicators
- **🔧 Advanced Settings Panel** - Secure API key management with localStorage integration

### 🚀 **Performance & Technology**
- **⚡ Next.js 15 App Router** - Server-side rendering with optimal performance
- **🎨 Shadcn/UI Components** - Beautiful, accessible component library
- **🎭 Tailwind CSS** - Utility-first styling with custom design system
- **🔒 Secure API Integration** - Client-side API key management with validation

---

## 🛠️ Installation

### Prerequisites
- **Node.js** 18.0 or higher
- **npm**, **yarn**, or **pnpm** package manager
- **Git** for version control

### Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/plagiarism-checker-frontend.git
cd plagiarism-checker-frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

### 🌐 Access the Application
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## ⚙️ Configuration

### 🔑 API Keys Setup

The application requires several API keys for full functionality. Configure them through the **Settings Panel** (⚙️ icon in top-right corner):

#### **Required APIs:**

| Service | Purpose | Get API Key | Environment Variable |
|---------|---------|-------------|---------------------|
| 🤖 **OpenRouter** | AI-powered text analysis & paraphrasing | [Get API Key](https://openrouter.ai) | `OPENROUTER_API_KEY` |
| 🐙 **GitHub** | Code repository scanning | [Get Token](https://github.com/settings/tokens) | `GITHUB_TOKEN` |
| 🔍 **Tavily** | Web content search & matching | [Get API Key](https://app.tavily.com/home) | `TAVILY_API_KEY` |

#### **API Key Permissions:**

- **GitHub Token**: Requires `public_repo` access for repository scanning
- **OpenRouter**: Standard API access for text generation models
- **Tavily**: Web search API access for content discovery

### 🔧 Environment Variables (Optional)

Create a `.env.local` file in the root directory:

\`\`\`env
# Optional: Pre-configure API keys (not recommended for production)
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key_here
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
NEXT_PUBLIC_TAVILY_API_KEY=your_tavily_key_here

# Backend API URL (if different from default)
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

---

## 📖 Usage

### 🔍 **Text Plagiarism Detection**

1. **Select Mode**: Click on "Text Checker" tab
2. **Input Text**: Paste or type your content (up to 1,000 words)
3. **Analyze**: Click "Check Plagiarism" button
4. **Review Results**: View similarity percentages and matched sources

### 💻 **Code Plagiarism Scanning**

1. **Select Mode**: Click on "Code Checker" tab
2. **Input Code**: Paste your source code (up to 1,000 words)
3. **Scan Repositories**: Click "Search GitHub Code"
4. **Analyze Matches**: Review similar code snippets with repository links

### 📄 **Article Plagiarism Analysis**

1. **Select Mode**: Click on "Article Text" tab
2. **Input Article**: Enter article content (up to 10,000 words)
3. **Character Limit**: Monitor the character counter (warning at 320/400 chars)
4. **Check Content**: Click "Check Article" button
5. **Review Matches**: View matched content with confidence scores

### 🔄 **AI Paraphrasing Tool**

1. **Input Text**: Enter text you want to paraphrase
2. **Select Style**: Choose paraphrasing style (if available)
3. **Generate**: Click "Paraphrase" button
4. **Review Output**: Compare original and paraphrased versions

---

## 🎨 UI Components

### 🧩 **Component Architecture**

\`\`\`
components/
├── ui/                     # Shadcn/UI Base Components
│   ├── button.tsx         # Customizable button variants
│   ├── card.tsx           # Content container cards
│   ├── dialog.tsx         # Modal dialogs
│   ├── input.tsx          # Form input fields
│   ├── table.tsx          # Data display tables
│   ├── toast.tsx          # Notification toasts
│   └── ...               # 40+ more components
│
├── theme-provider.tsx     # Dark/Light theme management
└── use-toast.ts          # Toast notification hook
\`\`\`

### 🎭 **Design System**

#### **Color Palette**
- **Primary**: Gradient blues and cyans for main actions
- **Secondary**: Neutral grays for backgrounds and text
- **Accent**: Green for success, red for warnings
- **Theme**: Automatic dark/light mode switching

#### **Typography**
- **Headings**: Geist Sans font family
- **Body**: System font stack with fallbacks
- **Code**: Geist Mono for code snippets

#### **Interactive Elements**
- **Hover Effects**: Smooth transitions and color changes
- **Loading States**: Animated spinners and progress indicators
- **Feedback**: Real-time validation and error messages

---

## 🏗️ Project Structure

\`\`\`
FRONTEND/
│
├── app/                        # Next.js App Router (main entry point)
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout (wraps all pages)
│   └── page.tsx                # Homepage
│
├── components/                 # Reusable React components
│   ├── ui/                     # Shadcn/UI components
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   ├── tooltip.tsx
│   │   └── ... (other UI components)
│   │
│   ├── theme-provider.tsx      # Dark/Light theme provider
│   ├── use-toast.ts            # Custom hook for toasts
│   └── ...                     # Other custom components
│
├── src/                        # Legacy React components (CRA style)
│   ├── App.jsx
│   ├── DynamicReport.jsx
│   ├── Paraphraser.jsx
│   ├── index.js
│   ├── App.css
│   ├── index.css
│   ├── Paraphraser.css
│   ├── report.css
│   └── styles/                 # Extra stylesheets
│
├── public/                     # Static assets (images, icons, etc.)
│
├── .next/                      # ⚠️ Build output (generated, ignore in git)
│   ├── cache/
│   ├── server/
│   ├── static/
│   └── ...                     # All compiled files
│
├── node_modules/               # ⚠️ Installed dependencies (ignore in git)
│
├── package.json                # Project metadata + npm scripts
├── package-lock.json           # Lockfile (if using npm)
├── pnpm-lock.yaml              # Lockfile (if using pnpm)
│
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # TailwindCSS configuration
├── postcss.config.mjs          # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
├── next-env.d.ts               # Auto-generated by Next.js
├── components.json             # shadcn/ui config
├── .gitignore                  # Files to ignore in git

\`\`\`

---

## 🚀 Available Scripts

\`\`\`bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Maintenance
npm run clean        # Clean build artifacts
npm audit            # Check for vulnerabilities
npm update           # Update dependencies
\`\`\`

---

## 🔧 Advanced Configuration

### 🎨 **Customizing Themes**

Edit `tailwind.config.ts` to customize the design system:

\`\`\`typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
\`\`\`

### 🔌 **Adding New Components**

Use Shadcn/UI CLI to add new components:

\`\`\`bash
npx shadcn@latest add [component-name]
\`\`\`

### 🌐 **API Integration**

The frontend communicates with the backend through these endpoints:

- `POST /check_text_plagiarism` - Text plagiarism analysis
- `POST /search_github_code` - Code similarity scanning  
- `POST /check_article` - Article plagiarism detection
- `POST /paraphrase` - AI text paraphrasing

---

## 🐛 Troubleshooting

### Common Issues

#### **API Key Errors**
- ✅ Verify API keys are correctly entered in Settings
- ✅ Check API key permissions and quotas
- ✅ Ensure backend server is running

#### **Build Errors**
- ✅ Clear `.next` folder and rebuild
- ✅ Update Node.js to latest LTS version
- ✅ Delete `node_modules` and reinstall

#### **Styling Issues**
- ✅ Check Tailwind CSS configuration
- ✅ Verify CSS import order in `globals.css`
- ✅ Clear browser cache and hard refresh

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| 🌐 Chrome | 90+ | ✅ Fully Supported |
| 🦊 Firefox | 88+ | ✅ Fully Supported |
| 🧭 Safari | 14+ | ✅ Fully Supported |
| 📘 Edge | 90+ | ✅ Fully Supported |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Shadcn/UI** for the beautiful component library
- **Vercel** for Next.js framework and deployment platform
- **Tailwind CSS** for the utility-first CSS framework
- **OpenRouter** for AI model access
- **GitHub** for code repository integration
- **Tavily** for web search capabilities

---

<div align="center">

**Made with ❤️ by the Plagiarism Detection Team**

• [⭐ Star this repo](https://github.com/KOLLIJAYANTHESWAR/plagiarism-checker-frontend) 
• [🐛 Report Bug](https://github.com/KOLLIJAYANTHESWAR/plagiarism-checker-frontend/issues) 
• [💡 Request Feature](https://github.com/KOLLIJAYANTHESWAR/plagiarism-checker-frontend/issues)

</div>
