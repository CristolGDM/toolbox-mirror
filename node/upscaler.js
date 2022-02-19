fs = require("fs");
sharp = require("sharp");
path = require("path");
utils = require("./utils.js");

const models = {
	nickelback:  "4x_NickelbackFS_72000_G.pth",
	nmkd:  "4x_NMKD-Superscale-SP_178000_G.pth",
	lady:  "Lady0101_208000.pth",
	uniscaleRestore:  "4x-UniScale_Restore.pth",
	lollypop:  "lollypop.pth",
	remacri:  "4x_foolhardy_Remacri.pth",
	ultrasharp:  "4x-UltraSharp.pth",
	universal:  "4x_UniversalUpscalerV2-Neutral_115000_swaG.pth",
	universalSharp:  "4x_UniversalUpscalerV2-Sharp_101000_G.pth",
	universalSharper:  "4x_UniversalUpscalerV2-Sharper_103000_G.pth"
}

function upscaleFolderToOutput(inputPath, outputPath, modelName, useTransparency) {
	const usedModel = modelName ? modelName.endsWith(".pth") ? modelName : `${modelName}.pth` : models.universalSharp;
	const transparentParameters = useTransparency ? " --ternary-alpha --alpha-mode alpha_separately" : "";
	utils.execShell(`python E:\\Downloads\\esrgan\\upscale.py "E:\\Downloads\\esrgan\\models\\${usedModel}" --input "${inputPath}" --output "${outputPath}" --skip-existing --verbose ${transparentParameters} -fp16`);
}

async function upscaleFolder(inputPath, modelName, outputPath, minWidth, minHeight) {
	if(inputPath.endsWith("-toscale") || inputPath.endsWith("-upscaled")) {
		return;
	}
	utils.logLine();
	const desiredWidth = minWidth ? minWidth : 3840;
	const toUpscalename = `${inputPath}-toscale`;
	const upscaledFolderName = `${inputPath}-upscaled`;
	utils.createFolder(toUpscalename);
	utils.createFolder(upscaledFolderName);
	utils.logLine();
	const images = fs.readdirSync(inputPath);
	const toUpscaleImages = fs.readdirSync(toUpscalename);
	const upscaledImages = fs.readdirSync(upscaledFolderName);
	await Promise.all(images.map(async (imageName, index) => {
		if(utils.isFolder(imageName)) {
			return;
		}
		if(toUpscaleImages.indexOf(imageName) > -1 || upscaledImages.indexOf(imageName) > -1) {
			return;
		}
		await sharp(path.join(inputPath, imageName))
		  .metadata()
		  .then(({ width, height }) => {
				console.log(`${index+1} out of ${images.length}: ${imageName}`);
				const shouldUpscale = minHeight ? height < minHeight : width < desiredWidth;
		  	if(!shouldUpscale) {
		  		console.log(`=> moving to conversion folder`);
		  		fs.writeFileSync(path.join(upscaledFolderName, imageName), fs.readFileSync(path.join(inputPath, imageName)));
		  	}
		  	else {
		  		console.log(`=> moving to upscale folder`);
		  		fs.writeFileSync(path.join(toUpscalename, imageName), fs.readFileSync(path.join(inputPath, imageName)));
		  	}
	  	}
	  );		
	}))

	utils.logLine();
	upscaleFolderToOutput(toUpscalename, upscaledFolderName, modelName);

	if(!outputPath) {
		utils.logLine();
		utils.deleteFolder(inputPath);
		utils.createFolder(inputPath);
	
		utils.logLine();
		await convertFolderToJpg(upscaledFolderName, inputPath);
	}
	else {
		utils.logLine();
		utils.createFolder(outputPath);
	
		utils.logLine();
		await convertFolderToJpg(upscaledFolderName, outputPath);
	}

	utils.logLine();
	// utils.deleteFolder(toUpscalename);
	// utils.deleteFolder(upscaledFolderName);

	utils.logLine();
	utils.logGreen(`Finished upscaling ${inputPath}`);
	return;
}

async function convertFolderToJpg(inputFolder, outputFolder) {
	if(!fs.existsSync(inputFolder)) {
		utils.logYellow(`${inputFolder} doesn't exist`);
		return;
	}
	utils.createFolder(outputFolder);
	const images = fs.readdirSync(inputFolder);
	const existingFiles = utils.getListOfFilesWithoutExtension(outputFolder);

	await Promise.all(images.map(async (image, index) => {
		const imageName = utils.getFileNameWithoutExtension(image);
		const indexText = `${index+1}/${images.length}`;
		if(utils.isFolder(image)) {
			utils.logYellow(`=> ${indexText} is a folder, skipping`);
			return;
		}
		if(existingFiles.indexOf(imageName) > -1) {
			utils.logBlue(`=> ${indexText} already exists, skipping`);
			return;
		}
		if(!(image.endsWith(".png") || image.endsWith(".webp") || image.endsWith(".bmp"))) {
			utils.logBlue(`=> ${indexText} cannot be converted, moving as is`);
			fs.writeFileSync(path.join(outputFolder, image), fs.readFileSync(path.join(inputFolder, image)));
			return;
		}

		await sharp(path.join(inputFolder, image))
			.toFormat("jpeg")
	    .jpeg({
	      force: true, // <----- add this parameter
	    })
	    .toFile(path.join(outputFolder, imageName+".jpg"))
			.then(() => {
				
				console.log(`Converting image ${utils.yellowString(indexText)}: ${image}`);
				utils.logGreen("=> converted to jpg");
			})
  }))

  return;
}

async function upscalePSX(gameName) {
	const folderLocation = "R:/Emulation/PSX"
	const dumpFolder = `${folderLocation}/${gameName}-texture-dump`;
	const targetFolder = `${folderLocation}/${gameName}-texture-replacements`;
	const tempFolder = `${folderLocation}/${gameName}-texture-temp`;

	utils.createFolder(dumpFolder);
	utils.createFolder(targetFolder);
	utils.createFolder(tempFolder);

	const images = fs.readdirSync(dumpFolder);
	const existing = fs.readdirSync(targetFolder);

	for (let i = 0; i < images.length; i++) {
		const imageName = images[i];

		// console.log(`${i+1} out of ${images.length}: ${imageName}`);
		if(existing.indexOf(imageName) > -1) {
			// console.log("=> Already exists, skipping");
			continue;
		}
		
		console.log(`${i+1} out of ${images.length}: ${imageName}`);

		console.log("=> Moving to upscale folder");
		fs.writeFileSync(path.join(tempFolder, imageName), fs.readFileSync(path.join(dumpFolder, imageName)));
	}

	upscaleFolderToOutput(tempFolder, targetFolder, models.lady, true);
	utils.deleteFolder(tempFolder);
}

exports.upscaleFolder = upscaleFolder;
exports.upscaleFolderToOutput = upscaleFolderToOutput;
exports.convertFolderToJpg = convertFolderToJpg;
exports.upscalePSX = upscalePSX;

exports.models = models;