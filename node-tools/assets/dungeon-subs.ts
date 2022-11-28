import { bdfrSection } from "../scraper"
import { NASPath } from "../utils"

const jdrPath = `${NASPath}/books/tabletop-rpg`
export const subs: bdfrSection = {
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