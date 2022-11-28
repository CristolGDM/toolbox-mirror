const utils = require ("./utils.js");
const path = require("path");
const fs = require("fs");

const validTimeValues = {
	all: "all",
	year: "year",
	month: "month",
	week: "week",
	day: "day"
}

const NASPath = "//MOOMINLIBRARY";
const PicturesPath = `${NASPath}/pictures`;
const ImaginaryNetworkPath = `${PicturesPath}/imaginary-network/`;

const imaginarySubs = {
	colorscapes: {
		subreddits: "ImaginaryColorscapes"
	},
	moescape: {
		subreddits: "Moescape"
	},
	"slice-of-life": {
		subreddits: "ImaginarySliceOfLife"
	},
	//
	archers: {
		subreddits: "ImaginaryArchers"
	},
	"armored-women": {
		subreddits: "armoredwomen"
	},
	artists: {
		subreddits: "ImaginaryArtists"
	},
	"asian-characters": {
		subreddits: "ImaginAsian"
	},
	assassins: {
		subreddits: "ImaginaryAssassins"
	},
	bards: {
		subreddits: "imaginarybards"
	},
	characters: {
		subreddits: "ImaginaryCharacters, characterdrawing"
	},
	clerics: {
		subreddits: "ImaginaryClerics"
	},
	dwarves: {
		subreddits: "ImaginaryDwarves"
	},
	elves: {
		subreddits: "ImaginaryElves"
	},
	gnomes: {
		subreddits: "ImaginaryGnomes"
	},
	humans: {
		subreddits: "ImaginaryHumans"
	},
	knights: {
		subreddits: "ImaginaryKnights"
	},
	merchants: {
		subreddits: "ImaginaryMerchants"
	},
	natives: {
		subreddits: "ImaginaryNatives"
	},
	ninjas: {
		subreddits: "ImaginaryNinjas"
	},
	nobles: {
		subreddits: "ImaginaryNobles"
	},
	orcs: {
		subreddits: "ImaginaryOrcs"
	},
	"realist-fantasy": {
		subreddits: "ReasonableFantasy"
	},
	samurai: {
		subreddits: "ImaginarySamurai"
	},
	scholars: {
		subreddits: "ImaginaryScholars"
	},
	soldiers: {
		subreddits: "ImaginarySoldiers"
	},
	vikings: {
		subreddits: "ImaginaryVikings"
	},
	warriors: {
		subreddits: "ImaginaryWarriors"
	},
	witches: {
		subreddits: "ImaginaryWitches"
	},
	wizards: {
		subreddits: "ImaginaryWizards"
	},
	
	//

	aetherpunk: {
		subreddits: "ImaginaryAetherpunk"
	},
	armor: {
		subreddits: "ImaginaryArmor"
	},
	weapons: {
		subreddits: "ImaginaryWeaponry"
	},

	//

	mounts: {
		subreddits: "EpicMounts"
	},
	
	//

	"animals-cute": {
		subreddits: "ImaginaryAww"
	},
	"animals-pets": {
		subreddits: "imaginarypets"
	},
   
   //

	airships: {
		subreddits: "ImaginaryAirships"
	},
	planes: {
		subreddits: "ImaginaryAviation"
	},
	vehicles: {
		subreddits: "ImaginaryVehicles"
	},
	boats: {
		subreddits: "Imaginaryvessels"
	},
	warships: {
		subreddits: "ImaginaryWarships"
	},

   //

	pokemon: {
		subreddits: "ImaginaryKanto"
	},
	"magic-the-gathering": {
		subreddits: "mtgporn"
	},
   
   //

	"celestial-beings": {
		subreddits: "CelestialBodies"
	},
	angels: {
		subreddits: "ImaginaryAngels"
	},
	centaurs: {
		subreddits: "ImaginaryCentaurs"
	},
	demons: {
		subreddits: "ImaginaryDemons"
	},
	fairies: {
		subreddits: "ImaginaryFaeries"
	},
	giants: {
		subreddits: "ImaginaryGiants"
	},
	goblins: {
		subreddits: "ImaginaryGoblins"
	},
	"immortal-beings": {
		subreddits: "ImaginaryImmortals"
	},
	merfolks: {
		subreddits: "ImaginaryMerfolk"
	},
	"monster-girls": {
		subreddits: "ImaginaryMonsterGirls"
	},
	vampires: {
		subreddits: "ImaginaryVampires"
	},
	werewolves: {
		subreddits: "ImaginaryWerewolves"
	},

   //

   dragons: {
		subreddits: "BadAssDragons, ImaginaryDragons"
	},
	beasts: {
		subreddits: "ImaginaryBeasts"
	},
	behemoths: {
		subreddits: "ImaginaryBehemoths"
	},
	dinosaurs: {
		subreddits: "ImaginaryDinosaurs"
	},
	elementals: {
		subreddits: "ImaginaryElementals"
	},
	horrors: {
		subreddits: "ImaginaryHorrors"
	},
	"animals-hybrids": {
		subreddits: "ImaginaryHybrids"
	},
	"sea-monsters": {
		subreddits: "ImaginaryLeviathans"
	},
	monsters: {
		subreddits: "ImaginaryMonsters"
	},
	spirits: {
		subreddits: "ImaginarySpirits"
	},
	trolls: {
		subreddits: "ImaginaryTrolls"
	},
	undead: {
		subreddits: "ImaginaryUndead"
	},
	"world-eaters": {
		subreddits: "ImaginaryWorldEaters"
	},
   
   //

	cities: {
		subreddits: "ImaginaryCityscapes"
	},
	hellscapes: {
		subreddits: "ImaginaryHellscapes"
	},
	pathways: {
		subreddits: "ImaginaryPathways"
	},
	portals: {
		subreddits: "ImaginaryPortals"
	},
	villages: {
		subreddits: "ImaginaryVillages"
	},
	walls: {
		subreddits: "ImaginaryWalls"
	},
	wastelands: {
		subreddits: "ImaginaryWastelands"
	},
	"imaginary-worlds": {
		subreddits: "ImaginaryWorlds"
	},
   
   //
   
	"autumn-scenery": {
		subreddits: "ImaginaryAutumnscapes"
	},
	canyons: {
		subreddits: "ImaginaryCanyons"
	},
	caves: {
		subreddits: "ImaginaryCaves"
	},
	deserts: {
		subreddits: "ImaginaryDeserts"
	},
	forests: {
		subreddits: "ImaginaryForests, ImaginaryTrees"
	},
	islands: {
		subreddits: "ImaginaryIslands"
	},
	jungles: {
		subreddits: "ImaginaryJungles"
	},
	lakes: {
		subreddits: "ImaginaryLakes"
	},
	mountains: {
		subreddits: "ImaginaryMountains"
	},
	"sea-scenery": {
		subreddits: "ImaginarySeascapes"
	},
	"sky-scenery": {
		subreddits: "ImaginarySkyscapes"
	},
	swamps: {
		subreddits: "ImaginarySwamps"
	},
	volcanoes: {
		subreddits: "ImaginaryVolcanoes"
	},
	waterfalls: {
		subreddits: "ImaginaryWaterfalls"
	},
	wildlands: {
		subreddits: "ImaginaryWildlands"
	},
	"winter-scenery": {
		subreddits: "ImaginaryWinterscapes"
	},

   //
   
	battlefields: {
		subreddits: "ImaginaryBattlefields"
	},
	"scenes-with-feels": {
		subreddits: "ImaginaryFeels"
	},
	gatherings: {
		subreddits: "ImaginaryGatherings"
	},
	weather: {
		subreddits: "ImaginaryWeather"
	},

   //

	architecture: {
		subreddits: "ImaginaryArchitecture"
	},
	castles: {
		subreddits: "ImaginaryCastles"
	},
	dwellings: {
		subreddits: "ImaginaryDwellings"
	},
	factories: {
		subreddits: "ImaginaryFactories"
	},
	interiors: {
		subreddits: "ImaginaryInteriors"
	},
	libraries: {
		subreddits: "ImaginaryLibraries"
	},
	monuments: {
		subreddits: "ImaginaryMonuments"
	},
	prisons: {
		subreddits: "ImaginaryPrisons"
	},
	ruins: {
		subreddits: "ImaginaryRuins"
	},
	taverns: {
		subreddits: "ImaginaryTaverns"
	},
	temples: {
		subreddits: "ImaginaryTemples"
	},
	towers: {
		subreddits: "ImaginaryTowers"
	},

   //

	scifi: {
		subreddits: "futureporn, ImaginaryFutureWar, ImaginaryFuturism"
	},
	cyberpunk: {
		subreddits: "ImaginaryCyberpunk"
	},
	mechas: {
		subreddits: "ImaginaryMechs"
	},
	robots: {
		subreddits: "ImaginaryRobotics"
	},
	astronauts: {
		subreddits: "ImaginaryAstronauts"
	},
	cybernetics: {
		subreddits: "ImaginaryCybernetics"
	},
	starscapes: {
		subreddits: "ImaginaryAliens"
	},
	"super-structures": {
		subreddits: "ImaginaryAliens"
	},
	starships: {
		subreddits: "ImaginaryStarships, StarshipPorn"
	},
   
   //

	isometric: {
		subreddits: "isometric"
	},

   //
   
	wallpapers: {
		folderPath: `${PicturesPath}/wallpapers`, 
		subreddits: "wallpapers, WQHD_Wallpaper" 
	},
	wallpapers_mobile: {
		folderPath: `${PicturesPath}/wallpapers-mobile`, 
		subreddits: "AnimePhoneWallpapers, MobileWallpaper, Verticalwallpapers" 
	},
};

const bootySubs = {
	east: {
		folderPath: 'K:\\_SPECIAL_\\East',
		subreddits: "Ai_Shinozaki, AikaYumeno, Aimi_Yoshikawa, asian_gifs, asianandlovingit, AsianCuties, AsianHotties, AsianNSFW, AsianPorn, AsianPornIn1Minute, AsiansGoneWild, bustyasians, FansOfRaMu, HanaHarunaJAV, JapanesePorn2, juicyasians, JuliaJAV, junamaki, KahoShibuya, KureaHasumi, NSFW_Japan, RenaMomozono, RioHamasaki, SakiYanase, SakuraKirishima, ShionUtsunomiya, shioritsukada, TeramotoRio, YukiJin, YuShinoda" 
	},
	end: {
		folderPath: 'K:\\_SPECIAL_\\End',
		subreddits: "O_Faces, Orgasms, pronebone, quiver, whenitgoesin" 
	},
	reveal: {
		folderPath: 'K:\\_SPECIAL_\\Reveal',
		subreddits: "BigBoobsGonewild, BiggerThanYouThought, boobbounce, BustyNaturals, BustyPetite, cleavage, cosplayonoff, gonewild, GWBusty, OnOff, onoffcollages, TittyDrop, Underskirts, Upskirt" ,
	}
}

const jdrPath = `${NASPath}/books/tabletop-rpg`
const dungeonSubs = {
	homebrew: {
		folderPath: `${jdrPath}/DD5/Homebrew raw`,
		subreddits: "UnearthedArcana"
	},
	mapmaking: {
		folderPath: `${jdrPath}/_maps`,
		subreddits: "mapmaking"
	},
	battlemaps: {
		folderPath: `${jdrPath}/_battlemaps`,
		subreddits: "battlemaps"
	}
}

const nhDownloadFolder = "K:/_SPECIAL_/zzzDrawings";
const nhUsedFolder = "K:/_SPECIAL_/Drawings";

const forbiddenDomains = ["instagram.fbna1-2.fna.fbcdn.net", "instagram.fbna1-1.fna.fbcdn.net", "youtube.com", "youtu.be", "jp.spankbang.com", "xhamster.com", "xhamster49.com"];
const forbiddenUsers = ["GaroShadowscale", "vodcato-ventrexian", "Tundra_Echo", "VedaDragon", "BeardyBennett", "CharmanterPanter", "Ikiera",
"RedPersik", "TheGamedawg", "Meraugis", "NeoTheProtogen", "SnickerToodles", "UnpaidPigeon", "kazmatazzzz", "Jaybaybay2838", 
"Lovable-Peril", "MagmaHotsguy", "Marmasghetti", "jaco147", "geergutz", "ClayEnchanter", "castass", "ZENRAMANIAC", "KronalgalVas",
"B0B_22", "Taguel16", "Cab0san", "RowzeiChan", "Hollz23", "TripleA2006", "championsgamer1", "Reykurinn", "AgentB90",
"comics0026", "AimlessGrace", "axes_and_asses", "ImperatorZor", "HellsJuggernaut", "angelberries", "FoolishMacaroni",
"nbolen13", "Space_Fox586", "EwokTheGreatPrp", "EmeraldScales", "ClassicFrancois18", "pweavd", "smolb0i", "improy",
"redcomet0079", "BadSpellign", "Cromwell300", "Meadowlark", "Ambratolm", "Caliglo37", "veronicasylvaxxx", "EmmaStrawberrie","Galind_Halithel", "adran23452", "CreatureCreator101", "EpicoSama", "infinitypilot", "Complete_Regret7372", "Northern_Hermit", "Person_Maybe", "Soliloquis", "TUG310000", "Philotics", "ArtsArukana", "Rockastorm", "TheLaVeyan", "long_soi", "BBMsReddit", "Multiverse_Queen", "Daily_Scrolls_516", "Darkcasfire", "DoomlightTheSuperior", "TyrannoNinja", "Signal-World-5009", "shuikan", "Ok-Abbreviations-117", "Dyno_Coder", "IvanDFakkov", "Jyto-Radam", "MrCatCZ", "DrSecksy", "Alden_Is_Happy", "Apollo037", "Luftwagen", "pewdiewolf", "RedHood866", "LordWeaselton", "Eden6", "Yepuge", "Spader113", "VorgBardo", "technickr", "TheGeneral1899", "shinarit", "Trigger-red_cannibl"];

function redditDownload(folderPath, subreddits, options) {
	const { time, limit, skipExisting, additionalArguments, openFolder} = options;
	const usedTime = time && validTimeValues[time] ? validTimeValues[time] : validTimeValues.all;
	utils.logYellow(`Downloading files from top of ${usedTime}`);
	const usedLimit = limit ? limit : 1000;
	const additional = additionalArguments ? ` ${additionalArguments}` : "";
	const skippedDomains = forbiddenDomains.map(domain => `--skip-domain "${domain}"`).join(" ");
	const skippedUsers = forbiddenUsers.map(user => `--ignore-user "${user}"`).join(" ");
	const skipExistingParam = skipExisting ? "--search-existing" : "";

	console.log(path.join(path.dirname(folderPath), "bdfr_logs"));
	const logPath = path.join(path.dirname(folderPath), "bdfr_logs");
	if(openFolder) {
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

function sectionDownload(section, options) {
	const {limit} = options;
	const categories = Object.keys(section);

	for (let i = 0; i < categories.length; i++) {
		const category = categories[i];
		const {folderPath, subreddits, limit: categoryLimit} = section[category];
		
		utils.logLine();
		utils.logBlue(`Downloading ${category}, folder ${i+1}/${categories.length}`);
		utils.logLine();

		redditDownload(folderPath ? folderPath : path.join(ImaginaryNetworkPath, category), subreddits, {time: validTimeValues.month, limit: categoryLimit ? categoryLimit : limit, skipExisting: false})
	}
}

function imaginaryDownload() {
	sectionDownload(imaginarySubs, {limit: 200})
};

function bootyDownload() {
	sectionDownload(bootySubs, {limit: 800});
}

function dungeonDownload() {
	sectionDownload(dungeonSubs, {limit: 50});
}

function redditCatchup(folderPath, subredditName, openFolder) {
	redditDownload(folderPath, subredditName, {time: validTimeValues.all, openFolder});
	redditDownload(folderPath, subredditName, {time: validTimeValues.year, openFolder});
	redditDownload(folderPath, subredditName, {time: validTimeValues.month, openFolder});
}

function generateArtPreviews() {
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

function sortArt() {
	const folders = fs.readdirSync(nhDownloadFolder);

	folders.forEach(async (folder) => {
		const downloadedFolder = path.join(nhDownloadFolder, folder);
		const metadata = await JSON.parse(fs.readFileSync(`${downloadedFolder}/metadata.json`));
	
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
	
		let authors = !metadata.artist ? metadata.group ? metadata.group : ["Unknown"] : metadata.artist.length > 3 ? [metadata.artist[0],metadata.artist[1],metadata.artist[2], "etc"] : metadata.artist;
		authors = authors.map(author => author.split("|")[0]).join(",");
		authors = authors.charAt(0).toUpperCase() + authors.slice(1);
	
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

async function cleanUnwanted() {
	let found = 0;
	let  folders = Object.keys(imaginarySubs).map(key => imaginarySubs[key].folderPath);
	folders = folders.concat(Object.keys(bootySubs).map(key => bootySubs[key].folderPath));
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

function cleanBooty() {
	let folders = [... new Set(Object.keys(bootySubs).map(key => bootySubs[key].folderPath))];

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

exports.validTimeValues = validTimeValues;
exports.redditDownload = redditDownload;
exports.redditCatchup = redditCatchup;

exports.imaginarySubs = imaginarySubs;
exports.bootySubs = bootySubs;
exports.dungeonSubs = dungeonSubs;

exports.imaginaryDownload = imaginaryDownload;
exports.bootyDownload = bootyDownload;
exports.dungeonDownload = dungeonDownload;

exports.generateArtPreviews = generateArtPreviews;
exports.sortArt = sortArt;

exports.forbiddenUsers = forbiddenUsers;
exports.cleanUnwanted = cleanUnwanted;
// exports.cleanImaginary = cleanImaginary;
exports.cleanBooty = cleanBooty;

exports.test = test;