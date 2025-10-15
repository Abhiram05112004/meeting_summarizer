# How to Push to GitHub

## 📋 Pre-Push Checklist

Before pushing to GitHub, make sure:

- [ ] `.env` file is NOT in the repository (it's in .gitignore)
- [ ] No API keys are hardcoded in any files
- [ ] Database file (`meeting_history.db`) is ignored
- [ ] `node_modules` and `__pycache__` are ignored
- [ ] All test files work correctly

## 🚀 Initial Push (First Time)

### 1. Create GitHub Repository

Go to [GitHub](https://github.com/new) and create a new repository:
- **Name**: `meeting-summarizer` (or your preferred name)
- **Description**: "AI-powered meeting summarizer with transcription and intelligent analysis"
- **Visibility**: Public or Private
- **DO NOT** initialize with README (we already have one)

### 2. Initialize Local Git Repository

```powershell
# Navigate to your project
cd "d:\meeting summary generator"

# Initialize git (if not already done)
git init

# Check git status
git status
```

### 3. Review What Will Be Committed

```powershell
# See what files will be added
git status

# Make sure these are NOT showing (should be ignored):
# - .env
# - meeting_history.db
# - node_modules/
# - __pycache__/
# - uploads/*.mp3
```

### 4. Add Files to Git

```powershell
# Add all files (respecting .gitignore)
git add .

# Check what was staged
git status
```

### 5. Create Initial Commit

```powershell
git commit -m "feat: initial commit - meeting summarizer with AI transcription and analysis"
```

### 6. Add Remote Repository

```powershell
# Replace YOUR_USERNAME and REPO_NAME with your actual GitHub username and repo name
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Verify remote was added
git remote -v
```

### 7. Push to GitHub

```powershell
# Push to main branch
git branch -M main
git push -u origin main
```

## 🔄 Subsequent Pushes

After the initial push, use these commands for updates:

### Check Status
```powershell
git status
```

### Add Changes
```powershell
# Add specific files
git add backend/main.py frontend/src/App.tsx

# Or add all changes
git add .
```

### Commit Changes
```powershell
# Use conventional commit format
git commit -m "feat(backend): add new export endpoint"
git commit -m "fix(frontend): resolve upload button styling"
git commit -m "docs: update README with new features"
```

### Push Changes
```powershell
git push
```

## 🌿 Working with Branches

### Create Feature Branch
```powershell
# Create and switch to new branch
git checkout -b feature/new-export-option

# Make your changes...
git add .
git commit -m "feat: add Excel export functionality"

# Push branch to GitHub
git push -u origin feature/new-export-option
```

### Merge Branch (via Pull Request)
1. Go to GitHub repository
2. Click "Pull Requests"
3. Click "New Pull Request"
4. Select your branch
5. Review changes and create PR
6. Merge when ready

### Switch Back to Main
```powershell
git checkout main
git pull  # Get latest changes
```

## 🔍 Useful Git Commands

### View Commit History
```powershell
git log --oneline
```

### View Changes
```powershell
# View unstaged changes
git diff

# View staged changes
git diff --staged
```

### Undo Changes
```powershell
# Discard changes in working directory
git restore filename.py

# Unstage file
git restore --staged filename.py

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

### Update from Remote
```powershell
# Fetch and merge changes
git pull

# Fetch without merging
git fetch
```

## ⚠️ Important Security Notes

### NEVER Commit These Files:
- `.env` (API keys)
- `meeting_history.db` (database with user data)
- Any files with sensitive information
- Audio files with confidential content

### If You Accidentally Commit Secrets:

1. **Remove from history immediately:**
```powershell
# Remove file from git but keep locally
git rm --cached backend/.env
git commit -m "chore: remove .env from version control"
git push
```

2. **Rotate all API keys** that were exposed

3. **Use BFG Repo-Cleaner** for complete removal:
```powershell
# Download BFG from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

## 📦 Repository Structure After Push

Your GitHub repository will contain:

```
meeting-summarizer/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── main.py
│   ├── summarize.py
│   ├── transcribe.py
│   ├── database.py
│   ├── test_json_parsing.py
│   ├── requirements.txt
│   ├── .env.example
│   └── uploads/
│       └── .gitkeep
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── .gitignore
├── README.md
├── QUICKSTART.md
├── CONTRIBUTING.md
├── LICENSE
└── Documentation files
```

## ✅ Verification

After pushing, verify on GitHub:

1. **Check files are present**: Browse repository
2. **Verify .env is NOT present**: Should not be visible
3. **Check .gitignore is working**: `node_modules`, `__pycache__`, etc. should be absent
4. **README displays correctly**: Should show on repository home page

## 🎉 Success!

Your project is now on GitHub! Share the URL with others:

```
https://github.com/YOUR_USERNAME/REPO_NAME
```

## 📝 Next Steps

1. **Add repository description** on GitHub
2. **Add topics/tags** (python, react, ai, typescript, etc.)
3. **Enable GitHub Pages** for documentation (optional)
4. **Set up GitHub Actions** for CI/CD (optional)
5. **Add contributors** if working in a team
6. **Create releases** when reaching milestones

## 🆘 Troubleshooting

### "Permission denied" error
- Check you're logged into GitHub
- Verify repository URL is correct
- Use SSH instead of HTTPS (or vice versa)

### "Updates were rejected"
```powershell
# Pull remote changes first
git pull --rebase
git push
```

### Large files causing issues
```powershell
# Remove large files from staging
git rm --cached large_file.mp3
git commit -m "chore: remove large file"
```

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**Happy Coding! 🚀**
