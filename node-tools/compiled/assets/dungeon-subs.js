"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subs = void 0;
const utils_1 = require("../utils");
const jdrPath = `${utils_1.NASPath}/books/tabletop-rpg`;
exports.subs = {
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
};
