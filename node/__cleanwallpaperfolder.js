const utils = require ("./utils.js");
const path = require("path");
const fs = require("fs");
const upscaler = require("./upscaler.js");

//////////////////////////////////////////////////////////////////////////

const wallpaperFolder = "E:/Pictures/Wallpapers";
const mobileFolder = "E:/Pictures/Wallpapers mobile";
const imaginaryFolder = "E:/Pictures/Imaginary Network";

const wallpaperTemp = "E:/Pictures/zzzWallpapers temp";
const mobileTemp = "E:/Pictures/zzzWallpapers mobile temp";

const toScaleDesktop = "E:/Pictures/zzzWallpapers temp-toscale";
const toScaleMobile = "E:/Pictures/zzzWallpapers mobile temp-toscale";

const toConvertDesktop = "E:/Pictures/zzzWallpapers temp-upscaled";
const toConvertMobile = "E:/Pictures/zzzWallpapers mobile temp-upscaled";

const toDownscaleDesktop = "E:/Pictures/zzzWallpapers to downscale";
const toDownscaleMobile = "E:/Pictures/zzzWallpapers mobile to downscale";

const outputFinal = "E:/Pictures/Wallpapers final";
const outputMobile = "E:/Pictures/Wallpapers mobile final";

cleanToScale();

async function cleanToScale() {
	const filesToScale = fs.readdirSync(toScaleMobile);
	const filesTemp = fs.readdirSync(mobileTemp);
	const filesScaled = utils.getListOfFilesWithoutExtension(toConvertMobile);
	let deletedToScale = 0;
	let deletedTemp = 0;

	filesTemp.forEach(file => {
		if(filesScaled.indexOf(utils.getFileNameWithoutExtension(file)) > -1) {
			utils.deleteFolder(path.join(mobileTemp, file));
			deletedTemp += 1;
		}
	});

	filesToScale.forEach(file => {
		if(filesScaled.indexOf(utils.getFileNameWithoutExtension(file)) > -1) {
			utils.deleteFolder(path.join(toScaleMobile, file));
			deletedToScale += 1;
		}
	});

	utils.logLine();
	console.log(`Deleted ${utils.redString(deletedTemp)} duplicate files from temp folder`);
	console.log(`Deleted ${utils.redString(deletedToScale)} duplicate files from to-scale folder`);
	utils.logLine();
}