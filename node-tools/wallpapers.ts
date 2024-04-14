import * as fs from "fs";
import * as sharp from "sharp";
import * as path from "path";
import * as utils from "./utils";
import * as upscaler from "./upscaler";
import * as cliProgress from "cli-progress";
import * as colors from "ansi-colors";

import {subs as imaginarySubs} from "./assets/imaginary-subs";
import {subs as dungeonSubs} from "./assets/dungeon-subs";
import { NASPath, logGreen, separator, createFolder } from "./utils";
import { upscaleFolderSD, upscaleFolderSDOneByOne } from "./stable-diffusion";

const localPicturesPath = "L:/Pictures/wp-up";

const wallpaperTemp = `${localPicturesPath}/desk-orig`;
const mobileTemp = `${localPicturesPath}/mob-orig`;

const outputFinal = `${NASPath}/pictures/wallpapers-upscaled-desktop`;
const outputMobile = `${NASPath}/pictures/wallpapers-upscaled-mobile`;

const wallpaperToUpscale = upscaler.getTempScaleFolderName(wallpaperTemp);
const wallpaperToUpscaleMobile = upscaler.getTempScaleFolderName(mobileTemp);

const outputSemiFinal = `${localPicturesPath}/desk-totransfer`;
const outputMobileSemiFinal = `${localPicturesPath}/mob-totransfer`;

const forbiddenExtensions = ["mp4", "gif", "mkv", "m4u", "txt", "avi", "gifv"];

export const knownDupesPath = `${NASPath}/pictures/knownDupes.json`;

export const desktopWidth = 3840;
export const desktopHeight = 2160;
export const mobileWidth = 1080;
export const mobileHeight = 2400;

function fileAlreadyExists(fileName: string, files: string[]) {
	const fileNameCleaned = utils.getFileNameWithoutExtension(fileName);
	return files.indexOf(fileNameCleaned) > -1;
}

export async function upscale() {
	/* Create necessary folders */
	[wallpaperTemp, outputSemiFinal, wallpaperToUpscale, mobileTemp, outputMobileSemiFinal, wallpaperToUpscaleMobile].forEach((folder) => {return createFolder(folder)});

	/* Filter big enough images */
	await filterBigEnough(wallpaperTemp, outputSemiFinal, wallpaperToUpscale, desktopWidth, desktopHeight);
	await filterBigEnough(mobileTemp, outputMobileSemiFinal, wallpaperToUpscaleMobile, mobileWidth, mobileHeight);
	
  logGreen(separator(16));
  logGreen("Finished sorting");
  logGreen(separator(16));
	
	/* Upscale small ones */
	const upscaler = {upscaler_1: '4x_foolhardy_Remacri'};
	await upscaleFolderSDOneByOne(wallpaperToUpscale, outputSemiFinal, upscaler,desktopWidth,desktopHeight);
	await upscaleFolderSDOneByOne(wallpaperToUpscaleMobile, outputMobileSemiFinal, upscaler,mobileWidth,mobileHeight);
  logGreen(separator(16));
  logGreen("Finished upscale");
  logGreen(separator(16));
};

export async function filterBigEnough(sourceFolder: string, folderIfBig: string, folderIfSmall: string, targetWidth: number, targetHeight: number) {
	createFolder(folderIfBig);
	createFolder(folderIfSmall);
	const images = fs.readdirSync(sourceFolder);
	const progressBar = new cliProgress.SingleBar({
    format: 'CLI Progress |' + colors.cyanBright('{bar}') + '| {percentage}% | {value}/{total} | ETA: {eta_formatted}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    etaBuffer: 50,
  });
	const done: {name: string, isBig?: boolean, isExists?: boolean}[] = [];
  progressBar.start(images.length, 0);
	console.log("");

	for (let index = 0; index < images.length; index++) {
		const image = images[index];
		const imagePath = path.join(sourceFolder, image);
		const logPrefix = `${index+1}/${images.length}: ${image}`;
		if(fs.existsSync(path.join(folderIfSmall, image)) || fs.existsSync(path.join(folderIfBig, utils.getFileNameWithoutExtension(image)+".jpg"))) {
			done.push({name: image, isExists: true});
			utils.logRed(`${logPrefix} => already exists`);
		}
		else {
			utils.logYellow(`${logPrefix} => need to upscale`);
			const {width, height} = await sharp(imagePath).metadata();
			if(width < targetWidth || height < targetHeight) {
				done.push({name: image, isBig: false});
				fs.writeFileSync(path.join(folderIfSmall, image), fs.readFileSync(imagePath));
			}
			else {
				done.push({name: image, isBig: true});
				utils.logBlue(`${logPrefix} => already big enough`);
				await sharp(imagePath)
					.toFormat("jpeg")
					.jpeg({
						force: true,
					})
					.resize(targetWidth, targetHeight, {fit: "outside"})
					.toFile(path.join(folderIfBig, utils.getFileNameWithoutExtension(image)+".jpg"))
			}
		}
    progressBar.update(index+1);
	}
  progressBar.update(images.length);
	console.log("");
}

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
					if(width/height > 4 || height/width > 4) {
						console.log("=> ratio above 4:1, skipping");
						return;
					}
					if(width/4 >= height/3) {
						if(image.toLowerCase().startsWith("verticalwallpapers")) {
							console.log("=> desktop sized mobile wallpaper");
							return;
						}
						if(width < 1600 || height < 800) {
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

/* GET FOLDERS */

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
	return [wallpaperTemp, mobileTemp, wallpaperToUpscale, wallpaperToUpscaleMobile, outputSemiFinal, outputMobileSemiFinal];
}

export function getFinalFolders() {
	return [outputFinal, outputMobile];
}

export function sendUpscaledToLibrary() {
	utils.createFolder(outputFinal);
	utils.createFolder(outputMobile);
	utils.execShell(`rclone copyto "${outputSemiFinal}" "${outputFinal}" --progress --transfers=10`);
	utils.execShell(`rclone copyto "${outputMobileSemiFinal}" "${outputMobile}" --progress --transfers=10`);
}