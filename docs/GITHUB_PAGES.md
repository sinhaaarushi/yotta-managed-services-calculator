# GitHub Pages setup (ma'am's repo, not your personal site)

## Why your sir said "use a subfolder"

GitHub Pages URLs look like this:

| Setup | Example URL | Whose name shows |
|--------|-------------|------------------|
| **Your personal user site** | `your-name.github.io` | **Yours** |
| **Project site on your account** | `your-name.github.io/calculator` | **Yours** |
| **Project site on ma'am's account** | `maam-name.github.io/calculator` | **Ma'am's** |
| **Calculator as subfolder in ma'am's site repo** | `maam-name.github.io/tools/calculator` | **Ma'am's** |

So the fix is **not** hiding your name in the code — it's **who owns the GitHub repo** and using a **project URL** (`/repo-name/` or `/calculator/`), not your personal `username.github.io` homepage.

---

## Recommended plan

### 1. Ma'am creates the repo (on her GitHub account)

- Example name: `managed-services-calculator` or `cloud-calculator`
- **Public** repo
- She does **not** need to add a README if you're pushing the full project

### 2. Ma'am adds you as collaborator

1. Repo → **Settings** → **Collaborators** → **Add people**
2. Your GitHub username → role **Write** (so you can push code)
3. You accept the invite from your email/GitHub notifications

### 3. You push the project to **her** repo

On your PC (replace placeholders):

```bash
cd path/to/cloud-management-calculator
git init
git add .
git commit -m "Managed services calculator (static GitHub Pages)"
git branch -M main
git remote add origin https://github.com/MAAM_USERNAME/REPO_NAME.git
git push -u origin main
```

### 4. Enable GitHub Pages (ma'am or you, with access)

1. Repo → **Settings** → **Pages**
2. **Build and deployment** → **Source:** `GitHub Actions`
3. After push to `main`, open **Actions** tab — workflow **Deploy to GitHub Pages** should go green

### 5. Live link

```
https://MAAM_USERNAME.github.io/REPO_NAME/
```

Example: `https://yotta-cloud.github.io/managed-services-calculator/`

HTTPS is automatic. No VM or SSL setup needed.

---

## Option B — Calculator inside ma'am's existing website repo (subfolder)

If she already has a site repo (e.g. `company-website`) and wants the calculator at  
`maam.github.io/company-website/calculator/`:

1. Copy everything inside **`public/`** into a folder named **`calculator/`** in that repo:

```
company-website/
  calculator/
    index.html
    css/
    js/
    .nojekyll
  ... other site files ...
```

2. Push to her repo.
3. Pages deploys the **whole repo** (root or `/docs` — whatever she already uses).
4. Calculator URL: `https://MAAM_USERNAME.github.io/REPO_NAME/calculator/`

Relative links (`css/styles.css`, `js/app.js`) already work in a subfolder.

**Do not** use the included GitHub Action in that case — use her existing Pages setup, or ask which folder she uses for Pages.

---

## What to send ma'am

- Link to repo (after push)
- Live calculator URL (after Pages deploy)
- Note: **static site** — no server, no `npm install` needed for the live link

---

## Checklist

- [ ] Repo is under **ma'am's account** (or company org), not only yours
- [ ] You are added as **collaborator**
- [ ] Pages source = **GitHub Actions**
- [ ] Workflow run succeeded (green check in Actions)
- [ ] Open `https://MAAM_USERNAME.github.io/REPO_NAME/` and test **Calculate**

---

## If something breaks on Pages

| Symptom | Fix |
|---------|-----|
| 404 on CSS/JS | Ensure `index.html` uses relative paths (`css/...` not `/css/...`) — already done |
| Calculate works locally but not on Pages | Hard refresh (`Ctrl+F5`); check browser Console for errors |
| Workflow failed | Actions tab → open failed run → read log |
| Wrong name in URL | Repo must be on ma'am's account, not yours |
