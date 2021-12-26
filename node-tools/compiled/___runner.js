const utils = require("./utils.js");
const path = require("path");
const fs = require("fs");
const upscaler = require("./upscaler.js");
const wallpaperFolder = "E:/Pictures/Wallpapers";
const mobileFolder = "E:/Pictures/Wallpapers mobile";
const imaginaryFolder = "E:/Pictures/Imaginary Network";
const wallpaperTemp = "E:/Pictures/Wallpapers temp";
const mobileTemp = "E:/Pictures/Wallpapers mobile temp";
const outputFinal = "E:/Pictures/Wallpapers final";
const outputMobile = "E:/Pictures/Wallpapers mobile final";
const toScaleDesktop = "E:/Pictures/Wallpapers temp-toscale";
const toConvertDesktop = "E:/Pictures/Wallpapers temp-upscaled";
const toScaleMobile = "E:/Pictures/Wallpapers mobile temp-toscale";
const toConvertMobile = "E:/Pictures/Wallpapers mobile temp-upscaled";
upscaleDesktop();
async function convertDesktopFolder() {
    upscaler.convertFolderToJpg(toConvertDesktop, outputFinal);
}
async function cleanToScale() {
    const files = fs.readdirSync(toScaleDesktop);
    const finalFiles = utils.getListOfFilesWithoutExtension(outputFinal);
    let deleted = 0;
    files.forEach(file => {
        if (finalFiles.indexOf(utils.getFileNameWithoutExtension(file)) > -1) {
            utils.deleteFolder(path.join(toScaleDesktop, file));
            deleted += 1;
        }
    });
    utils.logLine();
    console.log(`Deleted ${utils.redString(deleted)} duplicate files`);
    utils.logLine();
    utils.deleteFolder(toConvertDesktop);
    utils.createFolder(toConvertDesktop);
}
async function upscaleDesktop() {
    upscaler.upscaleFolderToOutput(toScaleDesktop, toConvertDesktop, upscaler.models.uniscaleRestore);
}
