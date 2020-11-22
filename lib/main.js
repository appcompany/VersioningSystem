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
const token = core.getInput('token');
const octokit = github.getOctokit(token);
function run() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const context = github.context;
            if (context.payload.pull_request == null) {
                core.setFailed('No pull request found.');
                return;
            }
            const pull_number = context.payload.pull_request.number;
            const pullRequestBody = (_a = context.payload.pull_request.body) !== null && _a !== void 0 ? _a : '';
            const analysis = analyze_1.analyze(analyze_1.extractList(pullRequestBody));
            const commentBody = analyze_1.generateComment(analysis);
            const data = (yield octokit.pulls.get(Object.assign(Object.assign({}, context.repo), { pull_number }))).data;
            const comments = yield octokit.paginate(octokit.issues.listComments, Object.assign(Object.assign({}, context.repo), { issue_number: pull_number }));
            const releaseComment = (_b = comments.find(comment => comment.body.includes('<!-- version-bot-comment: release-notes -->'))) === null || _b === void 0 ? void 0 : _b.id;
            const shouldRelease = data.labels.map(label => label.name).includes('ready');
            const targetBranch = data.base.ref;
            // const didMerge = (await octokit.pulls.checkIfMerged({ ...context.repo, pull_number })).data
            const didMerge = false;
            if (releaseComment != undefined && shouldRelease && !didMerge) {
                octokit.pulls.merge(Object.assign(Object.assign({}, context.repo), { pull_number, commit_title: `v${analysis.nextVersion.display}${targetBranch == 'main' ? '' : `-${targetBranch}`}`, commit_message: `${analysis.releaseChangelog}\n${analysis.internalChangelog}`, merge_method: 'squash' }));
            }
            else if (releaseComment == undefined) {
                octokit.issues.createComment(Object.assign(Object.assign({}, context.repo), { issue_number: pull_number, body: commentBody }))
                    .then(() => {
                    core.info('commented on pull request.');
                })
                    .catch(err => {
                    core.setFailed(`unable to create comment on pull request. reason: ${err}`);
                });
            }
            else {
                octokit.issues.updateComment(Object.assign(Object.assign({}, context.repo), { issue_number: pull_number, comment_id: releaseComment, body: commentBody }))
                    .then(() => {
                    core.info('updated comment on pull request.');
                })
                    .catch(err => {
                    core.setFailed(`unable to update comment on pull request. reason: ${err}`);
                });
            }
            octokit.issues.addLabels(Object.assign(Object.assign({}, context.repo), { issue_number: pull_number, labels: analysis.labels }))
                .then(() => {
                core.info('set labels on pull request.');
            })
                .catch(err => {
                core.setFailed(`unable to set labels on pull request. reason: ${err}`);
            });
            core.setOutput('change_analysis.json', JSON.stringify(analysis));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
if (!process.env.TESTING)
    run();
