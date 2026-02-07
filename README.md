# 🏈 Gridiron Strategy

A turn-based American football strategy game built with vanilla HTML, CSS, and JavaScript.

## 🎮 Play the Game

The game is automatically deployed to GitHub Pages whenever you push to the `main` branch!

**Live URL:** `https://YOUR-USERNAME.github.io/football-game/`
(Replace YOUR-USERNAME with your actual GitHub username)

## 🚀 Quick Start Guide

### Step 1: Initial Setup

1. **Open VS Code** in a new folder for your project

2. **Copy all project files** into this folder:
   - `index.html`
   - `styles.css`
   - `game.js`
   - `.github/workflows/deploy.yml`
   - `README.md`

3. **Initialize Git** in VS Code's terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Football game"
   ```

### Step 2: Connect to GitHub

1. **Create a new repository** on GitHub.com:
   - Click the `+` icon → "New repository"
   - Name it `football-game` (or whatever you prefer)
   - Keep it **Public**
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Connect your local project** to GitHub (use the commands GitHub shows you):
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/football-game.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in left sidebar)
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Save the settings

### Step 4: Deploy! 🎉

Your game is now deploying! Check the **Actions** tab to watch it build.

Once the deployment is complete (green checkmark), visit:
`https://YOUR-USERNAME.github.io/football-game/`

## 🛠️ VS Code Setup (First Time)

### Connect Git to VS Code

VS Code has built-in Git support! Here's how to set it up:

1. **Open the Source Control panel** (Ctrl+Shift+G or click the branch icon on left)
2. **Configure Git** (if first time):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Install Git Graph extension** (optional but helpful):
   - Click Extensions icon (or Ctrl+Shift+X)
   - Search "Git Graph"
   - Install it for a visual view of your commits

### Making Changes & Deploying

Every time you make changes:

1. **Edit your files** in VS Code
2. **Test locally** by opening `index.html` in your browser
3. **Commit changes** in VS Code:
   - Click Source Control icon
   - Type a commit message
   - Click the ✓ checkmark
4. **Push to GitHub:**
   - Click the `...` menu → Push
   - Or use terminal: `git push`
5. **Watch it auto-deploy** in the Actions tab!

## 📁 Project Structure

```
football-game/
├── index.html          # Main game page
├── styles.css          # Game styling
├── game.js            # Game logic
├── .github/
│   └── workflows/
│       └── deploy.yml # CI/CD pipeline
└── README.md          # This file
```

## 🎯 Current Features

- Turn-based gameplay
- 6 different play types (runs and passes)
- Realistic football mechanics (downs, yards, touchdowns)
- Visual field representation
- Play-by-play log
- Score tracking

## 🔧 How to Customize

### Change Team Names
Edit `index.html`, lines with class "team-name":
```html
<span class="team-name">Your Team Name</span>
```

### Adjust Play Outcomes
Edit `game.js`, function `calculatePlayResult()` to modify:
- Yard ranges
- Success probabilities
- Play types

### Modify Styling
Edit `styles.css` to change:
- Colors (search for color codes like `#4ade80`)
- Fonts
- Layout

## 🐛 Troubleshooting

**Game not deploying?**
- Check the Actions tab for errors
- Make sure GitHub Pages is enabled
- Verify all files are in your repository

**Can't push to GitHub?**
- Make sure you've set up your Git credentials
- Check you're on the `main` branch: `git branch`
- Try: `git push origin main`

**Game not working locally?**
- Just double-click `index.html` to open in browser
- Check browser console (F12) for errors

## 📚 Next Steps

Ideas to expand your game:
- Add AI opponent
- Implement play animations
- Add more play types
- Create team customization
- Add sound effects
- Track game statistics
- Multiple difficulty levels

## 📝 CI/CD Pipeline Details

Your GitHub Actions workflow automatically:
1. **Validates** all files exist
2. **Checks** HTML, CSS, and JS files
3. **Deploys** to GitHub Pages
4. **Runs** on every push to `main` branch

Check `.github/workflows/deploy.yml` to customize the pipeline!

## 🤝 Contributing

This is your project! Feel free to:
- Add new features
- Fix bugs
- Improve the game mechanics
- Share with friends

---

**Happy coding! 🏈** Any ti me you push changes, they'll automatically deploy to your live game !

