"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.separator = exports.execShell = exports.yellowString = exports.greenString = exports.blueString = exports.redString = exports.logLine = exports.logRed = exports.logYellow = exports.logGreen = exports.logBlue = exports.isFolder = exports.deleteFolder = exports.openImageFolder = exports.createFolder = exports.removesFilesFromAifExistsInB = exports.fileExistsAnyExtension = exports.getListOfFilesWithoutExtension = exports.getFileNameWithoutExtension = exports.ImaginaryPath = exports.PicturesPath = exports.NASPath = void 0;
const fs = require("fs");
const path = require("path");
const { execSync, exec } = require('child_process');
const separatorBase = "--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";
exports.NASPath = "//MOOMINLIBRARY";
exports.PicturesPath = `${exports.NASPath}/pictures`;
exports.ImaginaryPath = `${exports.PicturesPath}/imaginary-network`;
function getFileNameWithoutExtension(fileName) {
    const nameSplit = fileName.split(".");
    nameSplit.pop();
    return nameSplit.join(".");
}
exports.getFileNameWithoutExtension = getFileNameWithoutExtension;
function getListOfFilesWithoutExtension(folderPath) {
    return fs.readdirSync(folderPath).map(getFileNameWithoutExtension);
}
exports.getListOfFilesWithoutExtension = getListOfFilesWithoutExtension;
function fileExistsAnyExtension(file, folderPath) {
    const files = getListOfFilesWithoutExtension(folderPath);
    const fileName = getFileNameWithoutExtension(file);
    return files.indexOf(fileName) > -1;
}
exports.fileExistsAnyExtension = fileExistsAnyExtension;
async function removesFilesFromAifExistsInB(pathA, pathB) {
    if (!fs.existsSync(pathA)) {
        logYellow(`${pathA} doesn't exist`);
        return;
    }
    if (!fs.existsSync(pathB)) {
        logYellow(`${pathB} doesn't exist`);
        return;
    }
    const filesA = fs.readdirSync(pathA);
    const filesB = getListOfFilesWithoutExtension(pathB);
    logBlue(`${pathA} has ${filesA.length} files`);
    logBlue(`${pathB} has ${filesB.length} files`);
    let deletedFiles = 0;
    await Promise.all(filesA.map(async (file, index) => {
        if (filesB.indexOf(getFileNameWithoutExtension(file)) > -1) {
            deleteFolder(path.join(pathA, file));
            deletedFiles++;
        }
        return;
    }));
    logGreen(`Deleted ${deletedFiles} from ${pathA}`);
}
exports.removesFilesFromAifExistsInB = removesFilesFromAifExistsInB;
function createFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
        logYellow(`=> creating ${folderPath}`);
        fs.mkdirSync(folderPath, { recursive: true });
    }
}
exports.createFolder = createFolder;
function openImageFolder(folderPath) {
    createFolder(folderPath);
    execShell(`"C:/Program Files/XnViewMP/xnviewmp.exe" "${folderPath}"`, true);
}
exports.openImageFolder = openImageFolder;
function deleteFolder(folderPath) {
    if (fs.existsSync(folderPath)) {
        logYellow(`=> deleting ${folderPath}`);
        fs.rmSync(folderPath, { recursive: true, force: true });
    }
}
exports.deleteFolder = deleteFolder;
function isFolder(path) {
    return path.split(".").length === 1;
}
exports.isFolder = isFolder;
function logBlue(stringToLog) {
    console.log('\x1b[96m%s\x1b[0m', stringToLog);
}
exports.logBlue = logBlue;
function logGreen(stringToLog) {
    console.log('\x1b[92m%s\x1b[0m', stringToLog);
}
exports.logGreen = logGreen;
function logYellow(stringToLog) {
    console.log('\x1b[93m%s\x1b[0m', stringToLog);
}
exports.logYellow = logYellow;
function logRed(stringToLog) {
    console.log('\x1b[91m%s\x1b[0m', stringToLog);
}
exports.logRed = logRed;
function logLine() {
    console.log(" ");
}
exports.logLine = logLine;
function redString(stringToLog) {
    return `\x1b[91m${stringToLog}\x1b[0m`;
}
exports.redString = redString;
function blueString(stringToLog) {
    return `\x1b[96m${stringToLog}\x1b[0m`;
}
exports.blueString = blueString;
function greenString(stringToLog) {
    return `\x1b[92m${stringToLog}\x1b[0m`;
}
exports.greenString = greenString;
function yellowString(stringToLog) {
    return `\x1b[93m${stringToLog}\x1b[0m`;
}
exports.yellowString = yellowString;
function execShell(command, isAsync) {
    logLine();
    logYellow(" " + separator(30));
    logLine();
    logYellow(" executing following command:");
    logLine();
    logBlue("" + command);
    logLine();
    logYellow(" " + separator(30));
    logLine();
    isAsync ?
        exec(command, { stdio: [0, 1, 2] })
        :
            execSync(command, { stdio: [0, 1, 2] });
}
exports.execShell = execShell;
function separator(length) {
    return separatorBase.substr(0, length);
}
exports.separator = separator;
