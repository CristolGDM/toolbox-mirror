const { deleteFolder } = require("./utils.js");

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

const outputDownscale = "E:/Pictures/zzzWallpapers to downscale";
const outputMobileDownscale = "E:/Pictures/zzzWallpapers mobile to downscale";

const forbiddenExtensions = ["mp4", "gif", "mkv", "m4u", "txt", "avi"];

let finalFiles;
let tempFiles;

function fileAlreadyExists(fileName) {
	const fileNameCleaned = utils.getFileNameWithoutExtension(fileName);
	return finalFiles.indexOf(fileNameCleaned) > -1 || tempFiles.indexOf(fileNameCleaned) > -1
}

async function upscale() {
	utils.logLine();
	utils.logYellow("------------------------------------------------------");
	utils.logYellow("Finished sorting, starting upscale");
	utils.logYellow("------------------------------------------------------");
	utils.logLine();

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
	let x = 1;
	const toDownscaleWallpapers = fs.readdirSync(outputDownscale);
	const doneFiles = fs.readdirSync(outputFinal);
	await Promise.all(toDownscaleWallpapers.map(async (file) => {
		try {
			if(doneFiles.indexOf(file) > -1) {
				x++;
				return;
			}
			await sharp(path.join(outputDownscale, file))
			.on("error", (err) => {utils.logRed("on error"); utils.logRed(err)})
			.resize(3840, 2160, {fit: "outside"})
			.toFile(path.join(outputFinal, file))
			.then(() => {
				utils.logYellow(`Desktop ${x+1}/${toDownscaleWallpapers.length}: ${file}`);
				x++;
			});
		} catch (error) {
			utils.logRed("error catch");
			utils.logRed(`Desktop ${x+1}/${toDownscaleWallpapers.length}: ${file}`);
			utils.logRed(error);
		}
	}))
}

async function downscaleMobile() {
	let x = 1;
	const finalMobileWallpapers = fs.readdirSync(outputMobileDownscale);
	const doneFilesMobile = fs.readdirSync(outputMobile);
	await Promise.all(finalMobileWallpapers.map(async (file) => {
		try {
			if(doneFilesMobile.indexOf(file) > -1) {
				x++;
				utils.logBlue("Already exists");
				return;
			}
			await sharp(path.join(outputMobileDownscale, file))
			.on("error", (err) => {utils.logRed("on error"); utils.logRed(err)})
			.resize(1080, 2400, {fit: "outside"})
			.toFile(path.join(outputMobile, file))
			.then(() => {
				utils.logYellow(`Mobile ${x+1}/${finalMobileWallpapers.length}: ${file}`);
				x++;
				return;
			});
		} catch (error) {
			utils.logRed("error catch");
			utils.logRed(`Mobile ${x+1}/${finalMobileWallpapers.length}: ${file}`);
			utils.logRed(error);
		}
	}))
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

function clean() {
	utils.deleteFolder(wallpaperTemp);
	utils.deleteFolder(mobileTemp);
	utils.deleteFolder(outputDownscale);
	utils.deleteFolder(outputMobileDownscale);
}

async function temp() {
	const folder = "E:/Pictures/zzzWallpapers mobile temp-upscaled";
	const files = fs.readdirSync(folder);
	let removed = 0;
	
	await Promise.all(files.map(async (file, index) => {
		const filePath = path.join(folder, file);
			await sharp(filePath)
		  .metadata()
		  .then(({ width, height }) => {
				if((width/4 >= height/3) || (height/4 >= width/3)) {
					console.log(`${index}/${files.length}`);
					return;
				}
				utils.deleteFolder(filePath);
				console.log(`${index}/${files.length} wrong ratio: ${file}`);
				removed++
			})
	}));

	utils.logGreen(`Removed ${removed} files`);
}

exports.sortAll = sortStuff;
exports.upscale = upscale;
exports.downscale = downscale;
exports.clean = clean;
exports.checkDuplicates = checkDuplicates;
exports.temp = temp;