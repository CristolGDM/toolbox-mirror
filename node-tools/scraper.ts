import * as utils from "./utils";
import * as path from "path";
import * as fs from "fs";

import {subs as imaginarySubs} from "./assets/imaginary-subs";
import {subs as otherSubs} from "./assets/other-subs";
import {subs as dungeonSubs} from "./assets/dungeon-subs";
import { deleteDuplicates } from "./cleaner";
import { getFinalFolders, getImaginaryFolders, getUpscaleFolders } from "./wallpapers";

export const validTimeValues = {
	all: "all" as const,
	year: "year" as const,
	month: "month" as const,
	week: "week" as const,
	day: "day" as const
}

const nhDownloadFolder = "K:/_SPECIAL_/zzzDrawings";
const nhUsedFolder = "K:/_SPECIAL_/Drawings";

const forbiddenDomains = ["instagram.fbna1-2.fna.fbcdn.net", "instagram.fbna1-1.fna.fbcdn.net", "youtube.com", "youtu.be", "jp.spankbang.com", "xhamster.com", "xhamster49.com", "xhvictory.com"];
export const forbiddenUsers = ["GaroShadowscale", "vodcato-ventrexian", "Tundra_Echo", "VedaDragon", "BeardyBennett", "CharmanterPanter", "Ikiera",
"RedPersik", "TheGamedawg", "Meraugis", "NeoTheProtogen", "SnickerToodles", "UnpaidPigeon", "kazmatazzzz", "Jaybaybay2838", 
"Lovable-Peril", "MagmaHotsguy", "Marmasghetti", "jaco147", "geergutz", "ClayEnchanter", "castass", "ZENRAMANIAC", "KronalgalVas",
"B0B_22", "Taguel16", "Cab0san", "RowzeiChan", "Hollz23", "TripleA2006", "championsgamer1", "Reykurinn", "AgentB90",
"comics0026", "AimlessGrace", "axes_and_asses", "ImperatorZor", "HellsJuggernaut", "angelberries", "FoolishMacaroni",
"nbolen13", "Space_Fox586", "EwokTheGreatPrp", "EmeraldScales", "ClassicFrancois18", "pweavd", "smolb0i", "improy",
"redcomet0079", "BadSpellign", "Cromwell300", "Meadowlark", "Ambratolm", "Caliglo37", "veronicasylvaxxx", "EmmaStrawberrie","Galind_Halithel", "adran23452", "CreatureCreator101", "Nyao", "EpicoSama", "infinitypilot", "Complete_Regret7372", "Northern_Hermit", "Person_Maybe", "Soliloquis", "TUG310000", "Philotics", "ArtsArukana", "Rockastorm", "TheLaVeyan", "long_soi", "BBMsReddit", "Multiverse_Queen", "Daily_Scrolls_516", "Darkcasfire", "DoomlightTheSuperior", "TyrannoNinja", "Signal-World-5009", "shuikan", "Ok-Abbreviations-117", "Dyno_Coder", "IvanDFakkov", "Jyto-Radam", "MrCatCZ", "DrSecksy", "Alden_Is_Happy", "Apollo037", "Luftwagen", "pewdiewolf", "RedHood866", "LordWeaselton", "Eden6", "Yepuge", "Spader113", "VorgBardo", "technickr", "TheGeneral1899", "shinarit", "Trigger-red_cannibl", "RobertLiuTrujillo", "okeamu", "MissingAI", "captain_Natjo", "Consistent-Fee3666", "SiarX", "BeepBoopRainbow", "RowzeiChan", "everyteendrama", "WolfGuardia", "BulletBudgie", "HypedGymBro", "Nanduihir", "LenKagamine12", "AnemicIronman", "SeaborderCoast", "SqueakSquawk4", "TheElepehantInDeRoom", "Tackyinbention", "Raptorwolf_AML", "Particular_Fix1211", "scr33ner", "xxxnobitaxxx", "MrZorg58", "jackhammerrrrr", "factory_reset_button", "Neffthecloud", "Careful_Strategy_711", "kaburgadolmasi", "SaltedSam", "Physical-Pizza-5738", "LeviTexmo", "Atrarus", "Modstin", "Foreign-Swan4271", "lightyearshead", "Fair951", "Slbrownfella", "IdeLuis", "Wolfj13", "AthonianTunnelRat", "LyubomirIko", "Freddy994", "swordofsithlord", "ouiouiouiouiouiyes", "Carsteroni", "fufu_ya_scared", "Plupsnup", "droneswarms", "Absent_Alan", "_cerbus_", "Drakeblood2002", "Expert_Moose4467", "Wilsonnera", "TheElephantInDeRoom", "asidethestart", "Ok_Point_5877", "RafaDiges", "WarsepticaGaming", "ShipBuilder16", "GvG_tv", "yetanotherpenguin", "andritz_", "damstereiw1", "Amazing_Wolf", "evrybdyhatesme", "galvanizer0010", "Eakar_70", "Blankyjae33", "Rich_Palpitation_214", "blue_greenscreen", "SnooChickens7998", "Constant-Stranger-10", "Leedigol", "Kenridge_Koala", "Remarkable_Year6634", "Antique-Telephone-94", "Plus_Friendship_2705", "Zharan_Colonel", "Fidelias_Palm", "Proxima_Centuria", "zachnebulous", "PowerlessPhysique", "Serbian_Slav", "Orion1626", "Top-Biscotti6165", "Full_Control9631", "Suitable-Inside-7620","dertpert88","Dr-Pen", "Rabee_Kayssi", "VARTH_-DADER", "Willie066", "ALPH_A07", "hardydubal", "Almost_Infamous", "ozzkitz", "AnneFirsich", "pong_jira", "DerpDaDuck3751", "Apprehensive_Two_463", "Ingvarmann", "Starbrainiac", "Earthling_Aprill"];

export function redditDownload(folderPath: string, subreddits: string, options: bdfrOptions) {
	const { time, limit, skipExisting, additionalArguments, openFolder, nameFormat} = options;
	const usedTime = time && validTimeValues[time] ? validTimeValues[time] : validTimeValues.all;
	utils.logYellow(`Downloading files from top of ${usedTime}`);
	const usedLimit = limit ? limit : 1000;
	const additional = additionalArguments ? ` ${additionalArguments}` : "";
	const skippedDomains = forbiddenDomains.map(domain => `--skip-domain "${domain}"`).join(" ");
	const skippedUsers = forbiddenUsers.map(user => `--ignore-user "${user}"`).join(" ");
	const skipExistingParam = skipExisting ? "--search-existing" : "";

	const format = nameFormat ? nameFormat : "{SUBREDDIT}_{REDDITOR}_{TITLE}_{POSTID}";

	const logPath = path.join(path.dirname(folderPath), "bdfr_logs");
	if(openFolder) {
		utils.openImageFolder(folderPath);
	}

	const command = `python -m bdfr download "${folderPath}" \
	--subreddit "${subreddits}" --sort top --no-dupes ${skipExistingParam} \
	--folder-scheme "./" --file-scheme "${format}" \
	${skippedDomains}	${skippedUsers} \
	--log "${logPath}" \
	--config "${path.join("L:", "Documents", "scripts", "nodejs-toolbox", "myconfig.cfg")}" \
	--max-wait-time 30 --time "${usedTime}" --limit ${usedLimit} --skip "txt" \
	${additional} --verbose`;

	utils.execShell(command,false,command.replace(skippedUsers, ""));
}

function sectionDownload(section: bdfrSection, options: Omit<bdfrOptions, "time" | "skipExisting">, startAt?: string) {
	const {limit} = options;
	const categories = Object.keys(section);

	const startIndex = startAt ? categories.findIndex((category) => {return category.toLowerCase().includes(startAt)}) : 0;

	for (let i = startIndex; i < categories.length; i++) {
		const category = categories[i];
		const {folderPath, subreddits, limit: categoryLimit} = section[category];
		
		utils.logLine();
		utils.logBlue(`Downloading ${category}, folder ${i+1}/${categories.length}`);
		utils.logLine();

		redditDownload(folderPath ? folderPath : path.join(utils.ImaginaryPath, category), subreddits, {...options, time: validTimeValues.month, limit: categoryLimit ? categoryLimit : limit, skipExisting: false})
	}
}

export function imaginaryDownload(startAt?: string) {
	sectionDownload(imaginarySubs, {limit: 200, openFolder: true}, startAt)
};

export function otherDownload(startAt?: string) {
	sectionDownload(otherSubs, {limit: 800, openFolder: false, nameFormat: "{SUBREDDIT}_{REDDITOR}_{TITLE}"}, startAt);
}

export function dungeonDownload() {
	sectionDownload(dungeonSubs, {limit: 80, openFolder: true, nameFormat: "{TITLE}"});
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
		const originalPicture = fs.readFileSync(`${nhUsedFolder}/${folder}/${originalPictureName}`, "base64")
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
			fs.writeFileSync(path.join(newPath, file), fs.readFileSync(path.join(downloadedFolder, file), "base64"))
		});

		utils.logGreen(`Finished migrating ${newTitle}`);
	
	});
}

export async function cleanUnwanted() {
	let found = 0;
	let index = 0;
	let  folders = getImaginaryFolders();
	folders = folders.concat(Object.keys(otherSubs).map(key => otherSubs[key].folderPath));
	folders = folders.concat(Object.keys(dungeonSubs).map(key => dungeonSubs[key].folderPath));
	folders = folders.concat(getUpscaleFolders());
	folders = folders.concat(getFinalFolders());

	folders.forEach(async (folderRaw) => {
		index++;
		const folder = folderRaw.replace(/\\/g, "/");
		let folderFound = 0;
		if(!fs.existsSync(folder)) {
			utils.logYellow(`${folder} has not been created yet`);
			return;
		}
		const files = fs.readdirSync(folder);
		files.forEach((file) => {
			let shouldDelete = false;
			if((folder.indexOf("desk") !== -1 )
				&& (
					file.toLowerCase().startsWith("vertical")
				)) {
					shouldDelete = true;
				}
			if(file.split("_").length > 1) {
				const begin = file.split("_")[0];
				const shortName = file.replace(begin + "_", "");
				shouldDelete = !!forbiddenUsers.find((user) => {return shortName.startsWith(user)});
			}
			if(file.toLowerCase().includes("[lfa]")) {
				shouldDelete = true;
			}
			if(file.endsWith(".txt")) {
				shouldDelete = true;
			}

			if(!shouldDelete) {
				return;
			}
			utils.deleteFolder(path.join(folder, file));
			found++;
			folderFound++;
		});
		if(folderFound > 0) {
			utils.logGreen(`${index}/${folders.length}: Deleted ${folderFound} from ${path.basename(folder)}`);
		}
		else {
			utils.logYellow(`${index}/${folders.length}: Nothing in ${path.basename(folder)}`);
		}
	});
	utils.logBlue(`Deleted ${found} not so pretty pictures`);
}

interface bdfrOptions {
	time?: keyof typeof validTimeValues,
	limit?: number,
	skipExisting?: boolean,
	additionalArguments?: string,
	openFolder?: boolean,
	nameFormat?: string,
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