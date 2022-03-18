const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const utils = require("./utils.js");
const upscaler = require("./upscaler.js");

const wallpaperFolder = "E:/Pictures/Wallpapers";
const mobileFolder = "E:/Pictures/Wallpapers mobile";
const imaginaryFolder = "E:/Pictures/Imaginary Network";

const wallpaperTemp = "E:/Pictures/zzzWallpapers temp";
const mobileTemp = "E:/Pictures/zzzWallpapers mobile temp";

const outputFinal = "E:/Pictures/Wallpapers final";
const outputMobile = "E:/Pictures/Wallpapers mobile final";

const wallpaperToUpscale = "E:/Pictures/zzzWallpapers temp-toscale";
const wallpaperToUpscaleMobile = "E:/Pictures/zzzWallpapers mobile temp-toscale";

const wallpaperToConvert = "E:/Pictures/zzzWallpapers temp-upscaled";
const wallpaperToConvertMobile = "E:/Pictures/zzzWallpapers mobile temp-upscaled";

const outputDownscale = "E:/Pictures/zzzWallpapers to downscale";
const outputMobileDownscale = "E:/Pictures/zzzWallpapers mobile to downscale";

const forbiddenExtensions = ["mp4", "gif", "mkv", "m4u", "txt", "avi"];

const knownDupesPath = "E:/Pictures/knownDupes.json";

let finalFiles;
let tempFiles;

function fileAlreadyExists(fileName) {
	const fileNameCleaned = utils.getFileNameWithoutExtension(fileName);
	return finalFiles.indexOf(fileNameCleaned) > -1 || tempFiles.indexOf(fileNameCleaned) > -1
}

async function upscale() {
	await upscaler.upscaleFolder(wallpaperTemp, upscaler.models.uniscaleRestore, outputDownscale, 3840);
	await upscaler.upscaleFolder(mobileTemp, upscaler.models.lollypop, outputMobileDownscale, null, 2400);

	utils.logGreen("________");
	utils.logGreen("Finished upscaling");
};

function checkDuplicates() {
	let duplicates = 0;
	finalFiles = utils.getListOfFilesWithoutExtension(outputFinal).concat(utils.getListOfFilesWithoutExtension(outputMobile));
	tempFiles = utils.getListOfFilesWithoutExtension(wallpaperTemp).concat(utils.getListOfFilesWithoutExtension(mobileTemp));
	
	for (let i = 0; i < tempFiles.length; i++) {
		const element = tempFiles[i];
		if(finalFiles.indexOf(element) > -1) {
			duplicates++
		}
	}

	console.log(`Found ${duplicates} dupes`);

};

async function sortStuff() {
	utils.createFolder(wallpaperTemp);
	utils.createFolder(mobileTemp);
	const imaginaryFolders = fs.readdirSync(imaginaryFolder).filter((folder) => {
		return folder.indexOf(".") === -1 && folder.indexOf("_logs") === -1;
	});
	for (let f = 0; f < imaginaryFolders.length; f++) {
		finalFiles = utils.getListOfFilesWithoutExtension(outputFinal).concat(utils.getListOfFilesWithoutExtension(outputMobile));
		tempFiles = utils.getListOfFilesWithoutExtension(wallpaperTemp).concat(utils.getListOfFilesWithoutExtension(mobileTemp));
		const folder = imaginaryFolders[f];
		const folderLog = `[${f+1}/${imaginaryFolders.length}] ${folder}`;
		if(folder.indexOf(".") > -1 || folder.indexOf("bdfr_logs") > -1|| folder.indexOf("test_logs") > -1) {
			continue;
		}
		
		utils.logLine();
		utils.logBlue("------------------------------------------------------");
		utils.logBlue(`Sorting ${folder} folder...`);
		utils.logBlue("------------------------------------------------------");
		utils.logLine();

		const folderPath = path.join(imaginaryFolder, folder);
		
		const images = fs.readdirSync(folderPath);

		await Promise.all(images.map(async (image, index) => {

			if(image.startsWith("ImaginaryHorrors_")) {
				console.log("don't want those, skipping")
				return;
			}

			if(image.split(".").length === 1) {
				console.log(`=> is a folder, skipping`)
				return;
			}

			if(forbiddenExtensions.some((extension) => {return image.endsWith(extension)})) {
				utils.logYellow("=> wrong file extension, skipping");
				return;
			}

			let imageName = path.join(imaginaryFolder, folder, image);
			if(image.length > 200) {
				utils.logRed(`=> shortening long name`);
				const newImageName = image.substr(0, 100) + image.substr(image.length - 100);
				fs.renameSync(imageName, path.join(imaginaryFolder, folder, newImageName));
				image = newImageName;
				imageName =  path.join(imaginaryFolder, folder, newImageName);
			}

			if(fileAlreadyExists(image)) {
				console.log("=> Already exists, skipping");
				return;
			}

			await sharp(imageName)
				.metadata()
				.then(({ width, height }) => {
					console.log(`${folderLog} - ${index} out of ${images.length}: ${image}`);
					if(width/4 >= height/3) {
						if(width < 1300 || height < 500) {
							console.log("=> too small, skipping");
							return;
						}
						utils.logGreen("=> moving to desktop");
						fs.writeFileSync(path.join(wallpaperTemp, image), fs.readFileSync(path.join(folderPath, image)));
					}
					else if(height/4 >= width/3) {
						if(height < 800 || width < 300) {
							console.log("=> too small, skipping");
							return;
						}
						utils.logGreen("=> moving to mobile");
						fs.writeFileSync(path.join(mobileTemp, image), fs.readFileSync(path.join(folderPath, image)));
					}
					else {
						console.log("=> wrong ratio, skipping");
					}
				}
			)
			.catch((error) => {
				utils.logRed(utils.separator(12));
				utils.logRed("Error happened");
				if(error) {
					utils.logRed(error);
				}
				utils.logRed(utils.separator(12));
				return;
			});;
		}));
	}


	utils.logLine();
	utils.logBlue("------------------------------------------------------");
	utils.logBlue("Sorting mobile folder...");
	utils.logBlue("------------------------------------------------------");
	utils.logLine();

	const imagesMobile = fs.readdirSync(mobileFolder);
	finalFiles = utils.getListOfFilesWithoutExtension(outputFinal).concat(utils.getListOfFilesWithoutExtension(outputMobile));
	tempFiles = utils.getListOfFilesWithoutExtension(wallpaperTemp).concat(utils.getListOfFilesWithoutExtension(mobileTemp));

	await Promise.all(imagesMobile.map(async (image, index) => {

		if(image.startsWith("ImaginaryHorrors_")) {
			console.log("don't want those, skipping")
			return;
		}

		if(image.split(".").length === 1) {
			console.log(`=> is a folder, skipping`)
			return;
		}		

		if(forbiddenExtensions.some((extension) => {return image.endsWith(extension)})) {
			utils.logYellow("=> wrong file extension, skipping");
			return;
		}

		if(fileAlreadyExists(image)) {
			console.log("=> Already exists, skipping");
			return;
		}

		let imageName = `${mobileFolder}/${image}`;
		if(image.length > 200) {
			utils.logRed(`=> shortening long name`);
			const newImageName = image.substr(0, 100) + image.substr(image.length - 100);
			fs.renameSync(imageName, `${mobileFolder}/${newImageName}`);
			image = newImageName;
			imageName = `${mobileFolder}/${newImageName}`;
		}

		await sharp(imageName)
			.metadata()
			.then(({ width, height }) => {
				console.log(`Mobile ${index+1} out of ${imagesMobile.length}: ${image}`);
				if(width/4 >= height/3) {
					if(width < 1300 || height < 500) {
						console.log("=> too small, skipping");
						return;
					}
					utils.logBlue("=> moving to desktop");
					fs.renameSync(path.join(mobileFolder, image), path.join(wallpaperFolder, image));
					return;
				}

				else if(height/4 >= width/3) {
					if(height < 800 || width < 300) {
						console.log("=> too small, skipping");
						return;
					}
					else if(!utils.fileExistsAnyExtension(image, outputMobile)) {
						utils.logGreen("=> doesn't exist, moving to upscale folder");
						fs.writeFileSync(path.join(mobileTemp, image), fs.readFileSync(path.join(mobileFolder, image)));
						return;
					}
				}
			}
		);
		return;
	}));

	utils.logLine();
	utils.logBlue("------------------------------------------------------");
	utils.logBlue("Sorting desktop folder...");
	utils.logBlue("------------------------------------------------------");
	utils.logLine();

	const images = fs.readdirSync(wallpaperFolder);
	finalFiles = utils.getListOfFilesWithoutExtension(outputFinal).concat(utils.getListOfFilesWithoutExtension(outputMobile));
	tempFiles = utils.getListOfFilesWithoutExtension(wallpaperTemp).concat(utils.getListOfFilesWithoutExtension(mobileTemp));

	await Promise.all(images.map(async (image, index) => {

		if(image.startsWith("ImaginaryHorrors_")) {
			console.log("don't want those, skipping")
			return;
		}

		if(image.split(".").length === 1) {
			console.log(`=> is a folder, skipping`)
			return;
		}

		if(forbiddenExtensions.some((extension) => {return image.endsWith(extension)})) {
			utils.logYellow("=> wrong file extension, skipping");
			return;
		}

		if(fileAlreadyExists(image)) {
			console.log("=> Already exists, skipping");
			return;
		}	

		let imageName = `${wallpaperFolder}/${image}`;
		if(image.length > 200) {
			utils.logRed(`=> shortening long name`);
			const newImageName = image.substr(0, 100) + image.substr(image.length - 100);
			fs.renameSync(imageName, `${wallpaperFolder}/${newImageName}`);
			image = newImageName;
			imageName = `${wallpaperFolder}/${newImageName}`;
		}

		await sharp(imageName)
		  .metadata()
		  .then(({ width, height }) => {
				console.log(`Desktop ${index+1} out of ${images.length}: ${image}`);
				if(height/4 >= width/3) {
					if(height < 800 || width < 300) {
						console.log("=> too small, skipping");
						return;
					}
					utils.logBlue("=> moving to mobile");
		  		fs.renameSync(path.join(wallpaperFolder, image), path.join(mobileFolder, image));
					return;
				}

				else if(width/4 >= height/3) {
					if(width < 1300 || height < 500) {
						console.log("=> too small, skipping");
						return;
					}
					else if(!utils.fileExistsAnyExtension(image, outputFinal)) {
						utils.logGreen("=> doesn't exist, moving to upscale folder");
						fs.writeFileSync(path.join(wallpaperTemp, image), fs.readFileSync(path.join(wallpaperFolder, image)));
						return;
					}
				}
	  	}
	  );
		return;		
	}));
	return;
}

async function downscaleDesktop() {
	upscaler.downscaleFolder(outputDownscale, outputFinal, 3840, 2160);
}

async function downscaleMobile() {
	upscaler.downscaleFolder(outputMobileDownscale, outputMobile, 1080, 2400);
}

async function cleanBeforeUpscale() {
	const folders = [
		wallpaperFolder,
		mobileFolder,
		wallpaperTemp,
		mobileTemp,
		wallpaperToUpscale,
		wallpaperToUpscaleMobile,
		wallpaperToConvert,
		wallpaperToConvertMobile,
		outputDownscale,
		outputMobileDownscale
	];

	const knownDupesRaw = fs.readFileSync(knownDupesPath, "utf8");
	const knownDupes = await JSON.parse(knownDupesRaw);

	for (let index = 0; index < folders.length; index++) {
		const folder = folders[index].replace(/\\/g, "/");
		if(!fs.existsSync(folder)) {
			console.log(`${index+1}/${folders.length}: ${folder} doesn't exist`);
			continue;
		}
		const foundDupes = utils.deleteDuplicates(folder);
		foundDupes.map((dupe) => {knownDupes[dupe] = true})
		console.log(`Finished cleaning ${index+1}/${folders.length}`);
		fs.writeFileSync(knownDupesPath, JSON.stringify(knownDupes, null, 2));
	}
}

async function cleanAfterUpscale() {
	const folders = [
		outputFinal,
		outputMobile
	]

	const knownDupesRaw = fs.readFileSync(knownDupesPath, "utf8");
	const knownDupes = await JSON.parse(knownDupesRaw);

	for (let index = 0; index < folders.length; index++) {
		const folder = folders[index].replace(/\\/g, "/");
		if(!fs.existsSync(folder)) {
			console.log(`${index+1}/${folders.length}: ${folder} doesn't exist`);
			continue;
		}
		const foundDupes = utils.deleteDuplicates(folder);
		foundDupes.map((dupe) => {knownDupes[dupe] = true})
		console.log(`Finished cleaning ${index+1}/${folders.length}`);
	}

	fs.writeFileSync(knownDupesPath, JSON.stringify(knownDupes, null, 2));
}

async function downscale() {
	utils.createFolder(outputFinal);
	utils.createFolder(outputMobile);
	downscaleDesktop().then(async () => {
		utils.logLine();
		utils.logGreen(utils.separator(30));
		utils.logGreen("Finished downscaling desktop folder");
		utils.logGreen(utils.separator(30));
		utils.logLine();
		downscaleMobile().then(() => {
			utils.logLine();
			utils.logGreen(utils.separator(30));
			utils.logGreen("Finished downscaling mobile folder");
			utils.logGreen(utils.separator(30));
			utils.logLine();
		});
	});
}

async function convert() {
	upscaler.convertFolderToJpg(wallpaperToConvert, outputDownscale).then(() => {
		upscaler.convertFolderToJpg(wallpaperToConvertMobile, outputMobileDownscale)
	})
}

async function clean() {
	await utils.removesFilesFromAifExistsInB(wallpaperTemp, wallpaperToUpscale);
	await utils.removesFilesFromAifExistsInB(wallpaperToUpscale, wallpaperToConvert);
	await utils.removesFilesFromAifExistsInB(wallpaperToConvert, outputDownscale);
	await utils.removesFilesFromAifExistsInB(outputDownscale, outputFinal);
	
	await utils.removesFilesFromAifExistsInB(mobileTemp, wallpaperToUpscaleMobile);
	await utils.removesFilesFromAifExistsInB(wallpaperToUpscaleMobile, wallpaperToConvertMobile);
	await utils.removesFilesFromAifExistsInB(wallpaperToConvertMobile, outputMobileDownscale);
	await utils.removesFilesFromAifExistsInB(outputMobileDownscale, outputMobile);
}

exports.sortAll = sortStuff;
exports.upscale = upscale;
exports.convert = convert;
exports.downscale = downscale;
exports.clean = clean;
exports.cleanBeforeUpscale = cleanBeforeUpscale;
exports.cleanAfterUpscale = cleanAfterUpscale;
exports.checkDuplicates = checkDuplicates;