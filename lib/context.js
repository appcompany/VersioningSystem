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
        var _a, _b;
        this.id = (_a = input === null || input === void 0 ? void 0 : input.id) !== null && _a !== void 0 ? _a : 0;
        this.content = (_b = input === null || input === void 0 ? void 0 : input.body) !== null && _b !== void 0 ? _b : '';
    }
}
exports.Comment = Comment;
class Release {
    constructor(input) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.id = (_a = input === null || input === void 0 ? void 0 : input.id) !== null && _a !== void 0 ? _a : 0;
        this.asset = (_b = input === null || input === void 0 ? void 0 : input.assets.find(asset => asset.name.toLowerCase().includes('release.json'))) === null || _b === void 0 ? void 0 : _b.id;
        this.commitish = (_c = input === null || input === void 0 ? void 0 : input.target_commitish) !== null && _c !== void 0 ? _c : '';
        this.tag = (_d = input === null || input === void 0 ? void 0 : input.tag_name) !== null && _d !== void 0 ? _d : '';
        this.name = (_e = input === null || input === void 0 ? void 0 : input.name) !== null && _e !== void 0 ? _e : '';
        this.prerelease = (_f = input === null || input === void 0 ? void 0 : input.prerelease) !== null && _f !== void 0 ? _f : true;
        this.body = (_g = input === null || input === void 0 ? void 0 : input.body) !== null && _g !== void 0 ? _g : '';
    }
}
exports.Release = Release;
class Commit {
    constructor(input) {
        this.sha = input.sha;
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
        this.targetCommits = [];
        this.releaseTarget = ReleaseTarget.invalid;
        this.load = async (callback) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
            const data = (_b = (await ((_a = this.connection) === null || _a === void 0 ? void 0 : _a.pulls.get({ ...github.context.repo, pull_number: this.pullNumber })))) === null || _b === void 0 ? void 0 : _b.data;
            this.labels = ((_c = data === null || data === void 0 ? void 0 : data.labels) !== null && _c !== void 0 ? _c : []).map(label => { var _a; return (_a = label === null || label === void 0 ? void 0 : label.name) !== null && _a !== void 0 ? _a : ''; }).filter(label => label != undefined);
            this.requestBody = (_d = data === null || data === void 0 ? void 0 : data.body) !== null && _d !== void 0 ? _d : '';
            this.status.didMerge = data === null || data === void 0 ? void 0 : data.merged;
            this.commits = (_g = (_f = (await ((_e = this.connection) === null || _e === void 0 ? void 0 : _e.paginate(this.connection.pulls.listCommits, { ...github.context.repo, pull_number: this.pullNumber })))) === null || _f === void 0 ? void 0 : _f.map(commit => new Commit({ ...commit }))) !== null && _g !== void 0 ? _g : [];
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
            this.comments = ((_k = (await ((_h = this.connection) === null || _h === void 0 ? void 0 : _h.paginate((_j = this.connection) === null || _j === void 0 ? void 0 : _j.issues.listComments, { ...github.context.repo, issue_number: this.pullNumber })))) !== null && _k !== void 0 ? _k : []).flatMap(comment => comment != undefined ? [new Comment(comment)] : []);
            this.targetCommits = (_q = (_p = (await ((_l = this.connection) === null || _l === void 0 ? void 0 : _l.paginate((_m = this.connection) === null || _m === void 0 ? void 0 : _m.repos.listCommits, { ...github.context.repo, sha: (_o = data === null || data === void 0 ? void 0 : data.base.sha) !== null && _o !== void 0 ? _o : undefined })))) === null || _p === void 0 ? void 0 : _p.map(commit => new Commit({ ...commit }))) !== null && _q !== void 0 ? _q : [];
            this.status.changelogCommentID = (_r = this.comments.find(comment => comment.content.includes('<!-- version-bot-comment: changelog -->'))) === null || _r === void 0 ? void 0 : _r.id;
            this.status.previewCommentID = (_s = this.comments.find(comment => comment.content.includes('<!-- version-bot-comment: preview -->'))) === null || _s === void 0 ? void 0 : _s.id;
            this.releases = (_w = (_v = (await ((_t = this.connection) === null || _t === void 0 ? void 0 : _t.paginate((_u = this.connection) === null || _u === void 0 ? void 0 : _u.repos.listReleases, { ...github.context.repo })))) === null || _v === void 0 ? void 0 : _v.flatMap(release => release != undefined ? [new Release(release)] : [])) !== null && _w !== void 0 ? _w : [];
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
