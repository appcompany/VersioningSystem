"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const analyze_1 = require("./analyze");
const versions_1 = require("./versions");
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const context = github.context;
            if (context.payload.pull_request == null) {
                core.setFailed('No pull request found.');
                return;
            }
            const pull_number = context.payload.pull_request.number;
            const pullRequestBody = (_a = context.payload.pull_request.body) !== null && _a !== void 0 ? _a : '';
            const token = core.getInput('githubToken');
            const octokit = github.getOctokit(token);
            const analysis = analyze_1.analyze(analyze_1.extractList(pullRequestBody));
            const comment = `
      ${(() => {
                if (analysis.versionBump == versions_1.VersionIncrease.none) {
                    return 'This pull request will currently not cause a release to be created, but can still be merged.';
                }
                else {
                    return 'This pull request contains releasable changes.\nYou can release a new version with `/release`.';
                }
            })()}
      #### Version Details:
      Current Version:  ${analysis.currentVersion.display}
      New Version:      ${analysis.nextVersion.display}
      
      ### Release Changes:
      \`\`\`
      ${analysis.releaseChangelog.trim().length > 0 ? analysis.releaseChangelog.trim() : 'no changes'}
      \`\`\`
      ### Internal Changes:
      \`\`\`
      ${analysis.internalChangelog.trim().length > 0 ? analysis.internalChangelog.trim() : 'no changes'}
      \`\`\`
    `.split('\n').map(line => line.trim()).join('\n').trim();
            core.info(`making comment:\n${comment}`);
            octokit.issues.createComment(Object.assign(Object.assign({}, context.repo), { issue_number: pull_number, body: comment }));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
if (!process.env.TESTING)
    run();
