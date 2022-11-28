const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const utils = require("./utils.js");

const outputFinal = "E:/Pictures/Wallpapers final";
const outputFinalDown = "E:/Pictures/Wallpapers final downscaled";
const outputMobile = "E:/Pictures/Wallpapers mobile final";
const outputMobileDown = "E:/Pictures/Wallpapers mobile final downscaled";

utils.createFolder(outputFinalDown);
utils.createFolder(outputMobileDown);

const finalWallpapers = fs.readdirSync(outputFinal);
const doneFiles = fs.readdirSync(outputFinalDown);
const finalMobileWallpapers = fs.readdirSync(outputMobile);
const doneFilesMobile = fs.readdirSync(outputMobileDown);


downscaleDesktop().then(async () => {
	utils.logLine();
	utils.logGreen(utils.separator(30));
	utils.logGreen("Finished downscaling desktop folder");
	utils.logGreen(utils.separator(30));
	utils.logLine();
	await downscaleMobile().then(() => {
		utils.logLine();
		utils.logGreen(utils.separator(30));
		utils.logGreen("Finished downscaling mobile folder");
		utils.logGreen(utils.separator(30));
		utils.logLine();
	});
});

async function downscaleDesktop() {
	let x = 1;
	await Promise.all(finalWallpapers.map(async (file) => {
		try {
			if(doneFiles.indexOf(file) > -1) {
				x++;
				return;
			}
			await sharp(path.join(outputFinal, file))
			.on("error", (err) => {utils.logRed("on error"); utils.logRed(err)})
			.resize(3840, 2160, {fit: "outside"})
			.toFile(path.join(outputFinalDown, file))
			.then(() => {
				utils.logYellow(`Desktop ${x+1}/${finalWallpapers.length}: ${file}`);
				x++;
			});
		} catch (error) {
			utils.logRed("error catch");
			utils.logRed(`Desktop ${x+1}/${finalWallpapers.length}: ${file}`);
			utils.logRed(error);
		}
	}))
}

async function downscaleMobile() {
	let x = 1;
	await Promise.all(finalMobileWallpapers.map(async (file) => {
		try {
			if(doneFilesMobile.indexOf(file) > -1) {
				x++;
			return;
			}
			await sharp(path.join(outputMobile, file))
			.on("error", (err) => {utils.logRed("on error"); utils.logRed(err)})
			.resize(1080, 2400)
			.toFile(path.join(outputMobileDown, file))
			.then(() => {
				utils.logYellow(`Mobile ${x+1}/${finalMobileWallpapers.length}: ${file}`);
				x++;
			});
		} catch (error) {
			utils.logRed("error catch");
			utils.logRed(`Mobile ${x+1}/${finalWallpapers.length}: ${file}`);
			utils.logRed(error);
		}
	}))
}

// async function downscaleFolder(folderPath, desiredWidth, desiredHeight) {
// 	const files = fs.readdirSync(folderPath);
// 	const widthFolder = folderPath.replace(path.dirname(folderPath), path.dirname + "-width");
// 	const heightFolder = folderPath.replace(path.dirname(folderPath), path.dirname + "-height");

// 	utils.createFolder(widthFolder);
// 	utils.createFolder(heightFolder);

// 	let i = 1;
// 	await Promise.all(finalWallpapers.map(async (file) => {
// 		try {
// 			const filePath = path.join(folder, file);
// 			await sharp(filePath)
// 			.metadata()
// 				.then(({ width, height }) => {
// 					if((height/width) === (desiredHeight/desiredWidth)) {
// 						if(height === desiredHeight) {
// 							return;
// 						}
// 						console.log(file);
// 						utils.logGreen("=> moving to height folder");
// 						fs.renameSync(filePath, path.join(heightFolder, file));
// 					} else {
// 						if(width === desiredWidth) {
// 							return;
// 						}
// 						console.log(file);
// 						utils.logGreen("=> moving to width folder");
// 						fs.renameSync(filePath, path.join(widthFolder, file));
// 					}
// 				})
// 				.catch((error) => {
// 					utils.logRed("promise error");
// 					utils.logRed(error);
// 				})
// 		} catch (error) {
// 			utils.logRed("error catch");
// 			utils.logRed(error);
// 		}
// 	}))
// }