const utils = require ("./utils.js");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

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
		subreddits: "ImaginaryColorscapes, Moescape, ImaginaryInteriors, ImaginarySliceOfLife"
	},
	characters: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Characters', 
		subreddits: "ImaginaryCharacters, ImaginaryArchers, ImaginaryClerics, ImaginaryAssassins, ImaginaryKnights, ImaginaryNobles, ImaginaryScholars, ImaginarySoldiers, ImaginaryWarriors, ImaginaryWizards, ImaginaryDwarves, ImaginaryElves, ImaginaryHumans, ImaginaryOrcs, armoredwomen, ImaginAsian, ReasonableFantasy, imaginarybards, ImaginaryArtists, ImaginaryNatives, ImaginaryVikings, ImaginaryWitches, ImaginaryNinjas, ImaginaryGnomes, ImaginaryMerchants, ImaginarySamurai"
	},
	items: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Items', 
		subreddits: "ImaginaryArmor, ImaginaryWeaponry, ImaginaryAetherpunk"
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
		subreddits: "ImaginaryWarships, ImaginaryVehicles, ImaginaryAirships, ImaginaryAviation, Imaginaryvessels, ImaginaryStarships"
	},
	pokemon: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Pokemon', 
		subreddits: "ImaginaryKanto"
	},
	monster_characters: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Monster characters', 
		subreddits: "ImaginaryImmortals, ImaginaryAngels, ImaginaryFaeries, ImaginaryMerfolk, ImaginaryDemons, ImaginaryMonsterGirls, CelestialBodies, ImaginaryCentaurs, ImaginaryGiants, ImaginaryGoblins, ImaginaryVampires, ImaginaryWerewolves"
	},
	monsters: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Monsters', 
		subreddits: "ImaginaryMonsters, ImaginaryDragons, ImaginaryElementals, ImaginaryHorrors, ImaginaryHybrids, ImaginaryLeviathans, ImaginaryUndead, ImaginaryWorldEaters, ImaginaryBeasts, ImaginaryBehemoths, BadAssDragons, ImaginaryTrolls, ImaginaryDinosaurs, ImaginarySpirits"
	},
	monsters2: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Monsters', 
		subreddits: "ImaginaryDragons",
		limit: 50
	},
	places: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Places', 
		subreddits: "ImaginaryCityscapes, ImaginaryHellscapes, ImaginaryPathways, ImaginaryWastelands, ImaginaryWorlds, ImaginaryPortals, ImaginaryVillages, ImaginaryWalls"
	},
	nature: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Nature', 
		subreddits: "ImaginarySeascapes, ImaginarySkyscapes, ImaginaryWildlands, ImaginaryJungles, ImaginaryAutumnscapes, ImaginaryWinterscapes, ImaginaryCanyons, ImaginaryCaves, ImaginaryForests, ImaginaryDeserts, ImaginaryIslands, ImaginaryLakes, ImaginaryMountains, ImaginaryRivers, ImaginarySwamps, ImaginaryTrees, ImaginaryVolcanoes, ImaginaryWaterfalls"
	},
	scenes: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Scenes', 
		subreddits: "ImaginaryWeather, ImaginaryBattlefields, ImaginaryFeels, ImaginarySliceOfLife, ImaginaryGatherings"
	},
	buildings: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Buildings', 
		subreddits: "ImaginaryArchitecture, ImaginaryCastles, ImaginaryDwellings, ImaginaryLibraries, ImaginaryTaverns, ImaginaryInteriors, ImaginaryFactories, ImaginaryMonuments, ImaginaryPrisons, ImaginaryRuins, ImaginaryTowers, ImaginaryTemples"
	},
	scifi: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Scifi', 
		subreddits: "ImaginaryCyberpunk, ImaginaryFutureWar, ImaginaryFuturism, ImaginaryMechs, ImaginaryRobotics, futureporn"
	},
	scifiCharacters: {
		folderPath: 'E:\\Pictures\\Imaginary Network\\Scifi-Characters', 
		subreddits: "ImaginaryCybernetics, ImaginaryAstronauts"
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
		subreddits: "WQHD_Wallpaper, wallpapers, mtgporn"
	},
	wallpapers_mobile: {
		folderPath: 'E:\\Pictures\\Wallpapers mobile', 
		subreddits: "MobileWallpaper, Verticalwallpapers, AnimePhoneWallpapers"
	},
};

const bootySubs = {
	east: {
		folderPath: 'R:\\Game resources\\Battlebacks\\_SPECIAL_\\East',
		subreddits: "bustyasians, juicyasians, asianandlovingit, asian_gifs, AsianNSFW, AikaYumeno, AsianPornIn1Minute, hugeboobsjav, NSFW_Japan, Ai_Shinozaki, AsianHotties, AsianCuties, TeramotoRio, FansOfRaMu, AsiansGoneWild, AsianPorn, JapanesePorn2, ShionUtsunomiya, ai_uehara, Aimi_Yoshikawa, JuliaJAV, junamaki, KahoShibuya, KureaHasumi, RioHamasaki, SakiYanase, SakuraKirishima, shioritsukada, YukiJin, RenaMomozono, YuShinoda, HanaHarunaJAV"
	},
	end: {
		folderPath: 'R:\\Game resources\\Battlebacks\\_SPECIAL_\\End',
		subreddits: "whenitgoesin, O_Faces, pronebone, quiver, Orgasms"
	},
	reveal: {
		folderPath: 'R:\\Game resources\\Battlebacks\\_SPECIAL_\\Reveal',
		subreddits: "BiggerThanYouThought, OnOff, cosplayonoff, onoffcollages, Upskirt, Underskirts, cleavage, boobbounce, BigBoobsGonewild, BustyNaturals, GWBusty, BustyPetite, gonewild, TittyDrop"
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

const nhDownloadFolder = "R:/Game resources/Battlebacks/_SPECIAL_/zzzDrawings";
const nhUsedFolder = "R:/Game resources/Battlebacks/_SPECIAL_/Drawings";

const forbiddenDomains = ["instagram.fbna1-2.fna.fbcdn.net", "instagram.fbna1-1.fna.fbcdn.net", "youtube.com", "youtu.be", "jp.spankbang.com"];
const forbiddenUsers = ["GaroShadowscale", "vodcato-ventrexian", "Tundra_Echo", "VedaDragon", "BeardyBennett", "CharmanterPanter", "Ikiera",
												"RedPersik", "TheGamedawg", "Meraugis", "NeoTheProtogen", "SnickerToodles", "UnpaidPigeon", "kazmatazzzz", "Jaybaybay2838", 
												"Lovable-Peril", "MagmaHotsguy", "Marmasghetti", "jaco147", "geergutz", "ClayEnchanter", "castass", "ZENRAMANIAC", "KronalgalVas",
												"B0B_22", "Taguel16", "Cab0san", "RowzeiChan", "Hollz23", "TripleA2006", "championsgamer1", "Reykurinn", "AgentB90",
												"comics0026", "AimlessGrace", "axes_and_asses", "ImperatorZor", "HellsJuggernaut", "angelberries", "FoolishMacaroni",
												"nbolen13", "Space_Fox586", "EwokTheGreatPrp", "EmeraldScales", "ClassicFrancois18", "pweavd", "smolb0i", "improy",
												"redcomet0079", "BadSpellign", "Cromwell300", "Meadowlark"];

function redditDownload(folderPath, subreddits, time, limit, skipExisting, additionalArguments) {
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

function imaginaryDownload() {
	const targets = Object.keys(imaginarySubs);

	for (let i = 0; i < targets.length; i++) {
		const target = targets[i];
		const details = imaginarySubs[target];
		
		utils.logLine();
		utils.logBlue(`Downloading ${target}`)
		utils.logLine();

		redditDownload(details.folderPath, details.subreddits, validTimeValues.month, details.limit ? details.limit : 200, false)
	}
}

function bootyDownload() {
	const targets = Object.keys(bootySubs);

	for (let i = 0; i < targets.length; i++) {
		const target = targets[i];
		const details = bootySubs[target];
		
		utils.logLine();
		utils.logBlue(`Downloading ${target}`)
		utils.logLine();

		redditDownload(details.folderPath, details.subreddits, validTimeValues.month, 800, true);
	}
}

function dungeonDownload() {
	const targets = Object.keys(dungeonSubs);

	for (let i = 0; i < targets.length; i++) {
		const target = targets[i];
		const details = dungeonSubs[target];
		
		utils.logLine();
		utils.logBlue(`Downloading ${target}`)
		utils.logLine();

		redditDownload(details.folderPath, details.subreddits, validTimeValues.month, 50, true);
	}
}

function redditCatchup(folderPath, subredditName) {
	redditDownload(folderPath, subredditName, validTimeValues.all);
	redditDownload(folderPath, subredditName, validTimeValues.year);
	redditDownload(folderPath, subredditName, validTimeValues.month);
}

function generateArtPreviews() {
	const foldersLocation = "E:/Pictures/Comics/_SPECIAL_/Drawings";

	const folders = fs.readdirSync(foldersLocation);
	folders.forEach((folder) => {
		const files = fs.readdirSync(`${foldersLocation}/${folder}`);
	
		if(files.findIndex(file => file.startsWith("folder.jpg")) > -1) {
			console.log("=> folder pic exists already");
			return;
		}
	
		console.log(utils.separator(18));
		console.log(`${folder}:`);
		console.log(utils.separator(18));
	
		const originalPictureName = files.find(file => file.startsWith("001"));
		const originalPicture = fs.readFileSync(`${foldersLocation}/${folder}/${originalPictureName}`)
		if(!originalPicture) {
			console.error("no picture");
			return;
		}
		fs.writeFileSync(`${foldersLocation}/${folder}/folder.jpg`, originalPicture)
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

// function cleanYoutubeThumbnails() {
// 	const youtubeFolder = "K:/Youtube";
// 	const folders = fs.readdirSync(youtubeFolder);
// 	const annoyingExtension = " - Videos";
// 	folders.forEach((folder) => {
// 		const files = fs.readdirSync(path.join(youtubeFolder, folder));
// 		if(files.map(utils.getFileNameWithoutExtension).indexOf(folder) > -1 ) {
// 			return;
// 		}

// 		files.forEach((file) => {
// 			const filename = utils.getFileNameWithoutExtension(file);
// 			if(filename === folder + annoyingExtension) {
// 				sharp(path.join(youtubeFolder, folder, file)).toFormat("png").toFile(path.join(youtubeFolder, folder, "show.png"));
// 			}
// 		})
// 	})
// }

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

// exports.cleanYoutubeThumbnails = cleanYoutubeThumbnails;