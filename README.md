# Bharat News Network (BNN) 📰🇮🇳

Bharat News Network (BNN) is a hyper-local India citizen journalism platform that empowers local citizens, field reporters, and editors across all 28 States and 8 Union Territories to report, publish, verify, and read real-time news breaking at the state and district levels.

---

## 🌐 Live Application Links

- **Shared App Link (Use this for interviews and sharing):**
  [https://ais-pre-mpuiyc6glqo4lsrfrhf64z-145060129690.asia-southeast1.run.app](https://ais-pre-mpuiyc6glqo4lsrfrhf64z-145060129690.asia-southeast1.run.app)

- **Development Live Preview:**
  [https://ais-dev-mpuiyc6glqo4lsrfrhf64z-145060129690.asia-southeast1.run.app](https://ais-dev-mpuiyc6glqo4lsrfrhf64z-145060129690.asia-southeast1.run.app)

---

## 💻 How to Open and Run in VS Code (Visual Studio Code)

### Prerequisites
1. **Node.js** (v18 or higher installed on your computer): [Download Node.js](https://nodejs.org/)
2. **VS Code** (Visual Studio Code): [Download VS Code](https://code.visualstudio.com/)

### Step 1: Open the Project in VS Code
1. Export or download this project workspace as a ZIP or clone the repository to your computer.
2. Open **VS Code**.
3. Go to **File > Open Folder...** and select the root directory of this project (`bharat-news-network`).

### Step 2: Install Dependencies
Open the built-in terminal in VS Code (`Ctrl + ~` or **Terminal > New Terminal**) and run:

```bash
npm install
```

### Step 3: Set Up Environment Variables (Optional for AI features)
Create a `.env` file in the root folder (if not present) and add your Gemini API Key if you wish to run AI features locally:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### Step 4: Start the Local Development Server
In your VS Code terminal, run:

```bash
npm run dev
```

The application will start on **http://localhost:3000**. Open this URL in your web browser to view and present the application locally!

---

## 📁 Project Structure

```text
├── server.ts                   # Express Backend Server (API routes, in-memory store, AI integration)
├── index.html                  # Main HTML entry point
├── package.json                # Project dependencies and scripts
├── vite.config.ts              # Vite bundler configuration
├── tsconfig.json               # TypeScript compiler rules
├── src/
│   ├── main.tsx                # React root entry point
│   ├── App.tsx                 # Core Application logic & state management
│   ├── index.css               # Tailwind CSS styles & custom animations
│   ├── types.ts                # TypeScript interfaces for News, Users, States, Admin Stats
│   ├── data/
│   │   ├── initialNews.ts      # Sample verified Indian news articles across categories
│   │   └── indiaData.ts        # Comprehensive list of Indian States, Districts, & Coordinates
│   └── components/
│       ├── Header.tsx          # Top Navigation Bar with search, state selector, language switcher
│       ├── IndiaMap.tsx        # Interactive SVG map of India with state news counts
│       ├── ArticleCard.tsx     # News Card component with bookmarking, likes, audio TTS
│       ├── NewsDetailModal.tsx # Full Article detail view with audio reader, comments, and sharing
│       ├── LiveTicker.tsx      # Real-time breaking news banner
│       ├── CategoryFilter.tsx # Category selection pills (Politics, Crime, Agriculture, etc.)
│       ├── PublishNewsModal.tsx# Citizen news publishing form with Gemini AI assistance
│       ├── AdminDashboard.tsx  # Admin moderation panel to approve/reject ground reports
│       ├── AuthModal.tsx       # Sign In / Register / Google Auth simulation
│       └── UserProfileModal.tsx# User profile, verified badge, articles & bookmarks manager
└── README.md                   # Setup guide and project overview
```

---

## ✨ Key Features for Interview Demonstration

1. **Multi-lingual Support**: Seamless dynamic switching between English, Hindi (हिंदी), Marathi, Bengali, Tamil, Telugu, and Gujarati.
2. **Interactive SVG India Map**: Geographic news distribution visualization across Indian states.
3. **State & District Filters**: Drill down news from national level to specific state (e.g., Uttar Pradesh) and district (e.g., Varanasi).
4. **Citizen Journalism Submission**: Ground-zero report submission with real-time AI headline generation & fact check score powered by Google Gemini API.
5. **Editorial Moderation Admin Panel**: Dedicated interface for editors to approve or reject ground reports before publishing.
6. **Audio Article Reader (Text-to-Speech)**: Integrated browser voice synthesis for hands-free listening in native accents.
7. **Social Engagement**: Bookmark, like, share on WhatsApp/X, and post citizen comments on news articles.
8. **Dark Mode & Responsive UI**: Clean, accessible design optimized across desktop, tablet, and mobile browsers.

---

## 🚀 Building for Production

To create an optimized production build:

```bash
npm run build
npm start
```
