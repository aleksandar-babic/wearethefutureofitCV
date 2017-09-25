const http = require('http');
const formidable = require('formidable');
const fs = require('fs');

let server = http.createServer((req, res) => {
  if (req.url == '/cvUpload' && req.method.toLowerCase() == 'post') {
    let form = new formidable.IncomingForm();
    handleUpload(req,res,form, '/var/www/html/cvUpload/');
  } else {
    res.writeHead(500, {'Content-Type': 'text/html'});
    res.write('<p>Greska prilikom slanja CV-a, molimo Vas da nas kontaktirate.</p>')
    return res.end();
  }
})
.listen(8080);

function handleUpload(req,res,form,filePath) {
  form.parse(req, (err, fields, files) => {
      console.log(files);
      let fileType = files.upload.type;
      if(fileType == 'application/pdf' || fileType == 'application/msword' || fileType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ){
        let oldpath = files.upload.path;
        let newpath = filePath + files.upload.name;
        fs.rename(oldpath, newpath,(err) => {
          if (err) throw err;
          res.write('CV poslat!');
          res.end();
        });
      } else {
        res.writeHead(500, {'Content-Type': 'text/html'});
        res.write('<p>Dozvoljeni formati CV fajla su .pdf, .docx, .doc</p>')
        res.end();
      }
    });
}