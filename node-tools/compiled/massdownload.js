fs = require("fs");
https = require("https");
axios = require("axios");
const metadataPath = "R:/Playnite/library/files/";
const libraryPath = "R:/Playnite/library/games.db";
const separator = "--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";
const compact = true;
const downloaded = [];
async function downloadAll(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(descriptionPath + fileName, "utf-8", async (err, data) => {
            const parsedData = JSON.parse(data);
            const description = parsedData.Description;
            const destination = metadataPath + fileName.replace(".json", "");
            const regexp = /(?<=src=")(.*?)(?=")/g;
            const images = description ? [...description.matchAll(regexp)] : [];
            const checked = [];
            for (let i = 0; i < images.length; i++) {
                let imageUrl = images[i][0];
                if (imageUrl.startsWith("file:///")) {
                    continue;
                }
                if (imageUrl.startsWith("https://static.giantbomb.com/api/")) {
                    console.log(`${parsedData.Name} still has a static image`);
                    continue;
                }
                imageUrl = imageUrl.replace("https://static.giantbomb.com/uploads/", "https://www.giantbomb.com/a/uploads/");
                const imageName = imageUrl.replace("/?", "?").split("?")[0].split("/").pop();
                const destinationFile = destination + "/" + imageName + (imageUrl.indexOf("steamuserimages") > -1 ? ".png" : "");
                if (fs.existsSync(destinationFile) || fs.existsSync(destinationFile.replace(".jpg", ".png"))) {
                    if (!compact) {
                        console.log("...already downloaded");
                    }
                    continue;
                }
                if (imageUrl.startsWith("data")) {
                    if (!compact) {
                        console.log("...ignoring data url");
                    }
                    continue;
                }
                if (checked.indexOf(imageName) > -1) {
                    if (!compact) {
                        console.log("...double URL");
                    }
                    continue;
                }
                if (imageUrl.indexOf("scale_small") > -1) {
                    if (!compact) {
                        console.log("...checking for upscale");
                    }
                    const exist = await urlExist(imageUrl.replace("scale_small", "original"));
                    imageUrl = exist ? imageUrl.replace("scale_small", "original") : imageUrl.replace("scale_small", "scale_large");
                }
                if (imageUrl.indexOf("scale_medium") > -1) {
                    if (!compact) {
                        console.log("...checking for upscale");
                    }
                    const exist = await urlExist(imageUrl.replace("scale_medium", "original"));
                    imageUrl = exist ? imageUrl.replace("scale_medium", "original") : imageUrl.replace("scale_medium", "scale_large");
                }
                if (imageUrl.indexOf("square_avatar") > -1) {
                    if (!compact) {
                        console.log("...checking for avatar upscale");
                    }
                    const exist = await urlExist(imageUrl.replace("square_avatar", "original"));
                    imageUrl = exist ? imageUrl.replace("square_avatar", "original") : imageUrl.replace("square_avatar", "scale_large");
                }
                if (downloaded.indexOf(fileName) === -1) {
                    console.log(" ");
                    console.log("   " + separator.substr(0, parsedData.Name.length + 8));
                    console.log("   |   " + parsedData.Name + "   |");
                    console.log("   " + separator.substr(0, parsedData.Name.length + 8));
                    downloaded.push(fileName);
                }
                checked.push(imageName);
                console.log(imageUrl);
                console.log("Downloading...");
                await downloadFile(imageUrl, destinationFile);
                console.log("=> Success");
                console.log(" ");
            }
            resolve();
        });
    });
}
async function downloadFile(fileUrl, outputLocationPath) {
    const writer = fs.createWriteStream(outputLocationPath);
    return axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }).then(response => {
        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(true);
                }
            });
        });
    });
}
async function urlExist(url) {
    try {
        await axios.head(url);
        return true;
    }
    catch (error) {
        if (!error.response) {
            console.log("!!!");
            console.log(error);
            console.log("!!!");
        }
        if (error.response.status >= 400) {
            return false;
        }
    }
}
