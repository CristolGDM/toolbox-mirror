const utils = require ("./utils.js");
const path = require("path");
const fs = require("fs");
const upscaler = require("./upscaler.js");

const screenshotFolder = "E:/Pictures/Screenshots upscaled";

const folders = fs.readdirSync(screenshotFolder).filter(folder => !folder.endsWith("-upscaled") && !folder.endsWith("-toscale"));

mainProcess();

async function mainProcess() {
	for (let i = 0; i < folders.length; i++) {
		const folder = folders[i];
		const files = fs.readdirSync(path.join(screenshotFolder, folder));
		if(!files || !files.length) {
			continue;
		}
		console.log(" ");
		utils.logBlue(utils.separator(18));
		console.log(" ");
		utils.logBlue(`Treating folder /${folder} (${i+1} out of ${folders.length})`)
		console.log(" ");

		await upscaler.upscaleFolder(path.join(screenshotFolder, folder), utils.models.universalSharp, null, 3840);
	}
}