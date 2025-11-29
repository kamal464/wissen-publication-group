# Run These Commands in CMD (One at a Time)

Open **Command Prompt** (CMD) and run each command **separately** (press Enter after each):

## Step 1: Set Project
```cmd
gcloud config set project wissen-publication-group
```

## Step 2: Create Frontend Repository
```cmd
gcloud artifacts repositories create wissen-frontend --repository-format=docker --location=us-central1 --description="Frontend Docker images"
```

## Step 3: Create Backend Repository
```cmd
gcloud artifacts repositories create wissen-api --repository-format=docker --location=us-central1 --description="Backend API Docker images"
```

## Step 4: Verify Repositories
```cmd
gcloud artifacts repositories list --location=us-central1
```

---

## Important Notes

1. **Run each command separately** - don't combine them on one line
2. **Wait for each command to finish** before running the next one
3. **If you see "already exists"** - that's OK, it means the repository was already created
4. **If you see authentication errors** - run `gcloud auth login` first

---

## After Creating Repositories

1. Go to GitHub Actions: https://github.com/kamal464/wissen-publication-group/actions
2. Re-run the failed workflow
3. The deployment should work now! 🎉

