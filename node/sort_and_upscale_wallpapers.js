const { deleteFolder } = require("./utils.js");

const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const utils = require("./utils.js");
const upscaler = require("./upscaler.js");

const wallpaperFolder = "E:/Pictures/Wallpapers";
const mobileFolder = "E:/Pictures/Wallpapers mobile";
const imaginaryFolder = "E:/Pictures/Imaginary Network";

const wallpaperTemp = "E:/Pictures/Wallpapers temp";
const mobileTemp = "E:/Pictures/Wallpapers mobile temp";

const outputFinal = "E:/Pictures/Wallpapers final";
const outputMobile = "E:/Pictures/Wallpapers mobile final";

utils.createFolder(wallpaperTemp);
utils.createFolder(mobileTemp);
utils.createFolder(outputFinal);
utils.createFolder(outputMobile);

const finalFiles = utils.getListOfFilesWithoutExtension(outputFinal).concat(utils.getListOfFilesWithoutExtension(outputMobile));
const tempFiles = utils.getListOfFilesWithoutExtension(wallpaperTemp).concat(utils.getListOfFilesWithoutExtension(mobileTemp));

function fileAlreadyExists(fileName) {
	const fileNameCleaned = utils.getFileNameWithoutExtension(fileName);
	return finalFiles.indexOf(fileNameCleaned) > -1 || tempFiles.indexOf(fileNameCleaned) > -1
}

sortStuff()
	.then(async () => {
		utils.logLine();
		utils.logYellow("------------------------------------------------------");
		utils.logYellow("Finished sorting, starting upscale");
		utils.logYellow("------------------------------------------------------");
		utils.logLine();

		await upscaler.upscaleFolder(wallpaperTemp, upscaler.models.uniscaleRestore, outputFinal, 3840);
		await upscaler.upscaleFolder(mobileTemp, upscaler.models.lollypop, outputMobile, null, 2400);

		// utils.deleteFolder(wallpaperTemp);
		// utils.deleteFolder(mobileTemp);

		utils.logGreen("________");
		utils.logGreen("Finished");
	});

async function sortStuff() {
	return;
	const imaginaryFolders = fs.readdirSync(imaginaryFolder);
	for (let f = 25; f < imaginaryFolders.length; f++) {
		const folder = imaginaryFolders[f];
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

		for (let a = 0; a < images.length; a++) {
			let image = images[a];
			console.log(`${folder} - ${a+1} out of ${images.length}: ${image}`);

			if(image.split(".").length === 1) {
				console.log(`=> is a folder, skipping`)
				continue;
			}

			if(image.endsWith(".mp4") || image.endsWith(".m4a") || image.endsWith(".txt")) {
				console.log("=> wrong file extension, skipping");
				continue;
			}
			
			if(image.split(".").pop() === "gif") {
				console.log(`=> gif, skipping`)
				continue;
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
				continue;
			}

			await sharp(imageName)
				.metadata()
				.then(({ width, height }) => {
					if(width/4 >= height/3) {
						if(width < 1300 || height < 500) {
							console.log("=> too small, skipping");
							return;
						}
						console.log("=> moving to desktop");
						fs.writeFileSync(path.join(wallpaperTemp, image), fs.readFileSync(path.join(folderPath, image)));
					}
					else if(height/4 >= width/3) {
						if(height < 1080 || width < 500) {
							console.log("=> too small, skipping");
							return;
						}
						console.log("=> moving to mobile");
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
		}
	}


	utils.logLine();
	utils.logBlue("------------------------------------------------------");
	utils.logBlue("Sorting mobile folder...");
	utils.logBlue("------------------------------------------------------");
	utils.logLine();

	const imagesMobile = fs.readdirSync(mobileFolder);

	for (let i = 0; i < imagesMobile.length; i++) {
		let image = imagesMobile[i];
		console.log(`Mobile ${i+1} out of ${imagesMobile.length}: ${image}`);

		if(image.split(".").length === 1) {
			console.log(`=> is a folder, skipping`)
			continue;
		}

		if(image.endsWith(".mp4") || image.endsWith(".m4a") || image.endsWith(".txt")) {
			utils.logRed("=> remove wrong file extension");
			fs.rmSync(`${mobileFolder}/${image}`);
			continue;
		}
		
		if(image.split(".").pop() === "gif") {
			console.log(`=> gif, moving to end folder`)
			fs.writeFileSync(path.join(outputMobile, image), fs.readFileSync(path.join(mobileFolder, image)));
			continue;
		}

		if(fileAlreadyExists(image)) {
			console.log("=> Already exists, skipping");
			continue;
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
				if(width > height) {
					console.log("=> moving to desktop");
					fs.renameSync(path.join(mobileFolder, image), path.join(wallpaperFolder, image));
					return;
				}
				else if(!utils.fileExistsAnyExtension(image, outputMobile)) {
					console.log("=> doesn't exist, moving to upscale folder");
					fs.writeFileSync(path.join(mobileTemp, image), fs.readFileSync(path.join(mobileFolder, image)));
					return;
				}
			}
		)
	};

	utils.logLine();
	utils.logBlue("------------------------------------------------------");
	utils.logBlue("Sorting desktop folder...");
	utils.logBlue("------------------------------------------------------");
	utils.logLine();

	const images = fs.readdirSync(wallpaperFolder);

	for (let i = 0; i < images.length; i++) {
		let image = images[i];
		console.log(`Desktop ${i+1} out of ${images.length}: ${image}`);

		if(image.split(".").length === 1) {
			console.log(`=> is a folder, skipping`)
			continue;
		}

		if(image.endsWith(".mp4") || image.endsWith(".m4a") || image.endsWith(".txt")) {
			utils.logRed("=> remove wrong file extension");
			fs.rmSync(`${wallpaperFolder}/${image}`);
			continue;
		}

		if(fileAlreadyExists(image)) {
			console.log("=> Already exists, skipping");
			continue;
		}

		if(image.split(".").pop() === "gif") {
			console.log(`=> gif, moving to end folder`)
			fs.writeFileSync(path.join(outputFinal, image), fs.readFileSync(path.join(wallpaperFolder, image)));
			continue;
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
		  	if(height > width) {
		  		console.log("=> moving to mobile");
		  		fs.renameSync(path.join(wallpaperFolder, image), path.join(mobileFolder, image));
		  	}
				else if(!utils.fileExistsAnyExtension(image, outputFinal)) {
					console.log("=> doesn't exist, moving to upscale folder");
					fs.writeFileSync(path.join(wallpaperTemp, image), fs.readFileSync(path.join(wallpaperFolder, image)));
					return;
				}
	  	}
	  );		
	};
}