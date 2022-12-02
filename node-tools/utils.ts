import * as fs from "fs";
import * as sharp from "sharp";
import * as path from "path";

const { execSync, exec } = require('child_process');

const separatorBase = "--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";
export const NASPath = "//MOOMINLIBRARY";

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

export async function removesFilesFromAifExistsInB(pathA:string, pathB:string) {
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
		if(filesB.indexOf(getFileNameWithoutExtension(file)) > -1) {
			deleteFolder(path.join(pathA, file));
			// logBlue(`Will delete ${path.join(pathA, file)}`);
			deletedFiles++
		}
		return;
	}))

	logGreen(`Deleted ${deletedFiles} from ${pathA}`);
}

export function createFolder(folderPath:string) {
	if (!fs.existsSync(folderPath)){
		logYellow(`=> creating ${folderPath}`);
    	fs.mkdirSync(folderPath);
    }
}

export function deleteFolder(folderPath:string) {
	if (fs.existsSync(folderPath)){
		logYellow(`=> deleting ${folderPath}`);
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
}

//--summarize and --delete unfortunately not compatible
export function deleteDuplicates(folderPath:string) {
	const logFile = path.join(folderPath, "fdupelog.txt");
	execShell(`C:\\cygwin64\\bin\\bash.exe --login -c 'fdupes --delete --noprompt --sameline "${folderPath}" 2>&1 | tee -a "${logFile}"'`)

	const log = fs.readFileSync(logFile, 'utf8');
	console.log(log);
	logGreen(`=> Found and deleted ${log.split("[-]").length -1} duplicates`);

	const folder = path.dirname(logFile).replace(/\\/g, "/") + "/";
	console.log(folder);
	const filesFound = log.split("\n")
											.filter(file => file.indexOf(folder) > -1)
											.map(file => path.parse(file.split(folder)[1]).name);

	// deleteFolder(logFile);
	return filesFound;
}

export function deleteSimilar(folderPath:string, video?: boolean) {
	const logname = video ? "czkwlog-video.txt" : "czkwlog.txt";
	const tempLogFile = path.join(folderPath, logname);
	let deleted = 0;
	execShell(`E:\\Downloads\\windows_czkawka_cli.exe ${video ? "video" : "image"} --directories "${folderPath}" -f "${tempLogFile}"`);

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
			deleteFolder(file);
			deleted++;
		})
	});
	logGreen(`=> Found and deleted ${deleted} similar ${video ? "videos" : "images"}`);
	const filesFound = filesGroups.flat().map((file) => {
		return path.basename(file, path.extname(file))
	});
	return filesFound;
}

export function isFolder(path:string) {
	return path.split(".").length === 1;
}

export function logBlue(stringToLog:string) {
	console.log('\x1b[96m%s\x1b[0m', stringToLog);
}

export function logGreen(stringToLog:string) {
	console.log('\x1b[92m%s\x1b[0m', stringToLog);
}

export function logYellow(stringToLog:string) {
	console.log('\x1b[93m%s\x1b[0m', stringToLog);
}

export function logRed(stringToLog:string) {
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

export function execShell(command:string, isAsync?:boolean) {
	logLine();
	logYellow(" " + separator(30));
	logLine();
	logYellow(" executing following command:")
	logLine();
	logBlue("" + command);
	logLine();
	logYellow(" " + separator(30));
	logLine();

	isAsync ?
	exec(command, {stdio:[0,1,2]})
	:
	execSync(command, {stdio:[0,1,2]});
}

export function separator(length:number) {
	return separatorBase.substr(0, length);
}
