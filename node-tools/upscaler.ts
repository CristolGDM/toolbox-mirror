import * as fs from "fs";
import * as sharp from "sharp";
import * as path from "path";
import * as utils from "./utils";

export const models = {
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
} as const;

export type ModelName = typeof models[keyof typeof models];

export function upscaleFolderToOutput(inputPath:string, outputPath:string, modelName: ModelName, useTransparency?: boolean) {
	const usedModel = modelName ? modelName.endsWith(".pth") ? modelName : `${modelName}.pth` : models.universalSharp;
	const transparentParameters = useTransparency ? " --ternary-alpha --alpha-mode alpha_separately" : "";
	utils.execShell(`python L:\\Downloads\\esrgan\\upscale.py "L:\\Downloads\\esrgan\\models\\${usedModel}" --input "${inputPath}" --output "${outputPath}" --skip-existing --verbose ${transparentParameters} -fp16`);
}

export function getTempScaleFolderName(originalFolderName: string) {
	return `${originalFolderName}-toscale`;
}

export function getUpscaleRatio(desiredWidth: number, desiredHeight: number, imageWidth: number, imageHeight: number): number {
	const widthRatio = desiredWidth / imageWidth;
	const heightRatio = desiredHeight / imageHeight;
	const chosenRatio = Math.max(widthRatio, heightRatio);
	return Number((Math.ceil(chosenRatio*100)/100).toFixed(2))
}

export async function convertFolderToJpg(inputFolder:string, outputFolder:string) {
	utils.logLine();
	utils.logGreen("________");
	utils.logGreen(`Converting ${inputFolder} to Jpg`);
	utils.logGreen("________");
	utils.logLine();
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

export async function upscalePSX(gameName:string) {
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

export async function upscalePS2All() {
	const games = fs.readdirSync("R:/PCSX2 1.7.0 dev/textures");
	games.forEach(upscalePS2);
}

export async function upscalePS2(gameName: string) {
	const folderLocation = "R:/PCSX2 1.7.0 dev";
	const dumpFolder = `${folderLocation}/textures/${gameName}/dumps`;
	const targetFolder = `${folderLocation}/textures/${gameName}/replacements`;
	const tempFolder = `${folderLocation}/textures/${gameName}/temp`;

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