# Run gcloud Commands in CMD (Command Prompt)

Since gcloud works in CMD but not PowerShell, run these commands in **Command Prompt** (CMD):

## Option 1: Run the Script

1. Open **Command Prompt** (CMD) - not PowerShell
2. Navigate to your project:
   ```cmd
   cd C:\Users\kolli\universal-publishers
   ```
3. Run the script:
   ```cmd
   create-repositories.cmd
   ```

## Option 2: Run Commands Manually

Open **Command Prompt** (CMD) and run:

```cmd
REM Set project
gcloud config set project wissen-publication-group

REM Create frontend repository
gcloud artifacts repositories create wissen-frontend --repository-format=docker --location=us-central1 --description="Frontend Docker images"

REM Create backend repository
gcloud artifacts repositories create wissen-api --repository-format=docker --location=us-central1 --description="Backend API Docker images"

REM Verify
gcloud artifacts repositories list --location=us-central1
```

## If You Get Authentication Error

If you see authentication errors, run:
```cmd
gcloud auth login
```

Then try the commands again.

## After Creating Repositories

1. The GitHub Actions workflow will be able to push Docker images
2. Re-run the failed workflow in GitHub Actions
3. Or push a new commit to trigger it

