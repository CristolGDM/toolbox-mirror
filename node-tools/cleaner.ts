import * as fs from "fs";
import * as utils from "./utils";
import { subs as otherSubs } from "./assets/other-subs";
import { getImaginaryFolders } from "./wallpapers";
import path = require("path");

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

export async function cleanImaginary() {
	const subs = getImaginaryFolders();

	for (let i = 0; i < subs.length; i++) {
		const subPath = subs[i];
		utils.logBlue(`Cleaning (${i+1}/${subs.length}): ${subPath}`);

		deleteDuplicates(subPath);
		deleteSimilar(subPath);
	}
}

export async function cleanBeforeUpscale() {
	const folders = [
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
		const folder = folders[index];
		if(!fs.existsSync(folder)) {
			console.log(`${index+1}/${folders.length}: ${folder} doesn't exist`);
			continue;
		}
		const foundDupes = deleteDuplicates(folder);
		foundDupes.map((dupe) => {knownDupes[dupe] = true});
		const foundDupes2 = deleteSimilar(folder);
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
		const folder = folders[index];
		if(!fs.existsSync(folder)) {
			console.log(`${index+1}/${folders.length}: ${folder} doesn't exist`);
			continue;
		}
		const foundDupes = deleteDuplicates(folder);
		foundDupes.map((dupe) => {knownDupes[dupe] = true});
		const foundDupes2 = deleteSimilar(folder);
		foundDupes2.map((dupe) => {knownDupes[dupe] = true});
		console.log(`Finished cleaning ${index+1}/${folders.length}`);
	}

	fs.writeFileSync(knownDupesPath, JSON.stringify(knownDupes, null, 2));
}

export function cleanOthers() {
	let folders = [... new Set(Object.keys(otherSubs).map(key => otherSubs[key].folderPath))];

	for (let index = 0; index < folders.length; index++) {
		const folder = folders[index];
		if(!fs.existsSync(folder)) {
			console.log(`${index+1}/${folders.length}: ${folder} doesn't exist`);
			continue;
		}
		deleteDuplicates(folder);
		deleteSimilar(folder);
		deleteSimilar(folder, true);
		console.log(`Finished cleaning ${index+1}/${folders.length}`)
	}
}

//--summarize and --delete unfortunately not compatible
export function deleteDuplicates(folderPath:string) {
	const cleanedFolderPath = folderPath.replace(/\\/g, "/");
	const logFile = path.join(cleanedFolderPath, "fdupelog.txt");
	utils.execShell(`C:\\cygwin64\\bin\\bash.exe --login -c 'fdupes --delete --noprompt --sameline "${cleanedFolderPath}" 2>&1 | tee -a "${logFile.replace(/\\/g, "/")}" '`)

	const log = fs.readFileSync(logFile, 'utf8');
	console.log(log);
	utils.logGreen(`=> Found and deleted ${log.split("[-]").length -1} duplicates`);

	const folder = path.dirname(logFile).replace(/\\/g, "/") + "/";
	console.log(folder);
	const filesFound = log.split("\n")
											.filter(file => file.indexOf(folder) > -1)
											.map(file => path.parse(file.split(folder)[1]).name);

	// deleteFolder(logFile);
	return filesFound;
}

export function deleteSimilar(folderPath:string, video?: boolean) {
	const cleanedFolderPath = folderPath.replace(/\\/g, "/");
	const logname = video ? "czkwlog-video.txt" : "czkwlog.txt";
	const tempLogFile = path.join(cleanedFolderPath, logname);
	let deleted = 0;
	utils.execShell(`L:\\Downloads\\windows_czkawka_cli.exe ${video ? "video" : "image"} --directories "${cleanedFolderPath}" -f "${tempLogFile}"`);

	const log = fs.readFileSync(tempLogFile, 'utf8').split("\n");
	let filesGroups = [];
	let temp:string[] = [];
	log.map(line => {
		if(line && line.length) {
			temp.push(line);
		} else if (temp.length) {
			filesGroups.push(temp);
			temp = [];
		}
	});

	if(temp.length > 0) {
		filesGroups.push(temp);
	}
	filesGroups = filesGroups.filter((group) => {return group.length >= 3})
													.map((group) => {
														group.shift();
														group = group.map((file) => {
															let split = file.split(" - ");
															split = split.slice(0, video ? -1 : -3);
															return split.join(" - ");
														})
														return group;
													});
	filesGroups.forEach((group) => {
		const files = [...group];
		files.shift();
		files.forEach((file) => {
			utils.deleteFolder(file);
			deleted++;
		})
	});
	utils.logGreen(`=> Found and deleted ${deleted} similar ${video ? "videos" : "images"}`);
	const filesFound = filesGroups.flat().map((file) => {
		return path.basename(file, path.extname(file))
	});
	return filesFound;
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
