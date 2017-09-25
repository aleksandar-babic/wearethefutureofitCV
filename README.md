# What does this script do?
 It allows you to save files from POST form on your local server and also backup them on Google Drive.
# Get started
### Setup Google Drive API
- Use [this wizard](https://console.developers.google.com/start/api?id=drive) to create or select a project in the Google Developers Console and automatically turn on the API. Click Continue, then Go to credentials.
- On the Add credentials to your project page, click the Cancel button.
- At the top of the page, select the OAuth consent screen tab. Select an Email address, enter a Product name if not already set, and click the Save button.
- Select the Credentials tab, click the Create credentials button and select OAuth client ID.
- Select the application type Other, enter the name "Drive API Quickstart", and click the Create button.
- Click OK to dismiss the resulting dialog.
- Click the file_download (Download JSON) button to the right of the client ID.
- Move this file to your working directory and rename it client_secret.json.

### Install dependencies and start script
```bash
    git clone https://github.com/aleksandar-babic/wearethefutureofitCV.git && cd wearethefutureofitCV
    npm install
    npm start
```
> You can change file destination path on line 98 in cvUpload.js

### Optional
> If you are using NGINX as web server for your app, you can make it to act as reverse proxy on specific url and forward it to this script 
