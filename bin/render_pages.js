var path = require('path');
var fs = require('fs');
var md = require('markdown').markdown;
var ejs = require('ejs');

var root = path.resolve(__dirname, '../template/');
var layout = fs.readFileSync(path.resolve(__dirname, './layout.html'), 'utf8');

fs.readdir(root, function (err, files) {
  if (err) {
    console.log(err);
    return;
  }
  files.forEach(function (file) {
    var str = fs.readFileSync(path.resolve(root, file), 'utf8');
    var convert = md.toHTML(str);
    var render = ejs.render(layout, {
    	body: convert
    });
    fs.writeFile(path.resolve(root, '../', file.replace('.md', '.html')), render);
  });
});
