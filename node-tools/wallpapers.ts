import * as fs from "fs";
import * as sharp from "sharp";
import * as path from "path";
import * as utils from "./utils";
import * as upscaler from "./upscaler";

import {subs as imaginarySubs} from "./assets/imaginary-subs";
import {subs as dungeonSubs} from "./assets/dungeon-subs";
import { NASPath } from "./utils";

const localPicturesPath = "L:/Pictures/wp-up";

const wallpaperTemp = `${localPicturesPath}/desk-orig`;
const mobileTemp = `${localPicturesPath}/mob-orig`;

const outputFinal = `${NASPath}/pictures/wallpapers-upscaled-desktop`;
const outputMobile = `${NASPath}/pictures/wallpapers-upscaled-mobile`;

const wallpaperToUpscale = upscaler.getTempScaleFolderName(wallpaperTemp);
const wallpaperToUpscaleMobile = upscaler.getTempScaleFolderName(mobileTemp);

const wallpaperToConvert = `${localPicturesPath}/desk-toconvert`;
const wallpaperToConvertMobile = `${localPicturesPath}/mob-toconvert`;

const outputToDownscale = `${localPicturesPath}/desk-todown`;
const outputMobileToDownscale = `${localPicturesPath}/mob-todown`;

const forbiddenExtensions = ["mp4", "gif", "mkv", "m4u", "txt", "avi"];

export const knownDupesPath = `${NASPath}/pictures/knownDupes.json`;


function fileAlreadyExists(fileName: string, files: string[]) {
	const fileNameCleaned = utils.getFileNameWithoutExtension(fileName);
	return files.indexOf(fileNameCleaned) > -1;
}

export function getImaginaryFolders() {
	const subNames = Object.keys(imaginarySubs);

	return subNames.map((subName) => {
		const sub = imaginarySubs[subName];
		return sub.folderPath ?? path.join(utils.ImaginaryPath, subName)
	}).sort();
}

export function getDungeonFolders() {
	const subNames = Object.keys(dungeonSubs);

	return subNames.map((subName) => {
		const sub = dungeonSubs[subName];
		return sub.folderPath;
	});
}

export function getUpscaleFolders() {
	return [wallpaperTemp, mobileTemp, wallpaperToUpscale, wallpaperToUpscaleMobile, wallpaperToConvert, wallpaperToConvertMobile, outputToDownscale, outputMobileToDownscale];
}

export function getFinalFolders() {
	return [outputFinal, outputMobile];
}

export function checkDuplicates() {
	let duplicates = 0;
	const finalFiles = utils.getListOfFilesWithoutExtension(outputFinal).concat(utils.getListOfFilesWithoutExtension(outputMobile));
	const tempFiles = utils.getListOfFilesWithoutExtension(wallpaperTemp).concat(utils.getListOfFilesWithoutExtension(mobileTemp));
	
	for (let i = 0; i < tempFiles.length; i++) {
		const element = tempFiles[i];
		if(finalFiles.indexOf(element) > -1) {
			duplicates++
		}
	}

	console.log(`Found ${duplicates} dupes`);
};

export async function upscaleDesktop() {
	utils.openImageFolder(wallpaperToConvert);
	await upscaler.upscaleFolder(wallpaperTemp, upscaler.models.uniscaleRestore, wallpaperToConvert, 3840);
	utils.logBlue("________");
	utils.logBlue("Finished upscaling desktop");
}

export async function upscaleMobile() {
	utils.openImageFolder(wallpaperToConvertMobile);
	await upscaler.upscaleFolder(mobileTemp, upscaler.models.lollypop, wallpaperToConvertMobile, null, 2400);
	utils.logBlue("________");
	utils.logBlue("Finished upscaling mobile");
}

export function upscale() {
	upscaleDesktop().then(() => {
		utils.logLine();
		utils.logGreen(utils.separator(30));
		utils.logGreen("Finished upscaling desktop folder");
		utils.logGreen(utils.separator(30));
		utils.logLine();
		upscaleMobile().then(() => {
			utils.logLine();
			utils.logGreen(utils.separator(30));
			utils.logGreen("Finished upscaling mobile folder");
			utils.logGreen(utils.separator(30));
			utils.logLine();
			utils.logLine();

			utils.logBlue(utils.separator(30));
			utils.logBlue(utils.separator(30));
			utils.logBlue(utils.separator(30));
			utils.logBlue("Finished upscaling");
		});
	})
};

export async function sortAll() {
	const timerLabel = "sortAll() current time: "
	console.time(timerLabel)
	const knownDupesRaw = fs.readFileSync(knownDupesPath, "utf8");
	const knownDupes = await JSON.parse(knownDupesRaw);
	let foundDupes = 0;
	utils.createFolder(wallpaperTemp);
	utils.createFolder(mobileTemp);
	const imaginaryFolders = getImaginaryFolders();

	let files = utils.getListOfFilesWithoutExtension(outputFinal)
				.concat(utils.getListOfFilesWithoutExtension(outputMobile))
				.concat(utils.getListOfFilesWithoutExtension(wallpaperTemp))
				.concat(utils.getListOfFilesWithoutExtension(mobileTemp));

	for (let f = 0; f < imaginaryFolders.length; f++) {
		const folderPath = imaginaryFolders[f];
		const folder = path.basename(folderPath)
		const folderLog = `[${f+1}/${imaginaryFolders.length}] ${folder}`;
		
		utils.logLine();
		utils.logBlue("------------------------------------------------------");
		utils.logBlue(`Sorting ${folder} folder...`);
		utils.logBlue("------------------------------------------------------");
		utils.logLine();

		const images = fs.readdirSync(folderPath);

		await Promise.all(images.map(async (image, index) => {

			if(image.split(".").length === 1) {
				console.log(`=> is a folder, skipping`)
				return;
			}

			if(forbiddenExtensions.some((extension) => {return image.endsWith(extension)})) {
				utils.logYellow("=> wrong file extension, skipping");
				return;
			}

			let imagePath = path.join(folderPath, image);
			if(image.endsWith("unknown_video") || image.endsWith("UNKNOWN_VIDEO")) {
				utils.deleteFolder(imagePath);
			}
			if(image.length > 200) {
				utils.logRed(`=> shortening long name`);
				const shortenedImageName = image.substring(0, 100) + image.substring(image.length - 100);
				fs.renameSync(imagePath, path.join(folderPath, shortenedImageName));
				image = shortenedImageName;
				imagePath =  path.join(folderPath, shortenedImageName);
			}

			if(fileAlreadyExists(image, files)) {
				console.log("=> Already exists, skipping");
				return;
			}

			if(knownDupes[utils.getFileNameWithoutExtension(image)]){
				utils.logRed(`=> is known duplicate`);
				foundDupes++;
				return;
			}

			await sharp(imagePath)
				.metadata()
				.then(({ width, height }) => {
					console.log(`${folderLog} - ${index} out of ${images.length}: ${image}`);
					if(width/4 >= height/3) {
						if(image.toLowerCase().startsWith("verticalwallpapers")) {
							console.log("=> desktop sized mobile wallpaper");
							return;
						}
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
					console.timeLog(timerLabel);
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

	utils.logBlue("------------------------------");
	utils.logBlue(`Ignored ${foundDupes} duplicates`);
	utils.logBlue("------------------------------");
	return;
}

export async function downscaleDesktop() {
	utils.openImageFolder(outputFinal);
	await upscaler.downscaleFolder(outputToDownscale, outputFinal, 3840, 2160);
}

export async function downscaleMobile() {
	utils.openImageFolder(outputMobile);
	await upscaler.downscaleFolder(outputMobileToDownscale, outputMobile, 1080, 2400);
}

export async function downscale() {
	const timer = "downscaling took ";
	console.time(timer);
	utils.createFolder(outputFinal);
	utils.createFolder(outputMobile);
	downscaleDesktop().then(async () => {
		console.timeLog(timer);
		utils.logLine();
		utils.logGreen(utils.separator(30));
		utils.logGreen("Finished downscaling desktop folder");
		utils.logGreen(utils.separator(30));
		utils.logLine();
		downscaleMobile().then(() => {
			console.timeLog(timer);
			utils.logLine();
			utils.logGreen(utils.separator(30));
			utils.logGreen("Finished downscaling mobile folder");
			utils.logGreen(utils.separator(30));
			utils.logLine();
		});
	});
}

export async function convertDesktop() {
	upscaler.convertFolderToJpg(wallpaperToConvert, outputToDownscale)
}

export async function convertMobile() {
	upscaler.convertFolderToJpg(wallpaperToConvertMobile, outputMobileToDownscale)
}
export function convert() {
	const timer = "converting took ";
	console.time(timer);
	utils.createFolder(outputToDownscale);
	utils.createFolder(outputMobileToDownscale);
	convertDesktop().then(() => {
		console.timeLog(timer);
		utils.logLine();
		utils.logGreen(utils.separator(30));
		utils.logGreen("Finished converting desktop folder");
		utils.logGreen(utils.separator(30));
		utils.logLine();
		convertMobile().then(() => {
			console.timeLog(timer);
			utils.logLine();
			utils.logGreen(utils.separator(30));
			utils.logGreen("Finished converting mobile folder");
			utils.logGreen(utils.separator(30));
			utils.logLine();
		})
	})
}