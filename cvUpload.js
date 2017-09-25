const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_DIR = `${process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE}/.credentials/`;
const TOKEN_PATH = `${TOKEN_DIR}drive-nodejs-quickstart.json`;

let mime,localFilePath;

init();

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const auth = new googleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log(`Token stored to ${TOKEN_PATH}`);
}

function init() {

  http.createServer((req, res) => {
    if (req.url == '/cvUpload' && req.method.toLowerCase() == 'post') {
      let form = new formidable.IncomingForm();
      handleUpload(req,res,form, '/var/www/html/cvUpload/',(err,data) => {
        if(!err){
          // Load client secrets from a local file.
          fs.readFile('client_secret.json', function processClientSecrets(err, content) {
            if (err) {
              console.log(`Error loading client secret file: ${err}`);
              return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Drive API.
            authorize(JSON.parse(content), uploadFileToGDrive);
          });
        }
      });
    } else {
      res.writeHead(500, {'Content-Type': 'text/html'});
      res.write('<p>Greska prilikom slanja CV-a, molimo Vas da nas kontaktirate.</p>')
      return res.end();
    }
  })
  .listen(8080);
}


/**
 * Handle CV file upload from form.
 *
 * @param {Object} http request.
 * @param {Object} http response.
 * @param {Object} form data with CV file.
 * @param {string} path where cv will be saved.
 */
function handleUpload(req,res,form,filePath, callback) {
  form.parse(req, (err, fields, files) => {
      console.log(files);
      let fileType = files.upload.type;
      if(fileType == 'application/pdf' || fileType == 'application/msword' || fileType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ){
        mime = fileType;
        let oldpath = files.upload.path;
        let newpath = filePath + files.upload.name;
        localFilePath = newpath;
        fs.rename(oldpath, newpath,(err) => {
          if (err) throw err;
          res.write('CV poslat!');
          res.end();
          return callback(null, 'CV poslat!');
        });
      } else {
        res.writeHead(500, {'Content-Type': 'text/html'});
        res.write('<p>Dozvoljeni formati CV fajla su .pdf, .docx, .doc</p>')
        res.end();
        return callback('Dozvoljeni formati CV fajla su .pdf, .docx, .doc');
      }
    });
}

/**
 * Upload local file to Google Drive.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function uploadFileToGDrive(auth) {
  const drive = google.drive('v3');
  const fileMetadata = {
  'name': localFilePath.split('/')[localFilePath.split('/').length-1]
  };

  const media = {
    mimeType: mime,
    body: fs.createReadStream(localFilePath)
  };

  drive.files.create({
    auth: auth,
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, (err, file) => {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('File Id: ', file.id);
    }
  });
}