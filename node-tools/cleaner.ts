import * as fs from "fs";
import * as utils from "./utils";

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


const knownDupesPath = "E:/Pictures/knownDupes.json";

export async function cleanBeforeUpscale() {
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
		foundDupes.map((dupe) => {knownDupes[dupe] = true});
		const foundDupes2 = utils.deleteSimilar(folder);
		foundDupes2.map((dupe) => {knownDupes[dupe] = true});
		console.log(`Finished cleaning ${index+1}/${folders.length}`);
	}
	
	fs.writeFileSync(knownDupesPath, JSON.stringify(knownDupes, null, 2));
}

export async function cleanAfterUpscale() {
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
		foundDupes.map((dupe) => {knownDupes[dupe] = true});
		const foundDupes2 = utils.deleteSimilar(folder);
		foundDupes2.map((dupe) => {knownDupes[dupe] = true});
		console.log(`Finished cleaning ${index+1}/${folders.length}`);
	}

	fs.writeFileSync(knownDupesPath, JSON.stringify(knownDupes, null, 2));
}

export async function clean() {
	await utils.removesFilesFromAifExistsInB(wallpaperTemp, wallpaperToUpscale);
	await utils.removesFilesFromAifExistsInB(wallpaperToUpscale, wallpaperToConvert);
	await utils.removesFilesFromAifExistsInB(wallpaperToConvert, outputDownscale);
	await utils.removesFilesFromAifExistsInB(outputDownscale, outputFinal);
	
	await utils.removesFilesFromAifExistsInB(mobileTemp, wallpaperToUpscaleMobile);
	await utils.removesFilesFromAifExistsInB(wallpaperToUpscaleMobile, wallpaperToConvertMobile);
	await utils.removesFilesFromAifExistsInB(wallpaperToConvertMobile, outputMobileDownscale);
	await utils.removesFilesFromAifExistsInB(outputMobileDownscale, outputMobile);
}
