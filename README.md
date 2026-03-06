# Coach Website

Static site ready to deploy on Vercel.

## Recheck: Git and npm

- **Git**: Repo is already initialized. One-time: set your identity so you can commit:
  - `git config user.name "Your Name"`
  - `git config user.email "you@example.com"`
  - Then: `git add .` → `git commit -m "Initial commit"` → `git branch -M main`
- **npm / Vercel CLI**: If you just installed Node.js, open a **new terminal** (or restart Cursor) so `npm` is on your PATH. Then `npm i -g vercel` and `vercel` in this folder.

## Deploy on Vercel

### Option A: Deploy from Vercel (recommended)

1. Push this project to GitHub (or GitLab/Bitbucket):
   - Create a new repo on GitHub (no README/license).
   - In this folder (after setting git user and committing):
   - `git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`
   - `git push -u origin main`

2. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).

3. Click **Add New Project** → **Import Git Repository** and select this repo.

4. Configure:
   - **Framework Preset**: Other (static)
   - **Root Directory**: leave blank
   - **Build Command**: leave empty (static site)
   - **Output Directory**: leave blank

5. Click **Deploy**. Your site will be live at `your-project.vercel.app`.

### Option B: Deploy with Vercel CLI

1. Install Node.js if needed, then: `npm i -g vercel`
2. In this folder: `vercel` (log in when prompted)
3. For production: `vercel --prod`

## Project layout

- `index.html` – main page (replace with your content)
- `vercel.json` – SPA-style rewrites so all routes serve `index.html`
- `.gitignore` – ignores `.vercel`, `node_modules`, env files

Replace `index.html` with your Coach website content. For a framework (Next.js, Vite, etc.), add a `package.json` with a `build` script and set the build/output in the Vercel project settings.
