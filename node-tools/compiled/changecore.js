fs = require("fs");
const foldersLocation = "R:/PCSX2 1.7.0 dev/inis";
const separator = "--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";
const folders = fs.readdirSync(foldersLocation);
folders.forEach((folder) => {
    console.log(folder);
    if (folder.endsWith(".ini")) {
        return;
    }
    const oldGS = fs.readFileSync(`${foldersLocation}/${folder}/GS.ini`, "utf-8");
    const newGS = oldGS.replace("extrathreads = 2", "extrathreads = 6\nextrathreads_height = 4");
    fs.writeFileSync(`${foldersLocation}/${folder}/GS.ini`, newGS);
    console.log("...done");
});
