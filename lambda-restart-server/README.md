# Restart server when the site is down (Lambda + SSM)

This Lambda runs **outside** your app. When the whole site or backend is down, you can still trigger a restart by opening a URL (e.g. from your phone or another device).

## How it works

1. You create a Lambda that calls **AWS Systems Manager (SSM) Send Command** on your EC2 instance.
2. You expose the Lambda via **API Gateway** or **Lambda Function URL**, protected by a secret token.
3. When the site is down, you open that URL (with the token); Lambda sends the restart command to EC2; PM2 restarts the app.

**Requirements:**

- EC2 has **SSM agent** (you already use Session Manager, so this is OK).
- Lambda has an **IAM role** with `ssm:SendCommand` on your instance (or on resource `*`).
- EC2 instance **IAM role** must allow SSM (same as for Session Manager).

---

## 1. Get your EC2 instance ID

In AWS Console: **EC2 → Instances** → copy the **Instance ID** (e.g. `i-016ab2b939f5f7a3b`).

Or CLI:
```bash
aws ec2 describe-instances --query "Reservations[*].Instances[*].[InstanceId,Tags[?Key=='Name'].Value|[0]]" --output table
```

---

## 2. Create a secret token

Generate a long random string (e.g. 32 chars) and save it. You’ll use it in the URL so only you can trigger the restart.

Example (run locally):
```bash
openssl rand -hex 24
```

---

## 3. Create the Lambda function

1. **AWS Console** → **Lambda** → **Create function**.
2. **Name:** e.g. `restart-wissen-server`.
3. **Runtime:** Node.js 18.x (or 20.x).
4. **Execution role:** Create a new role with basic Lambda permissions (you’ll add SSM next).

After creation:

- **Code:** Replace the default handler with the contents of `lambda-restart-server/index.js` (from this repo).
- **Configuration → Environment variables:** Add:
  - `INSTANCE_ID` = your EC2 instance ID (e.g. `i-016ab2b939f5f7a3b`)
  - `RESTART_SECRET` = the secret token you generated
  - (Optional) `APP_DIR` = `/var/www/wissen-publication-group` if different

---

## 4. Give Lambda permission to run SSM

1. **Lambda** → your function → **Configuration** → **Permissions**.
2. Open the **role name** (e.g. `restart-wissen-server-role-xxx`).
3. **Add permissions** → **Attach policies** → **Create policy** (or use inline).

**Inline policy** (attach to the Lambda role):

- **Service:** SSM
- **Actions:** `ssm:SendCommand`
- **Resource:**  
  - Instance: `arn:aws:ec2:REGION:ACCOUNT_ID:instance/INSTANCE_ID`  
  - Document: `arn:aws:ssm:REGION::document/AWS-RunShellScript`

Or use a broader policy for testing (replace `REGION` and `ACCOUNT_ID`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ssm:SendCommand",
      "Resource": [
        "arn:aws:ec2:REGION:ACCOUNT_ID:instance/INSTANCE_ID",
        "arn:aws:ssm:REGION::document/AWS-RunShellScript"
      ]
    }
  ]
}
```

---

## 5. Expose the Lambda via URL

**Option A – Lambda Function URL (simplest)**

1. **Lambda** → your function → **Configuration** → **Function URL** → **Create function URL**.
2. **Auth type:** NONE (we protect with the token in the URL).
3. **CORS:** Enable if you want to call from a browser.
4. Copy the **Function URL** (e.g. `https://xxx.lambda-url.us-east-1.on.aws/`).

Your restart URL is:
```
https://YOUR-FUNCTION-URL?token=YOUR_RESTART_SECRET
```

**Option B – API Gateway HTTP API**

1. **API Gateway** → **Create API** → **HTTP API**.
2. **Integrations** → **Add integration** → **Lambda** → select your restart Lambda.
3. **Routes** → **Add route:** `GET /restart`, integration = your Lambda.
4. **Stages** → copy **Invoke URL**.

Restart URL:
```
https://YOUR-API-ID.execute-api.REGION.amazonaws.com/restart?token=YOUR_RESTART_SECRET
```

---

## 6. Test

- Open the URL in a browser (with the correct `token=`). You should get JSON: `{"success":true,"message":"Restart command sent. ..."}`.
- After a few seconds, check your site; the app should have restarted.

---

## 7. Use when the site is down

- **Bookmark** the restart URL on your phone or browser.
- When the site is down, open the bookmark; the Lambda runs and sends the restart to EC2. Wait ~30 seconds and reload the site.

**Security:** Keep the token secret. Anyone with the URL can restart your server (rate limiting is optional; you can add it in Lambda).

---

## Optional: Show the URL in admin Settings

In your frontend `.env.production` (or deployment env), set:

```bash
NEXT_PUBLIC_RESTART_WHEN_DOWN_URL=https://YOUR-LAMBDA-URL (without ?token=)
```

Then in **Admin → Settings** a box appears: “When the site is down” with the link. Admins should bookmark the **full** URL including the token (e.g. `https://xxx...?token=YOUR_RESTART_SECRET`); the token is not stored in the frontend.
