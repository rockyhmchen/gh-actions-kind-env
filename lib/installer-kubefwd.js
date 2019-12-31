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
const os = __importStar(require("os"));
const util = __importStar(require("util"));
const IS_WINDOWS = process.platform === 'win32';
let osPlat = os.platform();
function getKubefwd(version) {
    return __awaiter(this, void 0, void 0, function* () {
        // check cache
        let toolPath;
        toolPath = tc.find('kubefwd', version);
        if (!toolPath) {
            // download, extract, cache
            toolPath = yield acquireKubefwd(version);
            core.debug('Kubefwd tool is cached under ' + toolPath);
        }
        core.addPath(toolPath);
        return toolPath;
    });
}
exports.getKubefwd = getKubefwd;
function acquireKubefwd(version) {
    return __awaiter(this, void 0, void 0, function* () {
        //
        // Download - a tool installer intimately knows how to get the tool (and construct urls)
        //
        let fileName = getFileName();
        let downloadUrl = getDownloadUrl(version, fileName);
        let downloadPath = null;
        try {
            downloadPath = yield tc.downloadTool(downloadUrl);
        }
        catch (error) {
            core.debug(error);
            throw `Failed to download version ${version}: ${error}`;
        }
        //
        // Extract
        //
        let extPath;
        if (IS_WINDOWS) {
            extPath = yield tc.extractZip(downloadPath);
        }
        else {
            extPath = yield tc.extractTar(downloadPath);
        }
        //
        // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
        //
        const toolRoot = extPath;
        return yield tc.cacheDir(toolRoot, 'kubefwd', version);
    });
}
function getTempPath(fullPath) {
    var indexOf = IS_WINDOWS
        ? fullPath.lastIndexOf('\\')
        : fullPath.lastIndexOf('/');
    var tempPath = fullPath.substring(0, indexOf);
    return tempPath;
}
function getFileName() {
    const platform = IS_WINDOWS ? 'windows' : 'linux';
    const ext = osPlat == 'win32' ? 'zip' : 'tar.gz';
    const filename = util.format('kubefwd_%s_amd64.%s', platform, ext);
    return filename;
}
function getDownloadUrl(version, filename) {
    return util.format('https://github.com/txn2/kubefwd/releases/download/%s/%s', version, filename);
}
