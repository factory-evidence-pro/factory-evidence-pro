# 🏭 Factory Evidence Pro

A mobile-first web application for documenting container issues with photo/video evidence, automatically organized in Google Drive.

## Features

- 📸 Capture photos and record videos directly from mobile
- 📁 Auto-organize files in Google Drive by Year → Month → Box Code
- 📊 Maintain consolidated Excel reports with hyperlinks to all media
- 📱 Mobile-first design for factory floor use
- 🔒 Secure submission with validation

## Quick Start

### Prerequisites
- Google Account with Drive access
- Google Apps Script enabled

### Deployment

1. **Google Apps Script Setup**
   - Go to script.google.com
   - Create a new project
   - Copy `backend/google-apps-script/Code.gs`
   - Deploy as Web App
   - Copy the deployment URL

2. **Frontend Setup**
   - Update `config/config.js` with your GAS URL
   - Host files on any static hosting service
   - Or use the included deployment script

3. **Configuration**
   - Set MAIN_FOLDER_ID in Code.gs to your Drive folder
   - Adjust file size limits in config.js if needed

## Project Structure
