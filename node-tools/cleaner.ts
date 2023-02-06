import * as fs from "fs";
import * as utils from "./utils";
import { subs as otherSubs } from "./assets/other-subs";
import { getDungeonFolders, getFinalFolders, getImaginaryFolders, getUpscaleFolders, knownDupesPath } from "./wallpapers";
import path = require("path");

export async function cleanImaginary() {
	const subs = getImaginaryFolders();
	let total = 0;

	// const index = subs.findIndex((value) => {return value.indexOf("colorscapes") > -1})

	for (let i = 0; i < subs.length; i++) {
		const subPath = subs[i];
		utils.logBlue(`Cleaning (${i+1}/${subs.length}): ${subPath}`);

		// deleteSimilar(subPath);
		// utils.logBlue(`Still doing (${i+1}/${subs.length}): ${subPath}...`);
		const results = deleteDuplicates(subPath).length/2;
		total += Math.ceil(results);
		utils.logBlue(`Currently at ${total} total duplicate found`);
		console.log("");
		console.log("------------------------------------------------------------------------------------");
		console.log("------------------------------------------------------------------------------------");
		console.log("");
	}

	utils.logGreen(`========================`);
	utils.logGreen(`CLEANED ${total} DUPLICATES`);
	utils.logGreen(`========================`);
}

export async function cleanDungeon() {
	const subs = getDungeonFolders();
	let total = 0;

	for (let i = 0; i < subs.length; i++) {
		const subPath = subs[i];
		utils.logBlue(`Cleaning (${i+1}/${subs.length}): ${subPath}`);

		const results1 = deleteSimilar(subPath).length/2;
		utils.logBlue(`Still doing (${i+1}/${subs.length}): ${subPath}...`);
		const results2 = deleteDuplicates(subPath).length/2;
		total += Math.ceil(results1);
		total += Math.ceil(results2);
		utils.logBlue(`Currently at ${total} total duplicate found`);
		console.log("");
		console.log("------------------------------------------------------------------------------------");
		console.log("------------------------------------------------------------------------------------");
		console.log("");
	}

	utils.logGreen(`========================`);
	utils.logGreen(`CLEANED ${total} DUPLICATES`);
	utils.logGreen(`========================`);
}

export async function cleanBeforeUpscale() {
	const timerLabel = "cleaning before upscale took:";
	console.time(timerLabel);
	const folders = getUpscaleFolders();
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
	console.timeEnd(timerLabel);
}

export async function cleanAfterUpscale() {
	const timerLabel = "cleaning after upscale took:";
	console.time(timerLabel);
	const folders = getFinalFolders()

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
	console.timeEnd(timerLabel);
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
	const timerName = `deleteDuplicates() for ${path.basename(folderPath)} took:`;
	console.time(timerName);
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
	console.timeEnd(timerName);
	return filesFound;
}

export function deleteSimilar(folderPath:string, video?: boolean) {
	const timerName = `deleteSimilar() for ${path.basename(folderPath)} took:`;
	console.time(timerName);
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
	console.timeEnd(timerName);
	return filesFound;
}
