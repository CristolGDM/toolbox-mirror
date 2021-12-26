"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSimilar = exports.deleteDuplicates = exports.cleanOthers = exports.cleanAfterUpscale = exports.cleanBeforeUpscale = exports.cleanDungeon = exports.cleanImaginary = void 0;
const fs = require("fs");
const utils = require("./utils");
const other_subs_1 = require("./assets/other-subs");
const wallpapers_1 = require("./wallpapers");
const path = require("path");
async function cleanImaginary(start) {
    const subs = (0, wallpapers_1.getImaginaryFolders)();
    let total = 0;
    let found = [];
    for (let i = start ?? 0; i < subs.length; i++) {
        const subPath = subs[i];
        const subName = path.basename(subPath);
        utils.logBlue(`Cleaning (${i + 1}/${subs.length}): ${subPath}`);
        const results = deleteDuplicates(subPath).length / 2;
        total += Math.ceil(results);
        found.push({ subName, amount: Math.ceil(results) });
        utils.logBlue(`Currently at ${total} total duplicate found`);
        console.log("");
        console.log("------------------------------------------------------------------------------------");
        console.log("------------------------------------------------------------------------------------");
        console.log("");
    }
    utils.logGreen(`========================`);
    utils.logGreen(`CLEANED ${total} DUPLICATES`);
    console.log("");
    utils.logGreen("SUMMARY:");
    found.filter(el => el.amount > 0).sort((a, b) => { return a.amount - b.amount; }).forEach((element) => {
        utils.logGreen(`${element.subName}: ${element.amount} dupes`);
    });
    utils.logGreen(`========================`);
}
exports.cleanImaginary = cleanImaginary;
async function cleanDungeon(start) {
    const subs = (0, wallpapers_1.getDungeonFolders)();
    let total = 0;
    let found = [];
    for (let i = start ?? 0; i < subs.length; i++) {
        const subPath = subs[i];
        const subName = path.basename(subPath);
        utils.logBlue(`Cleaning (${i + 1}/${subs.length}): ${subPath}`);
        const results1 = deleteSimilar(subPath).length / 2;
        utils.logBlue(`Still doing (${i + 1}/${subs.length}): ${subPath}...`);
        const results2 = deleteDuplicates(subPath).length / 2;
        total += Math.ceil(results1);
        total += Math.ceil(results2);
        found.push({ subName, amount: Math.ceil(Math.ceil(results1) + Math.ceil(results2)) });
        utils.logBlue(`Currently at ${total} total duplicate found`);
        console.log("");
        console.log("------------------------------------------------------------------------------------");
        console.log("------------------------------------------------------------------------------------");
        console.log("");
    }
    utils.logGreen(`========================`);
    utils.logGreen(`CLEANED ${total} DUPLICATES`);
    console.log("");
    utils.logGreen("SUMMARY:");
    found.filter(el => el.amount > 0).sort((a, b) => { return a.amount - b.amount; }).forEach((element) => {
        utils.logGreen(`${element.subName}: ${element.amount} dupes`);
    });
    utils.logGreen(`========================`);
}
exports.cleanDungeon = cleanDungeon;
async function cleanBeforeUpscale() {
    const timerLabel = "cleaning before upscale took:";
    console.time(timerLabel);
    const folders = (0, wallpapers_1.getUpscaleFolders)();
    const knownDupesRaw = fs.readFileSync(wallpapers_1.knownDupesPath, "utf8");
    const knownDupes = await JSON.parse(knownDupesRaw);
    let found = [];
    for (let index = 0; index < folders.length; index++) {
        const folder = folders[index];
        const folderName = path.basename(folder);
        if (!fs.existsSync(folder)) {
            console.log(`${index + 1}/${folders.length}: ${folder} doesn't exist`);
            continue;
        }
        const foundDupes = deleteDuplicates(folder);
        foundDupes.map((dupe) => { knownDupes[dupe] = true; });
        const foundDupes2 = deleteSimilar(folder);
        foundDupes2.map((dupe) => { knownDupes[dupe] = true; });
        const results = Math.ceil(foundDupes.length / 2) + Math.ceil(foundDupes2.length / 2);
        found.push({ subName: folderName, amount: Math.ceil(results) });
        console.log(`Finished cleaning ${index + 1}/${folders.length}`);
    }
    fs.writeFileSync(wallpapers_1.knownDupesPath, JSON.stringify(knownDupes, null, 2));
    console.log("");
    utils.logGreen("SUMMARY:");
    found.filter(el => el.amount > 0).sort((a, b) => { return a.amount - b.amount; }).forEach((element) => {
        utils.logGreen(`${element.subName}: ${element.amount} dupes`);
    });
    console.timeEnd(timerLabel);
}
exports.cleanBeforeUpscale = cleanBeforeUpscale;
async function cleanAfterUpscale() {
    const timerLabel = "cleaning after upscale took:";
    console.time(timerLabel);
    const folders = (0, wallpapers_1.getFinalFolders)();
    const knownDupesRaw = fs.readFileSync(wallpapers_1.knownDupesPath, "utf8");
    const knownDupes = await JSON.parse(knownDupesRaw);
    for (let index = 0; index < folders.length; index++) {
        const folder = folders[index];
        if (!fs.existsSync(folder)) {
            console.log(`${index + 1}/${folders.length}: ${folder} doesn't exist`);
            continue;
        }
        const foundDupes = deleteDuplicates(folder);
        foundDupes.map((dupe) => { knownDupes[dupe] = true; });
        const foundDupes2 = deleteSimilar(folder);
        foundDupes2.map((dupe) => { knownDupes[dupe] = true; });
        console.log(`Finished cleaning ${index + 1}/${folders.length}`);
    }
    fs.writeFileSync(wallpapers_1.knownDupesPath, JSON.stringify(knownDupes, null, 2));
    console.timeEnd(timerLabel);
}
exports.cleanAfterUpscale = cleanAfterUpscale;
function cleanOthers() {
    let folders = [...new Set(Object.keys(other_subs_1.subs).map(key => other_subs_1.subs[key].folderPath))];
    for (let index = 0; index < folders.length; index++) {
        const folder = folders[index];
        if (!fs.existsSync(folder)) {
            console.log(`${index + 1}/${folders.length}: ${folder} doesn't exist`);
            continue;
        }
        deleteDuplicates(folder);
        deleteSimilar(folder);
        deleteSimilar(folder, true);
        console.log(`Finished cleaning ${index + 1}/${folders.length}`);
    }
}
exports.cleanOthers = cleanOthers;
function deleteDuplicates(folderPath) {
    const timerName = `deleteDuplicates() for ${path.basename(folderPath)} took:`;
    console.time(timerName);
    const cleanedFolderPath = folderPath.replace(/\\/g, "/");
    const logFile = path.join(cleanedFolderPath, "fdupelog.txt");
    utils.execShell(`C:\\cygwin64\\bin\\bash.exe --login -c 'fdupes --delete --noprompt --sameline "${cleanedFolderPath}" 2>&1 | tee -a "${logFile.replace(/\\/g, "/")}" '`);
    const log = fs.readFileSync(logFile, 'utf8');
    console.log(log);
    utils.logGreen(`=> Found and deleted ${log.split("[-]").length - 1} duplicates`);
    const folder = path.dirname(logFile).replace(/\\/g, "/") + "/";
    console.log(folder);
    const filesFound = log.split("\n")
        .filter(file => file.indexOf(folder) > -1)
        .map(file => path.parse(file.split(folder)[1]).name);
    console.timeEnd(timerName);
    return filesFound;
}
exports.deleteDuplicates = deleteDuplicates;
function deleteSimilar(folderPath, video) {
    const timerName = `deleteSimilar() for ${path.basename(folderPath)} took:`;
    console.time(timerName);
    const cleanedFolderPath = folderPath.replace(/\\/g, "/");
    const logname = video ? "czkwlog-video.txt" : "czkwlog.txt";
    const tempLogFile = path.join(cleanedFolderPath, logname);
    let deleted = 0;
    utils.execShell(`L:\\Downloads\\windows_czkawka_cli.exe ${video ? "video" : "image"} --directories "${cleanedFolderPath}" -f "${tempLogFile}"`);
    const log = fs.readFileSync(tempLogFile, 'utf8').split("\n");
    let filesGroups = [];
    let temp = [];
    log.map(line => {
        if (line && line.length) {
            temp.push(line);
        }
        else if (temp.length) {
            filesGroups.push(temp);
            temp = [];
        }
    });
    if (temp.length > 0) {
        filesGroups.push(temp);
    }
    filesGroups = filesGroups.filter((group) => { return group.length >= 3; })
        .map((group) => {
        group.shift();
        group = group.map((file) => {
            let split = file.split(" - ");
            split = split.slice(0, video ? -1 : -3);
            return split.join(" - ");
        });
        return group;
    });
    filesGroups.forEach((group) => {
        const files = [...group];
        files.shift();
        files.forEach((file) => {
            utils.deleteFolder(file);
            deleted++;
        });
    });
    utils.logGreen(`=> Found and deleted ${deleted} similar ${video ? "videos" : "images"}`);
    const filesFound = filesGroups.flat().map((file) => {
        return path.basename(file, path.extname(file));
    });
    console.timeEnd(timerName);
    return filesFound;
}
exports.deleteSimilar = deleteSimilar;
