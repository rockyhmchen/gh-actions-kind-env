"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const io = __importStar(require("@actions/io"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
function getBepatient(version) {
    return __awaiter(this, void 0, void 0, function* () {
        // check cache
        let toolPath;
        toolPath = tc.find('bepatient', version);
        if (!toolPath) {
            // download, rename, cache
            toolPath = yield acquireBepatient(version);
            core.debug('Bepatient tool is cached under ' + toolPath);
        }
        toolPath = path.join(toolPath, 'bin');
        core.addPath(toolPath);
        return toolPath;
    });
}
exports.getBepatient = getBepatient;
function acquireBepatient(version) {
    return __awaiter(this, void 0, void 0, function* () {
        //
        // Download
        //
        let downloadUrl = getDownloadUrl(version);
        let downloadFile = null;
        try {
            downloadFile = yield tc.downloadTool(downloadUrl);
        }
        catch (error) {
            core.error(error);
            throw `Failed to download version ${version}: ${error}`;
        }
        //
        // Rename
        //
        const original = downloadFile;
        let tempPath = getTempPath(original);
        if (!tempPath) {
            throw new Error('Temp directory not set');
        }
        let bepatientPath = path.join(tempPath, `bepatient-${version}`);
        let binary = 'bepatient';
        const dest = path.join(bepatientPath, 'bin', binary);
        yield io.mv(original, dest);
        //
        // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
        //
        const toolRoot = bepatientPath;
        return yield tc.cacheDir(toolRoot, 'bepatient', version);
    });
}
function getTempPath(fullPath) {
    var indexOf = fullPath.lastIndexOf('/');
    var tempPath = fullPath.substring(0, indexOf);
    return tempPath;
}
function getDownloadUrl(version) {
    let binary = 'bepatient';
    return util.format('https://github.com/rockyhmchen/bepatient/releases/download/%s/%s', version, binary);
}
