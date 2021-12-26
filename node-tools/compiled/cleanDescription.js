const fs = require("fs");
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const metadataPath = "R:/Playnite/library/files/";
const oldMetadataPath = "C:/Users/Cristol/AppData/Roaming/Playnite/library/files/";
const descriptionPath = "R:/Playnite/library/games/";
const oldDescriptionPath = "C:/Users/Cristol/AppData/Roaming/Playnite/library/games/";
const gameID = "00542294-0e93-4f3b-887a-96170ba342f0.json";
const separator = "--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";
const hasStatic = [];
const files = fs.readdirSync(descriptionPath);
for (let i = 0; i < files.length; i++) {
    clean(files[i]);
    if (i % 100 === 0) {
        console.log(`Cleaned ${i} out of ${files.length}`);
    }
}
if (hasStatic.length > 0) {
    console.log(separator.substr(0, 12));
    console.log("Those still have invalid images");
    console.log(hasStatic);
}
function clean(fileName) {
    const data = fs.readFileSync(descriptionPath + fileName, "utf-8");
    const parsedData = JSON.parse(data);
    const description = parsedData.Description;
    const dom = new JSDOM(description);
    const doc = dom.window.document;
    [...doc.getElementsByTagName("NOSCRIPT")].forEach((elem) => { elem.remove(); });
    [...doc.getElementsByTagName("H1")].forEach(removeAttributes);
    [...doc.getElementsByTagName("H2")].forEach(removeAttributes);
    [...doc.getElementsByTagName("H3")].forEach(removeAttributes);
    [...doc.getElementsByTagName("H4")].forEach(removeAttributes);
    [...doc.getElementsByTagName("FIGURE")].forEach(removeAttributes);
    [...doc.getElementsByTagName("A")].forEach(cleanLinks);
    [...doc.getElementsByTagName("IMG")].forEach((image) => { cleanImage(image, metadataPath + fileName.replace(".json", "")); });
    const result = finalize(doc.documentElement.innerHTML);
    if (result.length === 0 || result.replace(/\s/g, "").length === 0) {
        throw new Error(`${parsedData.Name} is empty at ${descriptionPath + fileName}`);
    }
    if (result === parsedData.Description) {
        return;
    }
    const newFile = JSON.stringify({ ...parsedData, Description: result });
    fs.writeFileSync(descriptionPath + fileName, newFile);
    console.log(`Cleaned ${parsedData.Name}`);
}
function removeAttributes(elem) {
    while (elem.attributes.length > 0) {
        elem.removeAttribute(elem.attributes[0].name);
    }
}
function replaceAll(str, find, replace) {
    return str.split(find).join(replace);
}
function cleanLinks(link) {
    link.removeAttribute("class");
    link.removeAttribute("style");
    link.removeAttribute("data-ref-id");
}
function cleanImage(image, metadataFolder) {
    if (image.src.startsWith("file:///")) {
        return;
    }
    [...image.attributes].forEach((attr) => {
        if (attr.name === "alt" || attr.name === "src") {
            return;
        }
        if (attr.name === "data-src") {
            image.src = image.getAttribute("data-src");
        }
        image.removeAttribute(attr.name);
    });
    let imageName = image.src.replace("/?", "?").split("?")[0].split("/").pop().split('.').slice(0, -1).join('.');
    const newName = `${metadataFolder}/${imageName}`;
    const pngPath = `${newName}.png`;
    let backupFile = fs.readdirSync(metadataFolder).find((file) => {
        return file.indexOf(imageName) > -1;
    });
    if (!backupFile) {
        if (image.src.startsWith("https://static.giantbomb.com/api/")) {
            hasStatic.push(metadataFolder.split("/").pop());
            hasStatic.push(image.src);
            return;
        }
        console.log(`=> ${image.outerHTML}`);
        throw (new Error("file doesn't exist"));
    }
    const finalPath = fs.existsSync(pngPath) ? pngPath : `${metadataFolder}/${backupFile}`;
    image.src = `file:///${finalPath}`;
}
function finalize(docString) {
    docString = docString.replace("<head></head><body>", "");
    docString = docString.replace("</body>", "");
    docString = replaceAll(docString, "<p> </p>", "");
    docString = replaceAll(docString, "<p></p>", "");
    docString = replaceAll(docString, "<b> </b>", "");
    docString = replaceAll(docString, "<b></b>", "");
    docString = replaceAll(docString, "<em> </em>", "");
    docString = replaceAll(docString, "<em></em>", "");
    docString = replaceAll(docString, "</figure>\n\n", "</figure>");
    docString = replaceAll(docString, "</figure>", "</figure>\n\n");
    docString = replaceAll(docString, "</img>\n\n", "</img>");
    docString = replaceAll(docString, "</img>", "</img>\n\n");
    docString = replaceAll(docString, "</img>\n\n</figure>", "</img></figure>");
    docString = replaceAll(docString, "</p>\n\n", "</p>");
    docString = replaceAll(docString, "</p>", "</p>\n\n");
    docString = replaceAll(docString, "</h1>\n\n", "</h1>");
    docString = replaceAll(docString, "</h1>", "</h1>\n\n");
    docString = replaceAll(docString, "</h2>\n\n", "</h2>");
    docString = replaceAll(docString, "</h2>", "</h2>\n\n");
    docString = replaceAll(docString, "</h3>\n\n", "</h3>");
    docString = replaceAll(docString, "</h3>", "</h3>\n\n");
    docString = replaceAll(docString, "</h4>\n\n", "</h4>");
    docString = replaceAll(docString, "</h4>", "</h4>\n\n");
    docString = replaceAll(docString, "</ul>\n\n", "</ul>");
    docString = replaceAll(docString, "</ul>", "</ul>\n\n");
    docString = replaceAll(docString, 'href="/', 'href="https://www.giantbomb.com/');
    docString = replaceAll(docString, oldMetadataPath, metadataPath);
    return docString;
}
