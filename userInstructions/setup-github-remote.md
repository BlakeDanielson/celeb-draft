# Set up GitHub Remote and Push

1) Create a new empty repository on GitHub (no README/license).

2) In PowerShell, run from the project root (replace the URL):

```powershell
cd "C:\Users\blake\OneDrive\Desktop\NewProjects\NewDraft"; git init; git add .; git commit -m "docs: add MVP PRD and project docs"; git branch -M main; git remote add origin https://github.com/YOUR_USERNAME/death-draft-mvp.git; git push -u origin main
```

Notes:
- If commit fails due to missing identity, set local config:

```powershell
git config user.name "Your Name"; git config user.email "you@example.com"
```

- Never commit secrets; keep any keys in a `.env` file (not needed yet).


