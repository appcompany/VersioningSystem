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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseContext = exports.ReleaseTarget = exports.Commit = exports.Release = exports.Comment = exports.SystemOptions = exports.ReleaseStatus = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const github_1 = require("@actions/github");
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const changelog_1 = require("./changelog");
const majorPath = path_1.resolve(`${process.cwd()}/.versioning/major_version`);
const messagePath = path_1.resolve(`${process.cwd()}/.versioning/update_message`);
const footerPath = path_1.resolve(`${process.cwd()}/.versioning/update_footer`);
class ReleaseStatus {
    constructor() {
        this.shouldRelease = false;
    }
}
exports.ReleaseStatus = ReleaseStatus;
class SystemOptions {
    constructor() {
        this.token = core.getInput('token');
        this.release = ['yes', 'true'].includes(core.getInput('release').toLowerCase());
        this.labels = ['yes', 'true'].includes(core.getInput('labels').toLowerCase());
        this.changelog = ['yes', 'true'].includes(core.getInput('changelog').toLowerCase());
        this.preview = ['yes', 'true'].includes(core.getInput('preview').toLowerCase());
    }
}
exports.SystemOptions = SystemOptions;
class Comment {
    constructor(input) {
        this.id = input.id;
        this.content = input.body;
    }
}
exports.Comment = Comment;
class Release {
    constructor(input) {
        var _a;
        this.id = input.id;
        this.asset = (_a = input.assets.find(asset => asset.name.toLowerCase().includes('release.json'))) === null || _a === void 0 ? void 0 : _a.id;
        this.commitish = input.target_commitish;
        this.tag = input.tag_name;
        this.name = input.name;
        this.prerelease = input.prerelease;
        this.body = input.body;
    }
}
exports.Release = Release;
class Commit {
    constructor(input) {
        this.changes = input.commit.message.split('\n').flatMap(line => {
            var _a, _b, _c;
            const regex = new RegExp(/\[(?<tag>.*?)\]\-\>/g);
            const tag = (_c = (_b = (_a = regex.exec(line)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.tag) !== null && _c !== void 0 ? _c : '';
            const section = changelog_1.sections.find(section => section.tags.includes(tag));
            const message = line.replace(regex, '').trim();
            return section != undefined ? { section, message } : [];
        });
    }
}
exports.Commit = Commit;
var ReleaseTarget;
(function (ReleaseTarget) {
    ReleaseTarget["invalid"] = "invalid";
    ReleaseTarget["appstore"] = "appstore";
    ReleaseTarget["beta"] = "beta";
    ReleaseTarget["alpha"] = "alpha";
})(ReleaseTarget = exports.ReleaseTarget || (exports.ReleaseTarget = {}));
class ReleaseContext {
    constructor(options = new SystemOptions()) {
        var _a, _b;
        this.options = new SystemOptions();
        this.status = new ReleaseStatus();
        this.pullNumber = (_b = (_a = github.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number) !== null && _b !== void 0 ? _b : 0;
        this.labels = [];
        this.releases = [];
        this.comments = [];
        this.commits = [];
        this.releaseTarget = ReleaseTarget.invalid;
        this.load = async (callback) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            const data = (_b = (await ((_a = this.connection) === null || _a === void 0 ? void 0 : _a.pulls.get({ ...github.context.repo, pull_number: this.pullNumber })))) === null || _b === void 0 ? void 0 : _b.data;
            this.labels = (_c = data === null || data === void 0 ? void 0 : data.labels.map(label => label.name)) !== null && _c !== void 0 ? _c : [];
            this.requestBody = data === null || data === void 0 ? void 0 : data.body;
            this.status.didMerge = data === null || data === void 0 ? void 0 : data.merged;
            this.commits = (_f = (_e = (await ((_d = this.connection) === null || _d === void 0 ? void 0 : _d.paginate(this.connection.pulls.listCommits, { ...github.context.repo, pull_number: this.pullNumber })))) === null || _e === void 0 ? void 0 : _e.map(commit => new Commit({ ...commit }))) !== null && _f !== void 0 ? _f : [];
            switch (data === null || data === void 0 ? void 0 : data.base.ref) {
                case 'appstore':
                    this.releaseTarget = ReleaseTarget.appstore;
                case 'alpha':
                    this.releaseTarget = ReleaseTarget.alpha;
                case 'beta':
                    this.releaseTarget = ReleaseTarget.beta;
                default:
                    this.releaseTarget = ReleaseTarget.invalid;
            }
            this.comments = (_k = (_j = (await ((_g = this.connection) === null || _g === void 0 ? void 0 : _g.paginate((_h = this.connection) === null || _h === void 0 ? void 0 : _h.issues.listComments, { ...github.context.repo, issue_number: this.pullNumber })))) === null || _j === void 0 ? void 0 : _j.map(comment => new Comment({ ...comment }))) !== null && _k !== void 0 ? _k : [];
            this.status.changelogCommentID = (_l = this.comments.find(comment => comment.content.includes('<!-- version-bot-comment: changelog -->'))) === null || _l === void 0 ? void 0 : _l.id;
            this.status.previewCommentID = (_m = this.comments.find(comment => comment.content.includes('<!-- version-bot-comment: preview -->'))) === null || _m === void 0 ? void 0 : _m.id;
            this.releases = (_r = (_q = (await ((_o = this.connection) === null || _o === void 0 ? void 0 : _o.paginate((_p = this.connection) === null || _p === void 0 ? void 0 : _p.repos.listReleases, { ...github.context.repo })))) === null || _q === void 0 ? void 0 : _q.map(release => new Release({ ...release }))) !== null && _r !== void 0 ? _r : [];
            callback();
        };
        if (github.context.payload.pull_request == null && process.env.TESTING !== 'true') {
            throw Error('Unable to find pull request, make sure to run this action with pull requests only.');
        }
        if (process.env.TESTING !== 'true') {
            this.options = options;
            this.connection = github_1.getOctokit(options.token);
        }
        this.updateFooter = fs_1.existsSync(footerPath) ? fs_1.readFileSync(footerPath).toString().trim() : undefined;
        this.updateMessage = fs_1.existsSync(messagePath) ? fs_1.readFileSync(messagePath).toString().trim() : undefined;
        this.majorVersion = fs_1.existsSync(majorPath) ? Number(fs_1.readFileSync(majorPath).toString().trim()) : 0;
    }
}
exports.ReleaseContext = ReleaseContext;
