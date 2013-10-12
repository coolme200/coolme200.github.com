var path = require('path');
var fs = require('fs');
var md = require('marked');
var ejs = require('ejs');

var root = path.resolve(__dirname, '../template/');
var layout = fs.readFileSync(path.resolve(__dirname, './layout.html'), 'utf8');

function processDir(root) {
  fs.readdir(root, function (err, files) {
    if (err) {
      console.log(err);
      return;
    }
    files.forEach(function (file) {
      var filePath = path.resolve(root, file);
      if (fs.statSync(filePath).isDirectory()) {
        var targetPath = path.resolve(root, '../', file);
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath);
        }
        processDir(filePath);
        return;
      }
      var str = fs.readFileSync(filePath, 'utf8');
      var convert = md(str);
      var render = ejs.render(layout, {
      	body: convert
      });
      var lastPath = path.resolve(root, file.replace('.md', '.html')).replace('template/', '');
      fs.writeFile(lastPath, render);
    });
  });
}

processDir(root);

setInterval(function () {
  processDir(root);
}, 1000);