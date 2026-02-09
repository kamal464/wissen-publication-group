# Fix "would be overwritten by merge" on server

When `git pull` fails with **local changes** or **untracked files would be overwritten**, the server should accept the latest from GitHub and deploy. Run these **on the server** (copy one line at a time).

---

## Option 1: Reset and pull (discard all local changes)

**WARNING:** This removes local edits on the server. The server should normally just run code from GitHub.

```bash
cd /var/www/wissen-publication-group
git fetch origin
git reset --hard origin/main
git clean -fd
git pull
```

If `git clean -fd` worries you (it removes untracked files), use Option 2 instead.

---

## Option 2: Stash + remove only conflicting untracked files, then pull

```bash
cd /var/www/wissen-publication-group
git stash -u
rm -f .gitattributes SERVER_DOWN_WHY.md check-server-3.85.82.78.sh check-server-setup.sh fix-server-libssl.sh server-recover-pm2.sh
git pull
git stash pop
```

If you don't need the stashed changes, drop them: `git stash drop`.

---

## Option 3: One-liner (reset hard + pull, then deploy)

```bash
cd /var/www/wissen-publication-group && git fetch origin && git reset --hard origin/main && git clean -fd && git pull && ./quick-deploy-on-server.sh
```

---

After a successful pull, run quick deploy if you didn't use Option 3:

```bash
./quick-deploy-on-server.sh
```
