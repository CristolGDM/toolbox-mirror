fs = require("fs");
https = require("https");
axios = require("axios");
sqlite3 = require("sqlite3")

const metadataPath = "R:/Playnite/library/files/";
const libraryPath = "R:/Playnite/library/games.db";
const separator = "--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";

const compact = true;
const downloaded = [];

const db = new sqlite3.Database(libraryPath, sqlite3.OPEN_READONLY);

db.serialize(function () {
    db.all(
      'SELECT name FROM sqlite_master WHERE type="table"',
      function (err, rows) {
        if(err) {
            console.log(err);
        }
        const result = [];
        if(!rows) {
            return "Row doesnt exist"
        }
        rows.forEach(
          (table) => db.all('SELECT * FROM ' + table.name),
          function (err, innerRows) {
            result.push(innerRows);
          }
        );
        console.log(result)
      }
    );
  });

// fs.readdir(descriptionPath, async (err, files) => {
//     for (let i = 0; i < files.length; i++) {
//         await downloadAll(files[i]);
//         // if(!compact) {
//         //     console.log(`${i+1} out of ${files.length} done`);
//         // }
//     }
// });

async function downloadAll(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(descriptionPath+fileName, "utf-8", async (err,data) => {
        const parsedData =JSON.parse(data);

        const description = parsedData.Description;
        const destination = metadataPath+fileName.replace(".json","");
        const regexp = /(?<=src=")(.*?)(?=")/g;
        const images = description ? [...description.matchAll(regexp)] : [];

        const checked = [];

        for (let i = 0; i < images.length; i++) {
            let imageUrl = images[i][0];

            if(imageUrl.startsWith("file:///")) {
            	continue;
            }

            if(imageUrl.startsWith("https://static.giantbomb.com/api/")) {
            	console.log(`${parsedData.Name} still has a static image`);
                continue;
            }

            imageUrl = imageUrl.replace("https://static.giantbomb.com/uploads/", "https://www.giantbomb.com/a/uploads/");

            const imageName = imageUrl.replace("/?", "?").split("?")[0].split("/").pop();
            const destinationFile = destination+"/"+imageName+(imageUrl.indexOf("steamuserimages") > -1 ? ".png" : "");

            if(fs.existsSync(destinationFile) || fs.existsSync(destinationFile.replace(".jpg", ".png"))){
                if(!compact) {
                    console.log("...already downloaded");
                }
                continue;
            }

            if(imageUrl.startsWith("data")) {
                if(!compact) {
                    console.log("...ignoring data url");
                }
                continue;
            }

            if(checked.indexOf(imageName) > -1){
                if(!compact) {
                    console.log("...double URL");
                }
                continue;
            }

            if(imageUrl.indexOf("scale_small") > -1) {
                if(!compact) {
                    console.log("...checking for upscale");
                }
                const exist = await urlExist(imageUrl.replace("scale_small", "original"));
                imageUrl = exist ? imageUrl.replace("scale_small", "original") : imageUrl.replace("scale_small", "scale_large");
            }

            if(imageUrl.indexOf("scale_medium") > -1) {
                if(!compact) {
                    console.log("...checking for upscale");
                }
                const exist = await urlExist(imageUrl.replace("scale_medium", "original"));
                imageUrl = exist ? imageUrl.replace("scale_medium", "original") : imageUrl.replace("scale_medium", "scale_large");
            }

            if(imageUrl.indexOf("square_avatar") > -1) {
                if(!compact) {
                    console.log("...checking for avatar upscale");
                }
                const exist = await urlExist(imageUrl.replace("square_avatar", "original"));
                imageUrl = exist ? imageUrl.replace("square_avatar", "original") : imageUrl.replace("square_avatar", "scale_large");
            }

            // if(!compact) {
		        if(downloaded.indexOf(fileName) === -1) {
		            console.log(" ");
		            console.log("   "  + separator.substr(0, parsedData.Name.length  + 8));
		            console.log("   |   " + parsedData.Name + "   |");
		            console.log("   "  + separator.substr(0, parsedData.Name.length  + 8));
            		downloaded.push(fileName);
		        }
            // }

            checked.push(imageName);
            // if(!compact) {
                console.log(imageUrl);
                console.log("Downloading...");
            // }

            await downloadFile(imageUrl, destinationFile);

            // if(!compact) {
                console.log("=> Success");
                console.log(" ");
            // } else {
                // console.log(`${parsedData.Name} => ${fileName.replace(".json", "")}`);
            // }
        }

        resolve();
        })
    })
}

async function downloadFile(fileUrl, outputLocationPath) {
  const writer = fs.createWriteStream(outputLocationPath);

  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  }).then(response => {

    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.

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
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
}

async function urlExist(url) {
  try {
    await axios.head(url);
    return true;
  } catch (error) {
      if(!error.response) {
        console.log("!!!");
        console.log(error);
        console.log("!!!");
      }
      if (error.response.status >= 400) {
        return false;
      }
  }
}