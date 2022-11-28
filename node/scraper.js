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

const imaginarySubs = {
	chill: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Chill', 
		subreddits: "ImaginaryColorscapes, ImaginaryInteriors, ImaginarySliceOfLife, Moescape"
	},
	characters: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Characters', 
		subreddits: "armoredwomen, ImaginaryArchers, ImaginaryArtists, ImaginaryAssassins, imaginarybards, ImaginaryCharacters, ImaginaryClerics, ImaginaryDwarves, ImaginaryElves, ImaginaryGnomes, ImaginaryHumans, ImaginaryKnights, ImaginaryMerchants, ImaginaryNatives, ImaginaryNinjas, ImaginaryNobles, ImaginaryOrcs, ImaginarySamurai, ImaginaryScholars, ImaginarySoldiers, ImaginaryVikings, ImaginaryWarriors, ImaginaryWitches, ImaginaryWizards, ImaginAsian, ReasonableFantasy"
	},
	items: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Items', 
		subreddits: "ImaginaryAetherpunk, ImaginaryArmor, ImaginaryWeaponry" 
	},
	mounts: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Mounts', 
		subreddits: "EpicMounts"
	},
	pets: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Pets', 
		subreddits: "ImaginaryAww, imaginarypets",
		limit: 50
	},
	vehicles: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Vehicles', 
		subreddits: "ImaginaryAirships, ImaginaryAviation, ImaginaryStarships, ImaginaryVehicles, Imaginaryvessels, ImaginaryWarships" 
	},
	pokemon: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Pokemon', 
		subreddits: "ImaginaryKanto"
	},
	monster_characters: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Monster characters', 
		subreddits: "CelestialBodies, ImaginaryAngels, ImaginaryCentaurs, ImaginaryDemons, ImaginaryFaeries, ImaginaryGiants, ImaginaryGoblins, ImaginaryImmortals, ImaginaryMerfolk, ImaginaryMonsterGirls, ImaginaryVampires, ImaginaryWerewolves" 
	},
	monsters: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Monsters', 
		subreddits: "BadAssDragons, ImaginaryBeasts, ImaginaryBehemoths, ImaginaryDinosaurs, ImaginaryElementals, ImaginaryHorrors, ImaginaryHybrids, ImaginaryLeviathans, ImaginaryMonsters, ImaginarySpirits, ImaginaryTrolls, ImaginaryUndead, ImaginaryWorldEaters"
	},
	dragons: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Monsters', 
		subreddits: "ImaginaryDragons",
		limit: 150
	},
	places: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Places', 
		subreddits: "ImaginaryCityscapes, ImaginaryHellscapes, ImaginaryPathways, ImaginaryPortals, ImaginaryVillages, ImaginaryWalls, ImaginaryWastelands, ImaginaryWorlds" 
	},
	nature: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Nature', 
		subreddits: "ImaginaryAutumnscapes, ImaginaryCanyons, ImaginaryCaves, ImaginaryDeserts, ImaginaryForests, ImaginaryIslands, ImaginaryJungles, ImaginaryLakes, ImaginaryMountains, ImaginaryRivers, ImaginarySeascapes, ImaginarySkyscapes, ImaginarySwamps, ImaginaryTrees, ImaginaryVolcanoes, ImaginaryWaterfalls, ImaginaryWildlands, ImaginaryWinterscapes" 
	},
	scenes: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Scenes', 
		subreddits: "ImaginaryBattlefields, ImaginaryFeels, ImaginaryGatherings, ImaginarySliceOfLife, ImaginaryWeather" 
	},
	buildings: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Buildings', 
		subreddits: "ImaginaryArchitecture, ImaginaryCastles, ImaginaryDwellings, ImaginaryFactories, ImaginaryInteriors, ImaginaryLibraries, ImaginaryMonuments, ImaginaryPrisons, ImaginaryRuins, ImaginaryTaverns, ImaginaryTemples, ImaginaryTowers" 
	},
	scifi: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Scifi', 
		subreddits: "futureporn, ImaginaryCyberpunk, ImaginaryFutureWar, ImaginaryFuturism, ImaginaryMechs, ImaginaryRobotics" 
	},
	scifiCharacters: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Scifi-Characters', 
		subreddits: "ImaginaryAstronauts, ImaginaryCybernetics"
	},
	aliens: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Scifi-Aliens', 
		subreddits: "ImaginaryAliens"
	},
	scifiPlaces: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Scifi-Places', 
		subreddits: "ImaginaryStarscapes, SuperStructures"
	},
	starships: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Scifi-Starships', 
		subreddits: "ImaginaryStarships, StarshipPorn"
	},
	isometric: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Isometric', 
		subreddits: "isometric"
	},
	wallpapers: {
		folderPath: 'E:\\Pictures\\Wallpapers', 
		subreddits: "mtgporn, wallpapers, WQHD_Wallpaper" 
	},
	wallpapers_mobile: {
		folderPath: 'E:\\Pictures\\Wallpapers mobile', 
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

const dungeonSubs = {
	homebrew: {
		folderPath: 'E:\\Documents\\JdR\\DD5\\Homebrew raw', 
		subreddits: "UnearthedArcana"
	},
	character_drawings: {
		folderPath: 'E:\\Documents\\JdR\\DD5\\Character drawings', 
		subreddits: "characterdrawing"
	},
	mapmaking: {
		folderPath: 'E:\\Documents\\JdR\\DD5\\Maps raw', 
		subreddits: "mapmaking"
	},
	battlemaps: {
		folderPath: 'E:\\Documents\\JdR\\DD5\\Battlemaps raw', 
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
	const { time, limit, skipExisting, additionalArguments} = options;
	const usedTime = time && validTimeValues[time] ? validTimeValues[time] : validTimeValues.all;
	utils.logYellow(`Downloading files from top of ${usedTime}`);
	const usedLimit = limit ? limit : 1000;
	const additional = additionalArguments ? ` ${additionalArguments}` : "";
	const skippedDomains = forbiddenDomains.map(domain => `--skip-domain "${domain}"`).join(" ");
	const skippedUsers = forbiddenUsers.map(user => `--ignore-user "${user}"`).join(" ");
	const skipExistingParam = skipExisting ? "--search-existing" : "";

	const logPath = folderPath.split("\\");
	logPath.pop();
	logPath.push("bdfr_logs");
	utils.execShell(`py -m bdfr download "${folderPath}" \
									--subreddit "${subreddits}" --sort top --no-dupes ${skipExistingParam} \
									--folder-scheme "./" --file-scheme "{SUBREDDIT}_{REDDITOR}_{TITLE}_{POSTID}" \
									${skippedDomains}	${skippedUsers} \
									--log "${logPath.join("\\")}" \
									--max-wait-time 30 --time "${usedTime}" --limit ${usedLimit} --skip "txt" \
									${additional} --verbose`)
}

function sectionDownload(subs, options) {
	const {limit} = options;
	const categories = Object.keys(subs);

	for (let i = 0; i < categories.length; i++) {
		const category = categories[i];
		const details = subs[category];
		
		utils.logLine();
		utils.logBlue(`Downloading ${category}, folder ${i+1}/${categories.length}`);
		utils.logLine();

		redditDownload(details.folderPath, details.subreddits, {time: validTimeValues.month, limit: details.limit ? details.limit : limit, skipExisting: false})
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

function redditCatchup(folderPath, subredditName) {
	redditDownload(folderPath, subredditName, {time: validTimeValues.all});
	redditDownload(folderPath, subredditName, {time: validTimeValues.year});
	redditDownload(folderPath, subredditName, {time: validTimeValues.month});
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