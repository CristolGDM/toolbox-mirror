fs = require("fs");
path = require("path");

const newFoldersLocation = "E:/Pictures/Comics/_SPECIAL_/Drawings";
const oldFoldersLocation = "E:/Pictures/Comics/_SPECIAL_/zzzDrawings";
const separator = "--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";

const folders = fs.readdirSync(oldFoldersLocation);

folders.forEach(async (folder) => {
	const oldFolderPath = `${oldFoldersLocation}/${folder}`;
	const metadata = await JSON.parse(fs.readFileSync(`${oldFolderPath}/metadata.json`));

	if(!metadata) {
		console.error(`Missing metadata for ${folder}`)
		return;
	}

	console.log(metadata.title);

	let shortTitle = metadata.title.replace(/ *\([^)]*\) */g, "").replace(/ *\[[^\]]*]/g, '').replace(/{([^}]+)}/g, '').replace(/\s\s+/g, ' ');

	if(shortTitle.indexOf("|") > -1) {
		shortTitle = shortTitle.split("|")[1];
	}

	let parody = metadata.parody ? `${metadata.parody.join(",")}` : "original";
	if(parody.indexOf("|") > -1) {
		parody = parody.split("|")[0].trim()
	}

	let authors = !metadata.artist ? metadata.group ? metadata.group : ["Unknown"] : metadata.artist.length > 3 ? [metadata.artist[0],metadata.artist[1],metadata.artist[2], "etc"] : metadata.artist;
	authors = authors.map(author => author.split("|")[0]).join(",");
	authors = authors.charAt(0).toUpperCase() + authors.slice(1);

	const id = metadata.URL.split("/").pop();

	let newTitle = `${authors} - ${shortTitle} (${parody}) [${id}]`;

	newTitle = newTitle.replace(/[/\\?%*:|~"<>]/g, '-').replace(/\s\s+/g, ' ').trim();

	const newPath = `${newFoldersLocation}/${newTitle}`;

	if(fs.existsSync(newPath)) {
		return;
	}

	console.log("=>" + newTitle);
	console.log(separator.substr(0, 18));

	fs.mkdirSync(newPath);

	const files = fs.readdirSync(oldFolderPath);

	files.forEach((file) => {
		fs.writeFileSync(path.join(newPath, file), fs.readFileSync(path.join(oldFolderPath, file)))
	});

});