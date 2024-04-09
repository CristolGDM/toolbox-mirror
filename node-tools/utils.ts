import * as fs from "fs";
import * as path from "path";

const { execSync, exec } = require('child_process');

export const NASPath = "//MOOMINLIBRARY";
export const PicturesPath = `${NASPath}/pictures`;
export const ImaginaryPath = `${PicturesPath}/imaginary-network`;

export const oneSecond = 1000;
export const oneMinute = 60*oneSecond;
export const oneHour = 60*oneMinute;

export function getFileNameWithoutExtension(fileName:string) {
	const nameSplit = fileName.split(".");
	nameSplit.pop();
	return nameSplit.join(".");
}

export function getListOfFilesWithoutExtension(folderPath:string) {
	return fs.readdirSync(folderPath).map(getFileNameWithoutExtension);
}

export function fileExistsAnyExtension(file:string, folderPath:string) {
	const files = getListOfFilesWithoutExtension(folderPath);
	const fileName = getFileNameWithoutExtension(file);

	return files.indexOf(fileName) > -1;
}

export function cleanOpenPoseFolders() {
	const mypath = "L:/Pictures/projects/_controlnet shapes and poses/open-pose/_openpose";
	const folders = fs.readdirSync(mypath);
	folders.forEach((poseFolder) => {
		const posefolderPath = path.join(mypath,poseFolder)
		const subfolders: string[] = fs.readdirSync(posefolderPath);
		subfolders.forEach((subfolder) => {
			if(subfolder !== "json" && subfolder !== "OpenPose" && subfolder !== "img") return;
			const subfolderPath = path.join(posefolderPath,subfolder);
			const contents = fs.readdirSync(subfolderPath);
			contents.forEach((file) => {
				fs.copyFileSync(path.join(subfolderPath, file), path.join(posefolderPath, file));
			})
			deleteFolder(subfolderPath);
		});
	})
}

export async function removesFilesFromAifExistsInB(pathA:string, pathB:string, revert?: boolean) {
	if(!fs.existsSync(pathA)) {
		logYellow(`${pathA} doesn't exist`);
		return;
	}
	if(!fs.existsSync(pathB)) {
		logYellow(`${pathB} doesn't exist`);
		return;
	}

	const filesA = fs.readdirSync(pathA);
	const filesB = getListOfFilesWithoutExtension(pathB);

	logBlue(`${pathA} has ${filesA.length} files`);
	logBlue(`${pathB} has ${filesB.length} files`);

	let deletedFiles = 0;

	await Promise.all(filesA.map(async (file, index) => {
		if((!revert && filesB.indexOf(getFileNameWithoutExtension(file)) > -1)
		|| (revert && filesB.indexOf(getFileNameWithoutExtension(file)) === -1)) {
			deleteFolder(path.join(pathA, file));
			// logBlue(`Will delete ${path.join(pathA, file)}`);
			deletedFiles++
		}
		return;
	}))

	logGreen(`Deleted ${deletedFiles} from ${pathA}`);
}

export function createFolder(folderPath:string, silent?: boolean) {
	if (!fs.existsSync(folderPath)){
		if(!silent) {logYellow(`=> creating ${folderPath}`);}
		fs.mkdirSync(folderPath, {recursive: true});
	}
}

export function openImageFolder(folderPath: string) {
	createFolder(folderPath);
	execShell(`"C:/Program Files/XnViewMP/xnviewmp.exe" "${folderPath}"`, true);
}

export function randomImaginary() {
	const imaginaryFolders = fs.readdirSync(ImaginaryPath).filter((folder) => {return folder.indexOf(".") === -1});
	const chosenFolder = imaginaryFolders[Math.floor(Math.random()*imaginaryFolders.length)];
	const chosenFolderPath = `${ImaginaryPath}/${chosenFolder}`;

	const images = fs.readdirSync(chosenFolderPath);
	const chosenImage = images[Math.floor(Math.random()*images.length)];
	const chosenImagePath = `${chosenFolderPath}/${chosenImage}`
	execShell(`"C:/Program Files/XnViewMP/xnviewmp.exe" "${chosenImagePath}"`, true);
}

export function deleteFolder(folderPath:string, silent?: boolean) {
	if (fs.existsSync(folderPath)){
		if(!silent) {logYellow(`=> deleting ${folderPath}`);}
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
}

export function isFolder(path:string) {
	return path.split(".").length === 1;
}

export function logBlue(stringToLog:any) {
	console.log('\x1b[96m%s\x1b[0m', stringToLog);
}

export function logGreen(stringToLog:any) {
	console.log('\x1b[92m%s\x1b[0m', stringToLog);
}

export function logYellow(stringToLog:any) {
	console.log('\x1b[93m%s\x1b[0m', stringToLog);
}

export function logRed(stringToLog:any) {
	console.log('\x1b[91m%s\x1b[0m', stringToLog);
}

export function logLine() {
	console.log(" ");
}

export function redString(stringToLog:string) {
	return `\x1b[91m${stringToLog}\x1b[0m`
}

export function blueString(stringToLog:string) {
	return `\x1b[96m${stringToLog}\x1b[0m`
}

export function greenString(stringToLog:string) {
	return `\x1b[92m${stringToLog}\x1b[0m`
}

export function yellowString(stringToLog:string) {
	return `\x1b[93m${stringToLog}\x1b[0m`
}

export function formatTimeStamp(timestamp: number) {
	const hours = timestamp > 3600 ? `${Math.trunc(timestamp/3600)}h` : "";
	const minutes = timestamp > 60 ? `${Math.trunc((timestamp%3600)/60)}mn` : "";
	return `${hours}${minutes}${Math.trunc(timestamp%60)}s`
}

export function execShell(command:string, isAsync?:boolean, customString?: string) {
	logLine();
	logYellow(" " + separator(30));
	logLine();
	logYellow(" executing following command:")
	logLine();
	logBlue("" + (customString ?? command));
	logLine();
	logYellow(" " + separator(30));
	logLine();

	isAsync ?
	exec(command, {stdio:[0,1,2]})
	:
	execSync(command, {stdio:[0,1,2]});
}

export function separator(length:number, altChar?: string) {
	const usedChar = altChar ?? "-";
	let returnString = "";
	for (let index = 0; index < length; index++) {
		returnString += usedChar;
	}
	return returnString;
}
