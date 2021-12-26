fs = require("fs");
path = require("path");
const utils = require("./utils.js");
const foldersLocation = "E:/Pictures/Screenshots comparison";
const outputFolder = "_comparison";
const mappings = {
    "Screenshots original": "0_original",
    "Screenshots Lollypop": "1_lollypop",
    "Screenshots NMKD": "2_nmkd",
    "Screenshots Remacri": "3_remacri",
    "Screenshots Ultrasharp": "4_ultrasharp",
    "Screenshots UniversalV2": "5_universal",
    "Screenshots UniversalV2 - sharp": "6_universal_sharp",
    "Screenshots UniversalV2 - sharper": "7_universal_sharper"
};
const folders = fs.readdirSync(foldersLocation);
utils.createFolder(path.join(foldersLocation, outputFolder));
for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    const games = fs.readdirSync(path.join(foldersLocation, folder));
    for (var j = 0; j < games.length; j++) {
        const game = games[j];
        utils.createFolder(path.join(foldersLocation, outputFolder, game));
        const images = fs.readdirSync(path.join(foldersLocation, folder, game));
        for (var k = 0; k < images.length; k++) {
            const image = images[k];
            fs.renameSync(path.join(foldersLocation, folder, game, image), path.join(foldersLocation, outputFolder, game, image.replace(".", `_${mappings[folder]}.`)));
        }
    }
}
