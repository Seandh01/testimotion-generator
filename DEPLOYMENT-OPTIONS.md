# TESTIMOTION Generator - Deployment Options

Choose your preferred hosting platform. Both options are free-tier compatible.

---

## Option 1: Vercel (Recommended - Simplest)

### Features
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Serverless functions for API
- Free tier: 100GB bandwidth/month

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/testimotion-generator.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Set root directory to `generator`
   - Add environment variable: `GEMINI_API_KEY`
   - Click "Deploy"

3. **Get your URL**
   - Your app will be live at `https://your-project.vercel.app`

### Manual CLI Deploy
```bash
cd generator
npm i -g vercel
vercel login
vercel --prod
```

---

## Option 2: Firebase (More Control)

### Features
- Hosting + Cloud Functions
- Firestore database option
- Google authentication ready
- Free tier: 10GB storage, 360MB/day transfer

### Setup

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**
   ```bash
   cd generator
   firebase init
   ```
   Select:
   - Hosting
   - Functions (Node.js)

3. **Deploy**
   ```bash
   firebase deploy
   ```

---

## Comparison Table

| Feature | Vercel | Firebase |
|---------|--------|----------|
| Setup Difficulty | Easy | Medium |
| Serverless Functions | ✅ | ✅ |
| Custom Domain | ✅ Free | ✅ Free |
| SSL/HTTPS | ✅ Auto | ✅ Auto |
| Database | Needs external | Firestore included |
| Free Tier | Generous | Generous |
| Best For | Quick deploy | Full Google ecosystem |

---

## Environment Variables Required

Both platforms need this environment variable:

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `GEMINI_API_KEY` | Google AI API key | [makersuite.google.com](https://makersuite.google.com/app/apikey) |

---

## After Deployment

1. **Test the generator** at your URL
2. **Share with team** - they can bookmark and use immediately
3. **AI features** require the GEMINI_API_KEY to work

### Note on Data Storage

- **Current**: Version history saves to local files (works on Vercel with limitations)
- **For production**: Consider adding a database (Vercel KV, Firebase Firestore, or Supabase)
