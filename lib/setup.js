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
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const path = __importStar(require("path"));
const kindInstaller = __importStar(require("./installer-kind"));
const kubefwdInstaller = __importStar(require("./installer-kubefwd"));
const bepatientInstaller = __importStar(require("./installer-bepatient"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield setKind();
        yield setKubefwd();
        yield setBepatient();
    });
}
function setKind() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let version = core.getInput('kind-version');
            if (version) {
                const toolPath = yield kindInstaller.getKind(version);
                const tool = path.join(toolPath, 'kind');
                yield exec.exec('chmod', ['+x', tool]);
                yield exec.exec(tool, ['create', 'cluster']);
                yield io.cp('/home/runner/.kube/kind-config-kind', '/home/runner/.kube/config', { recursive: true, force: true });
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function setKubefwd() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let version = core.getInput('kubefwd-version');
            if (version) {
                let toolPath = yield kubefwdInstaller.getKubefwd(version);
                let tool = path.join(toolPath, 'kubefwd');
                yield exec.exec('chmod', ['+x', tool]);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function setBepatient() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let version = core.getInput('bepatient-version');
            if (version) {
                let toolPath = yield bepatientInstaller.getBepatient(version);
                let tool = path.join(toolPath, 'bepatient');
                yield exec.exec('chmod', ['+x', tool]);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
