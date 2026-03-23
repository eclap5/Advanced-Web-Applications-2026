# Encrypted File Vault - Azure Deployment Guide

## About the Application

Encrypted File Vault is a web application where users can securely upload and manage encrypted files through a browser-based interface.
The backend stores file metadata in PostgreSQL and stores the actual encrypted files in cloud object storage.
Unlike traditional applications that save files directly to a server's local file system, this project uses Azure Blob Storage, which better reflects modern web application architecture by improving scalability, reliability, and deployment flexibility.

## How the Application Works

### 1. Authentication and Onboarding

1. The user registers and logs in.
2. During onboarding, the browser generates a 256-bit AES-GCM key.
3. The key is shown to the user as Base64, and the user must store it safely.
4. The client sends only a SHA-256 fingerprint of that key to the backend.
5. The backend stores the fingerprint in PostgreSQL and never stores the raw encryption key.

### 2. Upload and Encryption Workflow

1. The user loads their Base64 key into the current browser session.
2. When a file is selected, encryption is performed in the browser using AES-GCM and a random 12-byte IV.
3. The client uploads only encrypted bytes to the API, together with metadata:
   - original filename
   - content type
   - file size
   - encryption algorithm
   - encryption IV
   - key fingerprint
4. The API verifies that the provided fingerprint matches the fingerprint saved for the authenticated user.
5. If valid, the encrypted file is stored in Azure Blob Storage and file metadata is stored in PostgreSQL.

### 3. Download and Decryption Workflow

1. The client requests a file download with the user fingerprint in request headers.
2. The API verifies ownership and fingerprint match before returning encrypted content.
3. The API returns encrypted bytes and required metadata (including IV) in response headers.
4. The browser decrypts the file locally with the loaded key and then saves it to disk.

### 4. Deletion Workflow

1. The client sends a delete request with the file ID and key fingerprint.
2. The API verifies fingerprint and user ownership.
3. The file is deleted from Azure Blob Storage.
4. The corresponding metadata record is removed from PostgreSQL.

### 5. Security Model Summary

1. Raw file encryption/decryption keys stay on the client side.
2. The backend stores only fingerprint-based proof, not the actual key.
3. Cloud storage contains encrypted binary data, not plaintext files.
4. If the user loses the key, uploaded files cannot be decrypted.

This guide documents a full manual deployment for the Week 12 project:

- API: containerized backend deployed to Azure Container Apps
- Client: frontend deployed to Azure Static Web Apps
- Data: Azure Database for PostgreSQL Flexible Server
- File storage: Azure Storage Account (Blob container)

The instructions are written for a demo/lab deployment where simplicity and repeatability are prioritized.

## 1. Prerequisites

Before starting, make sure you have:

1. An Azure subscription (for example, Azure for Students).
2. Docker Desktop installed and running.
3. Azure CLI installed.
4. Node.js and npm installed (required for Static Web Apps CLI).
5. Deno installed (used to build the client).
6. pgAdmin 4 installed (or another PostgreSQL client).

## 2. Create Resource Group

1. In Azure Portal, create a new resource group.
2. Choose a clear name, for example: `rg-week12-vault`.
3. Select a European region (recommended: West Europe or Sweden Central).

Important: Use the same region for all resources unless there is a specific reason not to.

## 3. Deploy PostgreSQL Flexible Server

1. Create a new **Azure Database for PostgreSQL Flexible Server** inside the resource group.
2. Use these settings:
   - Subscription: your active subscription.
   - Resource group: the one created in Step 2.
   - Region: same as resource group.
   - PostgreSQL version: 18.
   - Workload type: Dev/Test.
   - Compute tier: free tier if available; otherwise Burstable `B1ms`.
   - Authentication method: PostgreSQL authentication only.
   - Admin login and password: set and store securely.
3. In Networking, allow public access for this demo setup.
4. Create the server and wait until deployment completes.
5. After deployment:
   - Open **Settings -> Networking**.
   - Select **Add current client IP address** and save.
6. Open the **Connect** tab and use the pgAdmin instructions.
7. Connect to the server with pgAdmin and:
   - Create the application database.
   - Run the project `schema.sql` to create required tables.

Note: Public access is acceptable for this course demo, but not recommended for production.

## 4. Deploy Azure Storage Account

1. Create a new Storage Account in the same resource group.
2. Recommended settings:
   - Region: same as PostgreSQL.
   - Performance: Standard.
   - Redundancy: Locally-redundant storage (LRS).
3. Complete **Review + create**.
4. After deployment, open the Storage Account through `Storage browser` and create a Blob container named `encrypted-files`.

## 5. Build and Push API Container Image

### 5.1 Build API Image Locally

From the API project directory, run:

```bash
docker build -t vault-api .
```

### 5.2 Create Azure Container Registry (ACR)

1. Create an ACR resource in the same resource group.
2. Use a globally unique, descriptive name (this becomes part of the registry domain).
3. Select `Basic` SKU.

### 5.3 Push Image to ACR

Run the following commands (replace placeholders):

```bash
az login
az acr login --name <acr-name>
docker tag vault-api <acr-name>.azurecr.io/vault-api:latest
docker push <acr-name>.azurecr.io/vault-api:latest
```

Verify in Azure Portal that the image is visible in the registry repository list.

## 6. Deploy API to Azure Container Apps

1. Create a new Container App.
2. During creation, also create a Container Apps Environment with:
   - Zone redundancy: disabled.
   - Monitoring logs: Don't save logs (for this demo).
3. Configure the Container App:
   - Deployment source: Container image.
   - Region: same as previous resources.
   - Image source: the ACR image `vault-api:latest`.
   - Managed identity: System assigned.
   - Workload profile: Consumption.
   - CPU/Memory: `0.5 CPU`, `1 Gi` memory.
4. Ingress settings:
   - Enable ingress: Yes.
   - External traffic: allowed from anywhere.
   - Transport: Auto.
   - Insecure connections: Disabled.
   - Target port: `8000`.
5. Create the resource.

After initial deployment, the app may fail to start until environment variables are configured.

6. Open **Application -> Containers -> Environment variables**.
7. Add all required API environment variables.
8. Set values using your deployed resources:
   - Database URL from PostgreSQL server details.
   - Storage Account connection string from Storage Account access keys.
   - `ALLOWED_ORIGIN` initially can be `*` (temporary).
9. Save as a new revision and confirm the revision becomes healthy/running.

## 7. Deploy Frontend to Static Web Apps

1. Create an Azure Static Web App.
2. Use `Free` hosting plan.
3. For deployment details, choose `Other` as we will use the manual/SWA CLI flow.
4. Create the resource.

After creation:

5. Copy the Static Web App URL from Overview.
6. Update API Container App environment variable `ALLOWED_ORIGIN` to this exact URL.

### 7.1 Deploy Client with SWA CLI

Install SWA CLI globally:

```bash
npm install -g @azure/static-web-apps-cli
```

From the client project directory:

1. Set API base URL environment variable for the build.
2. Build the client.
3. Deploy using SWA CLI and deployment token.

PowerShell example:

```powershell
$env:VITE_API_BASE_URL="https://<your-container-app-url>"
deno task build
swa deploy ./dist --env production -d <deployment-token>
```

Get the deployment token from Static Web App -> **Manage deployment token**.

Note: SWA CLI may warn about API language/version for this Deno-based project. That warning is expected in this setup.

## 8. Final Verification Checklist

1. Open the Static Web App URL.
2. Confirm the frontend loads correctly.
3. Confirm frontend requests reach the API successfully.
4. Confirm API can read/write to PostgreSQL.
5. Confirm file uploads are written to Blob container `encrypted-files`.

## 9. Notes for Lecturer

1. This deployment is intentionally lightweight and manual for demonstration purposes.
2. Production-grade hardening is not included in this exercise.
3. For production, the following would be required:
   - Private networking (VNet integration/private endpoints).
   - Restricted firewall/IP rules.
   - Managed identities and secret management via Key Vault.
   - Centralized monitoring and logging.
   - CI/CD pipeline (for example, GitHub Actions or Azure DevOps).
	