var path = require('path');
var fs = require('fs');
var md = require('markdown').markdown;

var root = path.resolve(__dirname, '../template/');

fs.readdir(root, function (err, files) {
	if (err) {
		console.log(err);
		return;
	}
	files.forEach(function (file) {
		var str = fs.readFileSync(path.resolve(root, file), 'utf8');
		var convert = md.toHTML(str);
		fs.writeFile(path.resolve(root, '../', file.replace('.md', '.html')), convert);
	});
});
