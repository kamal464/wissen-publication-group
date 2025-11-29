# Install Google Cloud CLI (Optional)

If you want to use gcloud CLI locally, here's how to install it on Windows.

## Installation Options

### Option 1: Using Google Cloud SDK Installer (Easiest)

1. Download the installer:
   - Go to: https://cloud.google.com/sdk/docs/install
   - Click **"Download Google Cloud SDK"**
   - Select **Windows** and download the installer

2. Run the installer:
   - Run the downloaded `.exe` file
   - Follow the installation wizard
   - It will install gcloud CLI automatically

3. Restart PowerShell/Terminal after installation

4. Verify installation:
   ```powershell
   gcloud --version
   ```

### Option 2: Using Chocolatey (If you have it)

```powershell
choco install gcloudsdk
```

### Option 3: Using PowerShell (Manual)

```powershell
# Download and install
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

## After Installation

1. Initialize gcloud:
   ```powershell
   gcloud init
   ```

2. Authenticate:
   ```powershell
   gcloud auth login
   ```

3. Set your project:
   ```powershell
   gcloud config set project wissen-publication-group
   ```

## Note

**You don't need to install gcloud CLI** - you can create repositories via the web console instead (see `CREATE_REPOSITORIES_WEB_CONSOLE.md`).

The workflow will work fine without local gcloud CLI since it runs in GitHub Actions which has gcloud pre-installed.

