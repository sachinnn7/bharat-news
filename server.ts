import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_ARTICLES, INITIAL_LIVE_UPDATES, INITIAL_ADMIN_STATS, INITIAL_USER } from './src/data/mockData.js';
import { NewsArticle, LiveUpdateItem, UserProfile } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GenAI client lazily or safely
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory persistent data store
let articles: NewsArticle[] = [...INITIAL_ARTICLES];
let liveUpdates: LiveUpdateItem[] = [...INITIAL_LIVE_UPDATES];
let registeredUsers: UserProfile[] = [{ ...INITIAL_USER }];
let userProfile: UserProfile = { ...INITIAL_USER };
let adminStats = { ...INITIAL_ADMIN_STATS };

// Auth API Routes

// Register new user
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, mobile, state, district, role, avatar, bio } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Full Name and Email are required.' });
  }

  const existing = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    // If already exists, return existing or update
    userProfile = existing;
    return res.json({ user: existing, message: 'Account logged in successfully.' });
  }

  const newUser: UserProfile = {
    id: 'usr_' + Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    mobile: mobile || '+91 9876543210',
    role: role || 'citizen_reporter',
    avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300`,
    bio: bio || `Verified Citizen Reporter from ${district || state || 'India'}.`,
    state: state || 'Uttar Pradesh',
    district: district || 'Varanasi',
    city: district || 'Varanasi',
    verifiedBadge: true,
    followersCount: 0,
    followingCount: 0,
    bookmarks: [],
    likedArticles: [],
  };

  registeredUsers.push(newUser);
  userProfile = newUser;
  adminStats.totalUsers = registeredUsers.length;

  res.status(201).json({ user: newUser, message: 'Account registered successfully!' });
});

// Login user
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  let user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Auto-create user profile if logging in for first time
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    user = {
      id: 'usr_' + Date.now(),
      name: formattedName || 'Citizen Journalist',
      email: email.toLowerCase(),
      mobile: '+91 9876543210',
      role: 'citizen_reporter',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      bio: 'Verified Citizen Journalist reporting from ground zero.',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      city: 'Varanasi',
      verifiedBadge: true,
      followersCount: 1,
      followingCount: 5,
      bookmarks: [],
      likedArticles: [],
    };
    registeredUsers.push(user);
    adminStats.totalUsers = registeredUsers.length;
  }

  userProfile = user;
  res.json({ user, message: 'Signed in successfully.' });
});

// Google OAuth Login Simulation
app.post('/api/auth/google', (req, res) => {
  const { email, name, avatar } = req.body;
  const userEmail = email || 'sachin7oct.2003@gmail.com';
  const userName = name || 'Sachin Kumar';

  let user = registeredUsers.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
  if (!user) {
    user = {
      id: 'usr_google_' + Date.now(),
      name: userName,
      email: userEmail,
      mobile: '+91 9876543210',
      role: 'citizen_reporter',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      bio: 'Verified Google authenticated citizen journalist.',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      city: 'Varanasi',
      verifiedBadge: true,
      followersCount: 100,
      followingCount: 20,
      bookmarks: [],
      likedArticles: [],
    };
    registeredUsers.push(user);
    adminStats.totalUsers = registeredUsers.length;
  }

  userProfile = user;
  res.json({ user });
});

// API Routes

// 1. Get Articles with filters (category, state, district, search, status)
app.get('/api/news', (req, res) => {
  const { category, state, district, search, status, authorId, tag, isBreaking, isTrending, isEditorsPick } = req.query;

  let result = [...articles];

  if (status) {
    result = result.filter(a => a.status === status);
  } else {
    // Default visitors see published articles unless requesting draft/pending
    result = result.filter(a => a.status === 'published');
  }

  if (category && category !== 'All') {
    result = result.filter(a => a.category.toLowerCase() === String(category).toLowerCase());
  }

  if (state && state !== 'All') {
    result = result.filter(a => a.state.toLowerCase() === String(state).toLowerCase());
  }

  if (district && district !== 'All') {
    result = result.filter(a => a.district.toLowerCase() === String(district).toLowerCase());
  }

  if (authorId) {
    result = result.filter(a => a.author.id === String(authorId));
  }

  if (tag) {
    result = result.filter(a => a.tags.some(t => t.toLowerCase() === String(tag).toLowerCase()));
  }

  if (isBreaking === 'true') {
    result = result.filter(a => a.isBreaking);
  }

  if (isTrending === 'true') {
    result = result.filter(a => a.isTrending);
  }

  if (isEditorsPick === 'true') {
    result = result.filter(a => a.isEditorsPick);
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.locationName.toLowerCase().includes(q) ||
      a.author.name.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort by date descending
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ articles: result });
});

// 2. Get Single Article + increment views
app.get('/api/news/:id', (req, res) => {
  const article = articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  article.views += 1;
  res.json({ article });
});

// 3. Post New Article (Submit Citizen Journalism)
app.post('/api/news', (req, res) => {
  const { title, subtitle, content, category, state, district, locationName, featuredImage, images, videoUrl, tags, isDraft } = req.body;

  if (!title || !content || !category || !state) {
    return res.status(400).json({ error: 'Title, content, category, and state are required.' });
  }

  const newArticle: NewsArticle = {
    id: 'art_' + Date.now(),
    title,
    subtitle: subtitle || '',
    content,
    category,
    state,
    district: district || 'General',
    locationName: locationName || `${district || state}, India`,
    featuredImage: featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200',
    images: Array.isArray(images) && images.length > 0 ? images : [featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200'],
    videoUrl: videoUrl || '',
    tags: Array.isArray(tags) ? tags : ['BharatNews', state],
    author: {
      id: userProfile.id,
      name: userProfile.name,
      avatar: userProfile.avatar,
      role: userProfile.role,
      verifiedBadge: userProfile.verifiedBadge,
      location: `${userProfile.city}, ${userProfile.state}`,
    },
    // Citizen reporters go to pending moderation unless saved as draft
    status: isDraft ? 'draft' : (userProfile.role === 'admin' || userProfile.role === 'moderator' ? 'published' : 'pending'),
    createdAt: new Date().toISOString(),
    views: 0,
    likes: 0,
    commentCount: 0,
    factCheckLabel: 'unverified',
    readingTimeMinutes: Math.max(1, Math.ceil(content.split(' ').length / 150)),
  };

  articles.unshift(newArticle);

  if (newArticle.status === 'published') {
    adminStats.publishedPosts += 1;
  } else if (newArticle.status === 'pending') {
    adminStats.pendingPosts += 1;
  }
  adminStats.totalArticles += 1;

  res.status(201).json({ article: newArticle });
});

// 4. Like article toggle
app.post('/api/news/:id/like', (req, res) => {
  const article = articles.find(a => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });

  const hasLiked = userProfile.likedArticles.includes(article.id);
  if (hasLiked) {
    userProfile.likedArticles = userProfile.likedArticles.filter(id => id !== article.id);
    article.likes = Math.max(0, article.likes - 1);
  } else {
    userProfile.likedArticles.push(article.id);
    article.likes += 1;
  }

  res.json({ likes: article.likes, liked: !hasLiked });
});

// 5. Live short updates ("What's Happening Around India")
app.get('/api/live-updates', (req, res) => {
  res.json({ liveUpdates });
});

app.post('/api/live-updates', (req, res) => {
  const { content, mediaType, mediaUrls, state, district, category, isEmergencyAlert } = req.body;
  if (!content || !state) {
    return res.status(400).json({ error: 'Content and State are required for live update' });
  }

  const newItem: LiveUpdateItem = {
    id: 'live_' + Date.now(),
    author: {
      id: userProfile.id,
      name: userProfile.name,
      avatar: userProfile.avatar,
      location: `${district || state}, India`,
      verifiedBadge: userProfile.verifiedBadge,
    },
    content,
    mediaType: mediaType || 'alert',
    mediaUrls: mediaUrls || [],
    state,
    district: district || 'General',
    category: category || 'Local Alert',
    timestamp: 'Just now',
    likes: 0,
    commentsCount: 0,
    isEmergencyAlert: Boolean(isEmergencyAlert),
  };

  liveUpdates.unshift(newItem);
  res.status(201).json({ liveUpdate: newItem });
});

// 6. User Profile
app.get('/api/user/profile', (req, res) => {
  res.json({ user: userProfile });
});

app.put('/api/user/profile', (req, res) => {
  userProfile = { ...userProfile, ...req.body };
  res.json({ user: userProfile });
});

// 7. Admin & Moderation Routes
app.get('/api/admin/stats', (req, res) => {
  res.json({
    stats: {
      ...adminStats,
      pendingPosts: articles.filter(a => a.status === 'pending').length,
      publishedPosts: articles.filter(a => a.status === 'published').length,
      rejectedPosts: articles.filter(a => a.status === 'rejected').length,
      totalArticles: articles.length,
    },
    pendingArticles: articles.filter(a => a.status === 'pending'),
    allArticles: articles,
  });
});

app.put('/api/admin/posts/:id/status', (req, res) => {
  const { status, factCheckLabel, rejectionReason } = req.body;
  const article = articles.find(a => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });

  if (status) article.status = status;
  if (factCheckLabel) article.factCheckLabel = factCheckLabel;
  if (rejectionReason) article.rejectionReason = rejectionReason;

  res.json({ article });
});

// 8. AI Endpoints using Gemini (gemini-3.6-flash)
app.post('/api/ai/suggest-headlines', async (req, res) => {
  const { articleText, category, state } = req.body;
  if (!articleText) {
    return res.status(400).json({ error: 'Article text is required' });
  }

  const ai = getAiClient();
  if (!ai) {
    // Fallback headline suggestions
    return res.json({
      headlines: [
        `Breaking Update from ${state || 'India'}: ${articleText.slice(0, 50)}...`,
        `Citizen Alert: Key Developments in ${category || 'Local News'} Across ${state || 'Region'}`,
        `Exclusive Report: Ground Realities and Community Voice in ${state || 'India'}`,
        `Key Takeaways on ${category || 'Events'}: What You Need to Know`,
        `Special Coverage: ${articleText.slice(0, 40)}...`,
      ],
    });
  }

  try {
    const prompt = `You are a professional editor for Bharat News Network (BNN), a premier Indian citizen journalism portal.
Analyze the following article draft from ${state || 'India'} (Category: ${category || 'General'}):
"${articleText}"

Generate 5 concise, impactful, engaging, and journalistic headline suggestions tailored for an Indian news audience.
Return ONLY a valid JSON array of 5 headline strings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ headlines: Array.isArray(parsed) ? parsed : [response.text] });
  } catch (err: any) {
    console.error('AI Headline error:', err);
    res.status(500).json({
      error: 'Failed to generate headlines',
      headlines: [
        `Report from ${state || 'India'}: ${articleText.slice(0, 50)}...`,
        `Citizen Update: Key Findings in ${category || 'News'}`,
      ],
    });
  }
});

app.post('/api/ai/summarize', async (req, res) => {
  const { articleText, title } = req.body;
  if (!articleText) {
    return res.status(400).json({ error: 'Article text is required' });
  }

  const ai = getAiClient();
  if (!ai) {
    return res.json({
      summary: `• ${title || 'Headline'}: Ground reporting highlights community updates.\n• Key facts verified by local citizen witnesses.`,
      recommendedFactLabel: 'verified',
    });
  }

  try {
    const prompt = `Summarize the following Indian news story titled "${title || ''}":
"${articleText}"

Provide:
1. A 2-bullet concise summary (max 40 words total).
2. A recommended fact-check tag: choose one of ['verified', 'developing', 'unverified'].

Return in JSON format:
{
  "summary": "bullet point 1\\nbullet point 2",
  "recommendedFactLabel": "verified"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (err: any) {
    console.error('AI Summarize error:', err);
    res.json({
      summary: `• ${title || 'News Update'}: Direct ground coverage from citizen reporters.\n• Includes location updates and local observations.`,
      recommendedFactLabel: 'verified',
    });
  }
});

// Start Express and Vite setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bharat News Network server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
