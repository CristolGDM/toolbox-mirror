fs = require("fs");

const foldersLocation = "R:/PCSX2 1.7.0 dev/inis"
const baseName = "Arcana Heart";
const separator = "--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";

const folders = fs.readdirSync(foldersLocation);
// const files = fs.readdirSync(`${foldersLocation}${baseName}`);

const newGS = fs.readFileSync(`${foldersLocation}/${baseName}/GS.ini`, "utf-8");
const newPAD = fs.readFileSync(`${foldersLocation}/${baseName}/PAD.ini`, "utf-8");
const newPSUI = fs.readFileSync(`${foldersLocation}/${baseName}/PCSX2_ui.ini`, "utf-8");
const newPSVM = fs.readFileSync(`${foldersLocation}/${baseName}/PCSX2_vm.ini`, "utf-8");
const newSPU2 = fs.readFileSync(`${foldersLocation}/${baseName}/SPU2.ini`, "utf-8");

folders.forEach((folder) => {
	if(folder === baseName || folder.endsWith(".ini")) {
		return;
	}

	console.log(separator.substr(0, 18));
	console.log(`===> ${folder}`);
	console.log(separator.substr(0, 18));

	fs.writeFileSync(`${foldersLocation}/${folder}/GS.ini`, newGS);
	fs.writeFileSync(`${foldersLocation}/${folder}/PAD.ini`, newPAD);
	fs.writeFileSync(`${foldersLocation}/${folder}/PCSX2_ui.ini`, newPSUI.replace(baseName, folder).replace(baseName, folder));
	fs.writeFileSync(`${foldersLocation}/${folder}/PCSX2_vm.ini`, newPSVM);
	fs.writeFileSync(`${foldersLocation}/${folder}/SPU2.ini`, newSPU2);
	console.log("...done");
});


// console.log(folders);
// console.log(separator.substr(12));
// console.log(files);