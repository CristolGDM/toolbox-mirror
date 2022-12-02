import * as utils from "./utils";
import * as path from "path";
import * as fs from "fs";

import {subs as imaginarySubs} from "./assets/imaginary-subs";
import {subs as otherSubs} from "./assets/other-subs";
import {subs as dungeonSubs} from "./assets/dungeon-subs";

export const validTimeValues = {
	all: "all" as const,
	year: "year" as const,
	month: "month" as const,
	week: "week" as const,
	day: "day" as const
}

const NASPath = utils.NASPath;
const PicturesPath = `${NASPath}/pictures`;
const ImaginaryNetworkPath = `${PicturesPath}/imaginary-network/`;

const nhDownloadFolder = "K:/_SPECIAL_/zzzDrawings";
const nhUsedFolder = "K:/_SPECIAL_/Drawings";

const forbiddenDomains = ["instagram.fbna1-2.fna.fbcdn.net", "instagram.fbna1-1.fna.fbcdn.net", "youtube.com", "youtu.be", "jp.spankbang.com", "xhamster.com", "xhamster49.com"];
export const forbiddenUsers = ["GaroShadowscale", "vodcato-ventrexian", "Tundra_Echo", "VedaDragon", "BeardyBennett", "CharmanterPanter", "Ikiera",
"RedPersik", "TheGamedawg", "Meraugis", "NeoTheProtogen", "SnickerToodles", "UnpaidPigeon", "kazmatazzzz", "Jaybaybay2838", 
"Lovable-Peril", "MagmaHotsguy", "Marmasghetti", "jaco147", "geergutz", "ClayEnchanter", "castass", "ZENRAMANIAC", "KronalgalVas",
"B0B_22", "Taguel16", "Cab0san", "RowzeiChan", "Hollz23", "TripleA2006", "championsgamer1", "Reykurinn", "AgentB90",
"comics0026", "AimlessGrace", "axes_and_asses", "ImperatorZor", "HellsJuggernaut", "angelberries", "FoolishMacaroni",
"nbolen13", "Space_Fox586", "EwokTheGreatPrp", "EmeraldScales", "ClassicFrancois18", "pweavd", "smolb0i", "improy",
"redcomet0079", "BadSpellign", "Cromwell300", "Meadowlark", "Ambratolm", "Caliglo37", "veronicasylvaxxx", "EmmaStrawberrie","Galind_Halithel", "adran23452", "CreatureCreator101", "EpicoSama", "infinitypilot", "Complete_Regret7372", "Northern_Hermit", "Person_Maybe", "Soliloquis", "TUG310000", "Philotics", "ArtsArukana", "Rockastorm", "TheLaVeyan", "long_soi", "BBMsReddit", "Multiverse_Queen", "Daily_Scrolls_516", "Darkcasfire", "DoomlightTheSuperior", "TyrannoNinja", "Signal-World-5009", "shuikan", "Ok-Abbreviations-117", "Dyno_Coder", "IvanDFakkov", "Jyto-Radam", "MrCatCZ", "DrSecksy", "Alden_Is_Happy", "Apollo037", "Luftwagen", "pewdiewolf", "RedHood866", "LordWeaselton", "Eden6", "Yepuge", "Spader113", "VorgBardo", "technickr", "TheGeneral1899", "shinarit", "Trigger-red_cannibl", "RobertLiuTrujillo", "okeamu", "MissingAI"];

export function redditDownload(folderPath: string, subreddits: string, options: bdfrOptions) {
	const { time, limit, skipExisting, additionalArguments, openFolder} = options;
	const usedTime = time && validTimeValues[time] ? validTimeValues[time] : validTimeValues.all;
	utils.logYellow(`Downloading files from top of ${usedTime}`);
	const usedLimit = limit ? limit : 1000;
	const additional = additionalArguments ? ` ${additionalArguments}` : "";
	const skippedDomains = forbiddenDomains.map(domain => `--skip-domain "${domain}"`).join(" ");
	const skippedUsers = forbiddenUsers.map(user => `--ignore-user "${user}"`).join(" ");
	const skipExistingParam = skipExisting ? "--search-existing" : "";

	const logPath = path.join(path.dirname(folderPath), "bdfr_logs");
	if(openFolder) {
		utils.createFolder(folderPath);
		utils.execShell(`"C:/Program Files/XnViewMP/xnviewmp.exe" "${folderPath}"`, true)
	}
	utils.execShell(`py -m bdfr download "${folderPath}" \
									--subreddit "${subreddits}" --sort top --no-dupes ${skipExistingParam} \
									--folder-scheme "./" --file-scheme "{SUBREDDIT}_{REDDITOR}_{TITLE}_{POSTID}" \
									${skippedDomains}	${skippedUsers} \
									--log "${logPath}" \
									--max-wait-time 30 --time "${usedTime}" --limit ${usedLimit} --skip "txt" \
									${additional} --verbose`)
}

function sectionDownload(section: bdfrSection, options: Omit<bdfrOptions, "time" | "skipExisting">) {
	const {limit} = options;
	const categories = Object.keys(section);

	for (let i = 0; i < categories.length; i++) {
		const category = categories[i];
		const {folderPath, subreddits, limit: categoryLimit} = section[category];
		
		utils.logLine();
		utils.logBlue(`Downloading ${category}, folder ${i+1}/${categories.length}`);
		utils.logLine();

		redditDownload(folderPath ? folderPath : path.join(ImaginaryNetworkPath, category), subreddits, {...options, time: validTimeValues.month, limit: categoryLimit ? categoryLimit : limit, skipExisting: false})
	}
}

export function imaginaryDownload() {
	sectionDownload(imaginarySubs, {limit: 200, openFolder: true})
};

export function otherDownload() {
	sectionDownload(otherSubs, {limit: 800, openFolder: false});
}

export function dungeonDownload() {
	sectionDownload(dungeonSubs, {limit: 50});
}

export function redditCatchup(folderPath: string, subredditName: string, openFolder: boolean) {
	redditDownload(folderPath, subredditName, {time: validTimeValues.all, openFolder});
	redditDownload(folderPath, subredditName, {time: validTimeValues.year, openFolder});
	redditDownload(folderPath, subredditName, {time: validTimeValues.month, openFolder});
}

export function generateArtPreviews() {
	const folders = fs.readdirSync(nhUsedFolder);
	folders.forEach((folder) => {
		const files = fs.readdirSync(`${nhUsedFolder}/${folder}`);
	
		if(files.findIndex(file => file.startsWith("folder.jpg")) > -1) {
			console.log("=> folder pic exists already");
			return;
		}
	
		console.log(utils.separator(18));
		console.log(`${folder}:`);
		console.log(utils.separator(18));
	
		const originalPictureName = files.find(file => file.startsWith("001"));
		const originalPicture = fs.readFileSync(`${nhUsedFolder}/${folder}/${originalPictureName}`)
		if(!originalPicture) {
			console.error("no picture");
			return;
		}
		fs.writeFileSync(`${nhUsedFolder}/${folder}/folder.jpg`, originalPicture)
		console.log("=> done");
	});
}

export function sortArt() {
	const folders = fs.readdirSync(nhDownloadFolder);

	folders.forEach(async (folder) => {
		const downloadedFolder = path.join(nhDownloadFolder, folder);
		const metadata: artMetadata = await JSON.parse(fs.readFileSync(`${downloadedFolder}/metadata.json`, "utf-8"));
	
		console.log(folder);
		if(!metadata) {
			console.error(`Missing metadata for ${folder}`)
			return;
		}
	
		console.log(metadata.title);
	
		let shortTitle = metadata.title.replace(/ *\([^)]*\) */g, "").replace(/ *\[[^\]]*]/g, '').replace(/{([^}]+)}/g, '').replace(/\s\s+/g, ' ');
	
		if(shortTitle.indexOf("|") > -1) {
			shortTitle = shortTitle.split("|")[1];
		}
	
		let parody = metadata.parody ? `${metadata.parody.join(",")}` : "original";
		if(parody.indexOf("|") > -1) {
			parody = parody.split("|")[0].trim()
		}
	
		const authors = !metadata.artist ? metadata.group ? metadata.group : ["Unknown"] : metadata.artist.length > 3 ? [metadata.artist[0],metadata.artist[1],metadata.artist[2], "etc"] : metadata.artist;
		let authorsFlat = authors.map(author => author.split("|")[0]).join(",");
		authorsFlat = authorsFlat.charAt(0).toUpperCase() + authors.slice(1);
	
		const id = metadata.URL.split("/").pop();
	
		let newTitle = `${authors} - ${shortTitle} (${parody}) [${id}]`;
	
		newTitle = newTitle.replace(/[/\\?%*:|~"<>]/g, '-').replace(/\s\s+/g, ' ').trim();
	
		const newPath = path.join(nhUsedFolder, newTitle);
	
		if(fs.existsSync(newPath)) {
			console.log("=> exists already")
			return;
		}
	
		console.log("=>" + newTitle);
		console.log(utils.separator(18));
	
		fs.mkdirSync(newPath);
	
		const files = fs.readdirSync(downloadedFolder);
	
		files.forEach((file) => {
			console.log(`${file}...`)
			fs.writeFileSync(path.join(newPath, file), fs.readFileSync(path.join(downloadedFolder, file)))
		});

		utils.logGreen(`Finished migrating ${newTitle}`);
	
	});
}

export async function cleanUnwanted() {
	let found = 0;
	let  folders = Object.keys(imaginarySubs).map(key => imaginarySubs[key].folderPath);
	folders = folders.concat(Object.keys(otherSubs).map(key => otherSubs[key].folderPath));
	folders = folders.concat(Object.keys(dungeonSubs).map(key => dungeonSubs[key].folderPath));
	folders.push("E:\\Pictures\\zzzWallpapers temp");
	folders.push("E:\\Pictures\\zzzWallpapers temp-toscale");
	folders.push("E:\\Pictures\\zzzWallpapers temp-upscaled");
	folders.push("E:\\Pictures\\zzzWallpapers to downscale");
	folders.push("E:\\Pictures\\zzzWallpapers mobile temp");
	folders.push("E:\\Pictures\\zzzWallpapers mobile temp-toscale");
	folders.push("E:\\Pictures\\zzzWallpapers mobile temp-upscaled");
	folders.push("E:\\Pictures\\zzzWallpapers mobile to downscale");
	
	folders.forEach(async (folderRaw) => {
		const folder = folderRaw.replace(/\\/g, "/");
		let folderFound = 0;
		if(!fs.existsSync(folder)) {
			utils.logYellow(`${folder} has not been created yet`);
			return;
		}
		const files = fs.readdirSync(folder);
		files.forEach((file) => {
			let shouldDelete = false;
			if(folder.indexOf("mobile") === -1 
				&& (
					file.toLowerCase().startsWith("animephonewallpapers") || 
					file.toLowerCase().startsWith("mobilewallpaper") || 
					file.toLowerCase().startsWith("verticalwallpapers")
				)) {
					shouldDelete = true;
				}
			else if(file.split("_").length > 1) {
				const begin = file.split("_")[0];
				const shortName = file.replace(begin + "_", "");
				shouldDelete = !!forbiddenUsers.find((user) => {return shortName.startsWith(user)});
			}

			if(!shouldDelete) {
				return;
			}
			utils.deleteFolder(path.join(folder, file));
			found++;
			folderFound++;
		});
		if(folderFound > 0) {
			utils.logGreen(`Deleted ${folderFound} from ${path.basename(folder)}`);
		}
	});
	utils.logBlue(`Deleted ${found} not so pretty pictures`);
}

// function cleanImaginary() {
// 	let  folders = Object.keys(imaginarySubs).map(key => imaginarySubs[key].folderPath);
// 	folders = folders.concat(Object.keys(dungeonSubs).map(key => dungeonSubs[key].folderPath));

// 	for (let index = 0; index < folders.length; index++) {
// 		const folder = folders[index].replace(/\\/g, "/");
// 		if(!fs.existsSync(folder)) {
// 			console.log(`${index+1}/${folders.length}: ${folder} doesn't exist`);
// 			continue;
// 		}
// 		utils.deleteDuplicates(folder);
// 		console.log(`Finished cleaning ${index+1}/${folders.length}`)
// 	}
// }

export function cleanOthers() {
	let folders = [... new Set(Object.keys(otherSubs).map(key => otherSubs[key].folderPath))];

	for (let index = 0; index < folders.length; index++) {
		const folder = folders[index].replace(/\\/g, "/");
		if(!fs.existsSync(folder)) {
			console.log(`${index+1}/${folders.length}: ${folder} doesn't exist`);
			continue;
		}
		utils.deleteDuplicates(folder);
		utils.deleteSimilar(folder);
		utils.deleteSimilar(folder, true);
		console.log(`Finished cleaning ${index+1}/${folders.length}`)
	}
}

function test() {
	const testFolder = "E:/Pictures/temp";
	const dupes = utils.deleteDuplicates(testFolder);
	utils.logYellow("Found this:");
	console.log(dupes);
	return;
}

interface bdfrOptions {
	time?: keyof typeof validTimeValues,
	limit?: number,
	skipExisting?: boolean,
	additionalArguments?: string,
	openFolder?: boolean
}

interface artMetadata {
	artist: string[],
	group: string[],
	parody: string[],
	title: string,
	URL: string
}

export interface bdfrSub {
	subreddits: string,
	folderPath?: string,
	limit?: number
}

export type bdfrSection = { [key: string]: bdfrSub; }