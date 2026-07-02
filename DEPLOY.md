# Diabetes Reversal Landing Page — Deployment Guide

## What's in this folder
| File | Purpose |
|------|---------|
| `index.html` | The landing page (this is what Netlify serves). |
| `Code.gs` | Google Apps Script that saves form submissions to your Google Sheet. |
| `netlify.toml` | Optional Netlify config (used only for Git-based deploys). |
| `DEPLOY.md` | This guide. |

---

## ⚠️ Two things you MUST replace before going live
1. **`PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE`** in `index.html` (line ~1056) → your Apps Script `/exec` URL (from Part A).
2. **`91YOURNUMBER`** in `index.html` (4 places) → `91` + your 10-digit WhatsApp number, **digits only, no `+` or spaces**.
   Example: `919876543210`. Also update the visible footer text `+91 YOUR NUMBER`.

   Quick way (macOS Terminal, from this folder):
   ```bash
   sed -i '' 's/91YOURNUMBER/919876543210/g' index.html   # use your real number
   ```

---

## Part A — Google Sheets + Apps Script (lead storage)

1. Go to <https://sheets.google.com> and create a **new blank spreadsheet**. Name it e.g. "Diabetes Leads".
2. In that sheet: **Extensions → Apps Script**.
3. Delete the sample `function myFunction() {}`, then paste in the entire contents of **`Code.gs`**. Click **Save** (💾).
4. Click **Deploy → New deployment**.
5. Click the ⚙️ gear next to "Select type" → choose **Web app**.
6. Set:
   - **Description:** anything (e.g. "Lead capture v1")
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**  ← must be "Anyone", not "Anyone with Google account"
7. Click **Deploy**. Approve the permissions prompt (choose your account → *Advanced* → *Go to project (unsafe)* → *Allow*). This is normal for your own script.
8. Copy the **Web app URL** — it ends in `/exec`. That's your `SCRIPT_URL`.
9. Paste it into `index.html`, replacing `PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE`.
10. Test the endpoint is alive: paste the `/exec` URL into a browser — you should see
    `{"result":"ok","message":"Diabetes Reversal lead endpoint is live."}`.

> The sheet auto-creates a tab called **Leads** with columns:
> **Name · Age · Phone · HbA1c · Duration · Timestamp**.

**If you ever edit `Code.gs` later:** Deploy → *Manage deployments* → edit (✏️) → *Version: New version* → Deploy. (Creating a brand-new deployment gives a new URL you'd have to swap in again.)

---

## Part B — Deploy to Netlify

### Option 1 — Drag & drop (fastest, no account setup)
1. Make sure you've done both replacements above.
2. Go to <https://app.netlify.com/drop>.
3. Drag the **`diabetes-landing` folder** onto the page.
4. Done — you get a live URL like `https://random-name.netlify.app`. Rename it under **Site settings → Change site name**.

### Option 2 — Git + auto-deploy (best for ongoing edits)
1. Put this folder in a GitHub repo (you already have GitHub Desktop installed).
2. In Netlify: **Add new site → Import an existing project → GitHub** → pick the repo.
3. Build command: *(leave blank)*. Publish directory: `.` (or `diabetes-landing` if the repo root is one level up).
4. Deploy. Every `git push` now redeploys automatically.

### Custom domain (optional)
Netlify → **Domain settings → Add a custom domain** → follow the DNS instructions. HTTPS is automatic and free.

---

## Final test checklist (do this on the live URL)
- [ ] Page loads and looks identical to before.
- [ ] Fill the form → click submit → button shows "Submitting…" → **Thank You screen appears**.
- [ ] A new row appears in the Google Sheet with all 6 fields.
- [ ] "Chat with us on WhatsApp" opens WhatsApp with the pre-filled message.
- [ ] Temporarily break `SCRIPT_URL` (add a typo) → submit → **red error message shows and the Thank You screen does NOT appear**. Then restore it.
