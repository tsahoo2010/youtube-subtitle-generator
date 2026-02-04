# GitHub Upload Instructions

## Prerequisites
- Install Git for Windows from: https://git-scm.com/download/win
- Create a GitHub account at: https://github.com if you don't have one

## Step 1: Initialize Git Repository (Run in PowerShell)

```powershell
cd c:\Work\youtube-subtitle-generator
git init
git add .
git commit -m "Initial commit: YouTube subtitle generator with local video playback and multi-language translation"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `youtube-subtitle-generator` (or your preferred name)
3. Description: "YouTube video subtitle generator with local playback, AssemblyAI transcription, and multi-language translation (English, Spanish, Hindi)"
4. Choose: **Public** or **Private**
5. **DO NOT** check "Initialize this repository with a README" (we already have one)
6. Click "Create repository"

## Step 3: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/youtube-subtitle-generator.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

## Step 4: Verify Upload

1. Go to your repository URL: `https://github.com/YOUR_USERNAME/youtube-subtitle-generator`
2. Verify all files are uploaded
3. Check that `.env` file is NOT visible (it should be ignored)
4. Verify `node_modules/` folders are not uploaded

## What Gets Uploaded

✅ **Included:**
- All source code files (.js, .py, .html)
- Documentation (README.md, SETUP.md)
- Configuration templates (.env.example)
- Essential HTML UI files in backend/temp/
- .gitignore files
- package.json files

❌ **Excluded (by .gitignore):**
- node_modules/ (users will run `npm install`)
- .env (contains your API keys - NEVER upload this)
- Temporary video/audio files (.mp4, .mp3, .webm)
- Subtitle files (.vtt)
- Log files

## Alternative: Using GitHub Desktop

If you prefer a GUI:

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Click "Add" → "Add Existing Repository"
4. Select folder: `c:\Work\youtube-subtitle-generator`
5. Commit all changes with message: "Initial commit"
6. Click "Publish repository"
7. Choose repository name and visibility
8. Click "Publish Repository"

## Important Security Note

⚠️ **Your .env file contains sensitive API keys:**
- AssemblyAI API key: `342921a0ea2843d6943a771b7c2e1a30`

This file is already in .gitignore and will NOT be uploaded. Users will need to:
1. Copy `.env.example` to `.env`
2. Add their own API keys

## After Upload

Update your README.md with the GitHub repository URL and add badges if desired:

```markdown
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/YOUR_USERNAME/youtube-subtitle-generator)
```

## Troubleshooting

**If you accidentally committed .env:**
```powershell
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

Then go to GitHub → Repository Settings → Secrets → Regenerate any exposed API keys immediately!
