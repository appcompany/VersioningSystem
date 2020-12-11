module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 82:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sections = exports.ChangelogSection = exports.SectionType = void 0;
const versions_1 = __webpack_require__(332);
var SectionType;
(function (SectionType) {
    SectionType["release"] = "release";
    SectionType["internal"] = "internal";
})(SectionType = exports.SectionType || (exports.SectionType = {}));
class ChangelogSection {
    constructor(name, label, tags, type, increases = versions_1.VersionIncrease.none, hide = false) {
        this.tags = tags;
        this.displayName = name;
        this.type = type;
        this.increases = increases;
        this.hide = hide;
        this.label = label;
    }
}
exports.ChangelogSection = ChangelogSection;
// ordered list of changelog sections
exports.sections = [
    new ChangelogSection('New Features', 'bug', ['bug', 'bugfix', 'fix'], SectionType.release, versions_1.VersionIncrease.minor),
    new ChangelogSection('Bug Fixes', 'feature', ['feature', 'feat', 'new-feat', 'new-feature'], SectionType.release, versions_1.VersionIncrease.patch),
    new ChangelogSection('Changes', 'change', ['change', 'refactor', 'changes'], SectionType.release, versions_1.VersionIncrease.minor),
    new ChangelogSection('Languages', 'language', ['language', 'lang', 'new-lang', 'new-language'], SectionType.release, versions_1.VersionIncrease.minor),
    new ChangelogSection('Language Fixes', 'language-fix', ['language-fix', 'lang-fix', 'lang(fix)', 'langfix', 'fix-lang'], SectionType.release, versions_1.VersionIncrease.patch),
    new ChangelogSection('Metadata', 'metadata', ['metadata', 'meta'], SectionType.release, versions_1.VersionIncrease.patch, true),
    new ChangelogSection('Documentation', 'documentation', ['documentation', 'docs', 'doc'], SectionType.internal),
    new ChangelogSection('Build System', 'ci', ['ci', 'build-system', 'build'], SectionType.internal),
    new ChangelogSection('Tests', 'tests', ['tests', 'test', 'testing'], SectionType.internal),
    new ChangelogSection('Miscellaneous', 'misc', ['misc', 'chore'], SectionType.internal)
];
// const lowercase = (input: string) => input.charAt(0).toLowerCase() + input.slice(1)
// export function changelogPreview(changes: AnalyzeChange[], type: SectionType) {
//   var text : string[] = []
//   for (const section of sections.filter(section => section.type == type)) {
//     if (section.hide) continue
//     var foundOne = false
//     for (const change of changes) {
//       if (change.section == section) {
//         if (!foundOne) { text.push(`${section.displayName}`); foundOne = true }
//         text.push(`- ${lowercase(change.content)}`)
//       }
//     }
//     if (foundOne) text.push('')
//   }
//   return text.join('\n')
// }


/***/ }),

/***/ 842:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReleaseContext = exports.ReleaseTarget = exports.Commit = exports.Release = exports.Comment = exports.SystemOptions = exports.ReleaseStatus = void 0;
const path_1 = __webpack_require__(622);
const fs_1 = __webpack_require__(747);
const github_1 = __webpack_require__(438);
const core = __importStar(__webpack_require__(186));
const github = __importStar(__webpack_require__(438));
const changelog_1 = __webpack_require__(82);
const majorPath = __webpack_require__.ab + "major_version";
const messagePath = __webpack_require__.ab + "update_message";
const footerPath = __webpack_require__.ab + "update_footer";
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
        this.updateFooter = fs_1.existsSync(__webpack_require__.ab + "update_footer") ? fs_1.readFileSync(footerPath).toString().trim() : undefined;
        this.updateMessage = fs_1.existsSync(__webpack_require__.ab + "update_message") ? fs_1.readFileSync(messagePath).toString().trim() : undefined;
        this.majorVersion = fs_1.existsSync(__webpack_require__.ab + "major_version") ? Number(fs_1.readFileSync(majorPath).toString().trim()) : 0;
    }
}
exports.ReleaseContext = ReleaseContext;


/***/ }),

/***/ 109:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__webpack_require__(186));
const context_1 = __webpack_require__(842);
try {
    const context = new context_1.ReleaseContext();
    if (context.options.token == '' || context.options.token == undefined) {
        throw Error('No token supplied, please provide a working access token.');
    }
    context.load(() => {
        if (context.options.changelog) {
            // generate changelog
        }
        if (context.options.labels) {
            // set labels
        }
        if (context.options.preview) {
            // generate changelog preview
        }
        if (context.options.release) {
            // create release
        }
    });
}
catch (err) {
    core.setFailed(err);
}
// (() => {
//   if (!process.env.TESTING) (async () => {
//     // const context = github.context
//     // if (context.payload.pull_request == null) {
//     //   core.setFailed('No pull request found.')
//     //   return
//     // }
//     // const pull_number = context.payload.pull_request.number
//     // const pullRequestBody = context.payload.pull_request.body ?? ''
//     // const releases = await octokit.paginate(octokit.repos.listReleases, { ...context.repo })
//     // const comments = await octokit.paginate(octokit.issues.listComments, { ...context.repo, issue_number: pull_number })
//     // const releaseComment = comments.find(comment => comment.body.includes('<!-- version-bot-comment: release-notes -->'))?.id
//     // const targetBranch = data.base.ref
//     // const analysis = analyze(releases.filter(release => !release.prerelease).map(release => release.tag_name), targetBranch, extractList(pullRequestBody))
//     // const commentBody = generateComment(targetBranch, analysis)
//     // const didMerge : boolean = data.merged
//     async function release() {
//       if (didMerge) {
//         core.setFailed('Pull request already merged.')
//         return
//       }
//       octokit.pulls.merge({
//         ...context.repo,
//         pull_number,
//         commit_title: analysis.nextTag,
//         commit_message: `${analysis.releaseChangelog}\n${analysis.internalChangelog}`.trim(),
//         merge_method: 'squash'
//       })
//       .then(() => {
//         core.info(`merged into release stream ${targetBranch}`)
//         const name = versionName(releases.map(release => release.name))
//         octokit.repos.createRelease({
//           ...context.repo,
//           tag_name: targetBranch == 'appstore' ? analysis.nextTag : `${analysis.nextTag}/${name}`,
//           name: analysis.nextTag,
//           body: `
//             codename: **\`${name}\`**
//             ## App Store Preview
//             \`\`\`
//             ${analysis.releaseChangelog.trim()}
//             \`\`\`
//             ## Internal Changes
//             \`\`\`
//             ${analysis.internalChangelog.trim()}
//             \`\`\`
//           `.split('\n').map(line => line.trim()).join('\n').trim(),
//           prerelease: targetBranch == 'appstore' ? false : true,
//           target_commitish: targetBranch,
//           draft: true
//         })
//         .then(response => {
//           const release_id = response.data.id
//           if (release_id != undefined) {
//             core.info(`created release(${release_id}) for tag:${analysis.nextTag}`)
//             octokit.repos.uploadReleaseAsset({
//               ...context.repo, release_id,
//               name: 'analysis.json',
//               data: JSON.stringify(analysis)
//             })
//             .then(() => {
//               octokit.repos.updateRelease({
//                 ...context.repo, release_id,
//                 draft: false
//               })
//               .then(() => {
//                 core.info(`published release: ${release_id}`)
//               })
//               .catch(err => {
//                 core.setFailed(`unable to publish release. reason: ${err}`)      
//               })
//             })
//             .catch(err => {
//               core.setFailed(`unable to upload asset. reason: ${err}`)    
//             })
//           }
//         })
//         .catch(err => {
//           core.setFailed(`unable to create release. reason: ${err}`)
//         })
//       })
//       .catch(err => {
//         core.setFailed(`unable to merge into release stream ${targetBranch}. reason: ${err}`)
//       })
//     }
//     async function change_analysis() {
//       try {
//         if (releaseComment == undefined) {
//           octokit.issues.createComment({
//             ...context.repo,
//             issue_number: pull_number,
//             body: commentBody
//           })
//           .then(() => {
//             core.info('commented on pull request.')
//           })
//           .catch(err => {
//             core.setFailed(`unable to create comment on pull request. reason: ${err}`)
//           })
//         } else {
//           octokit.issues.updateComment({
//             ...context.repo,
//             issue_number: pull_number,
//             comment_id: releaseComment,
//             body: commentBody
//           })
//           .then(() => {
//             core.info('updated comment on pull request.')
//           })
//           .catch(err => {
//             core.setFailed(`unable to update comment on pull request. reason: ${err}`)
//           })
//         }
//         octokit.issues.addLabels({
//           ...context.repo,
//           issue_number: pull_number,
//           labels: analysis.labels
//         })  
//         .then(() => {
//           core.info('set labels on pull request.')
//         })
//         .catch(err => {
//           core.setFailed(`unable to set labels on pull request. reason: ${err}`)
//         })
//         core.setOutput('change_analysis.json',JSON.stringify(analysis))
//       } catch (error) {
//         core.setFailed(error.message)
//       }
//     }
//   })()  
// })()


/***/ }),

/***/ 332:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.versionName = exports.nextVersion = exports.currentVersion = exports.Version = exports.increaseOrder = exports.VersionIncrease = void 0;
const unique_names_generator_1 = __webpack_require__(839);
var VersionIncrease;
(function (VersionIncrease) {
    VersionIncrease["major"] = "major";
    VersionIncrease["minor"] = "minor";
    VersionIncrease["patch"] = "patch";
    VersionIncrease["none"] = "none";
})(VersionIncrease = exports.VersionIncrease || (exports.VersionIncrease = {}));
exports.increaseOrder = [
    VersionIncrease.major, VersionIncrease.minor, VersionIncrease.patch, VersionIncrease.none
];
class Version {
    constructor(text) {
        var _a, _b, _c, _d, _e, _f;
        const split = text.replace(/[^0-9.]/g, '').split('.');
        this.major = (_b = Number((_a = split[0]) !== null && _a !== void 0 ? _a : '0')) !== null && _b !== void 0 ? _b : 0;
        this.minor = (_d = Number((_c = split[1]) !== null && _c !== void 0 ? _c : '0')) !== null && _d !== void 0 ? _d : 0;
        this.patch = (_f = Number((_e = split[2]) !== null && _e !== void 0 ? _e : '0')) !== null && _f !== void 0 ? _f : 0;
    }
    get display() {
        return `${this.major}.${this.minor}.${this.patch}`;
    }
}
exports.Version = Version;
function currentVersion(releases) {
    var _a;
    return (_a = releases.filter(release => !release.includes('-')).map(release => new Version(release)).sort((lhs, rhs) => {
        if (lhs.major == rhs.major) {
            if (lhs.minor == rhs.minor) {
                if (lhs.patch == rhs.patch)
                    return 0;
                if (lhs.patch < rhs.patch)
                    return 1;
                if (lhs.patch > rhs.patch)
                    return -1;
            }
            else if (lhs.minor < rhs.minor)
                return 1;
            else if (lhs.minor > rhs.minor)
                return -1;
        }
        else if (lhs.major < rhs.major)
            return 1;
        else if (lhs.major > rhs.major)
            return -1;
        return 0;
    })[0]) !== null && _a !== void 0 ? _a : new Version('0.0.1');
}
exports.currentVersion = currentVersion;
function nextVersion(current, increase) {
    const nextVersion = new Version(current.display);
    if (increase == VersionIncrease.patch) {
        nextVersion.patch += 1;
    }
    if (increase == VersionIncrease.minor) {
        nextVersion.patch = 0;
        nextVersion.minor += 1;
    }
    if (increase == VersionIncrease.major) {
        nextVersion.patch = 0;
        nextVersion.minor = 0;
        nextVersion.major += 1;
    }
    return nextVersion;
}
exports.nextVersion = nextVersion;
function versionName(used) {
    const randomName = unique_names_generator_1.uniqueNamesGenerator({ dictionaries: [unique_names_generator_1.adjectives, unique_names_generator_1.colors, unique_names_generator_1.animals] });
    if (used.includes(randomName))
        return versionName(used);
    else
        return randomName;
}
exports.versionName = versionName;


/***/ }),

/***/ 351:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__webpack_require__(87));
const utils_1 = __webpack_require__(278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 186:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __webpack_require__(351);
const file_command_1 = __webpack_require__(717);
const utils_1 = __webpack_require__(278);
const os = __importStar(__webpack_require__(87));
const path = __importStar(__webpack_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__webpack_require__(747));
const os = __importStar(__webpack_require__(87));
const utils_1 = __webpack_require__(278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 53:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Context = void 0;
const fs_1 = __webpack_require__(747);
const os_1 = __webpack_require__(87);
class Context {
    /**
     * Hydrate the context from the environment
     */
    constructor() {
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
            if (fs_1.existsSync(process.env.GITHUB_EVENT_PATH)) {
                this.payload = JSON.parse(fs_1.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' }));
            }
            else {
                const path = process.env.GITHUB_EVENT_PATH;
                process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${os_1.EOL}`);
            }
        }
        this.eventName = process.env.GITHUB_EVENT_NAME;
        this.sha = process.env.GITHUB_SHA;
        this.ref = process.env.GITHUB_REF;
        this.workflow = process.env.GITHUB_WORKFLOW;
        this.action = process.env.GITHUB_ACTION;
        this.actor = process.env.GITHUB_ACTOR;
        this.job = process.env.GITHUB_JOB;
        this.runNumber = parseInt(process.env.GITHUB_RUN_NUMBER, 10);
        this.runId = parseInt(process.env.GITHUB_RUN_ID, 10);
    }
    get issue() {
        const payload = this.payload;
        return Object.assign(Object.assign({}, this.repo), { number: (payload.issue || payload.pull_request || payload).number });
    }
    get repo() {
        if (process.env.GITHUB_REPOSITORY) {
            const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
            return { owner, repo };
        }
        if (this.payload.repository) {
            return {
                owner: this.payload.repository.owner.login,
                repo: this.payload.repository.name
            };
        }
        throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
    }
}
exports.Context = Context;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ 438:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOctokit = exports.context = void 0;
const Context = __importStar(__webpack_require__(53));
const utils_1 = __webpack_require__(30);
exports.context = new Context.Context();
/**
 * Returns a hydrated octokit ready to use for GitHub Actions
 *
 * @param     token    the repo PAT or GITHUB_TOKEN
 * @param     options  other options to set
 */
function getOctokit(token, options) {
    return new utils_1.GitHub(utils_1.getOctokitOptions(token, options));
}
exports.getOctokit = getOctokit;
//# sourceMappingURL=github.js.map

/***/ }),

/***/ 914:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getApiBaseUrl = exports.getProxyAgent = exports.getAuthString = void 0;
const httpClient = __importStar(__webpack_require__(925));
function getAuthString(token, options) {
    if (!token && !options.auth) {
        throw new Error('Parameter token or opts.auth is required');
    }
    else if (token && options.auth) {
        throw new Error('Parameters token and opts.auth may not both be specified');
    }
    return typeof options.auth === 'string' ? options.auth : `token ${token}`;
}
exports.getAuthString = getAuthString;
function getProxyAgent(destinationUrl) {
    const hc = new httpClient.HttpClient();
    return hc.getAgent(destinationUrl);
}
exports.getProxyAgent = getProxyAgent;
function getApiBaseUrl() {
    return process.env['GITHUB_API_URL'] || 'https://api.github.com';
}
exports.getApiBaseUrl = getApiBaseUrl;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 30:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOctokitOptions = exports.GitHub = exports.context = void 0;
const Context = __importStar(__webpack_require__(53));
const Utils = __importStar(__webpack_require__(914));
// octokit + plugins
const core_1 = __webpack_require__(762);
const plugin_rest_endpoint_methods_1 = __webpack_require__(44);
const plugin_paginate_rest_1 = __webpack_require__(193);
exports.context = new Context.Context();
const baseUrl = Utils.getApiBaseUrl();
const defaults = {
    baseUrl,
    request: {
        agent: Utils.getProxyAgent(baseUrl)
    }
};
exports.GitHub = core_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods, plugin_paginate_rest_1.paginateRest).defaults(defaults);
/**
 * Convience function to correctly format Octokit Options to pass into the constructor.
 *
 * @param     token    the repo PAT or GITHUB_TOKEN
 * @param     options  other options to set
 */
function getOctokitOptions(token, options) {
    const opts = Object.assign({}, options || {}); // Shallow clone - don't mutate the object provided by the caller
    // Auth
    const auth = Utils.getAuthString(token, opts);
    if (auth) {
        opts.auth = auth;
    }
    return opts;
}
exports.getOctokitOptions = getOctokitOptions;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 925:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const http = __webpack_require__(605);
const https = __webpack_require__(211);
const pm = __webpack_require__(443);
let tunnel;
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    let proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'HttpClientError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
    }
}
exports.HttpClientError = HttpClientError;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return new Promise(async (resolve, reject) => {
            let output = Buffer.alloc(0);
            this.message.on('data', (chunk) => {
                output = Buffer.concat([output, chunk]);
            });
            this.message.on('end', () => {
                resolve(output.toString());
            });
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    let parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
            if (requestOptions.ignoreSslError != null) {
                this._ignoreSslError = requestOptions.ignoreSslError;
            }
            this._socketTimeout = requestOptions.socketTimeout;
            if (requestOptions.allowRedirects != null) {
                this._allowRedirects = requestOptions.allowRedirects;
            }
            if (requestOptions.allowRedirectDowngrade != null) {
                this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
            }
            if (requestOptions.maxRedirects != null) {
                this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
            }
            if (requestOptions.keepAlive != null) {
                this._keepAlive = requestOptions.keepAlive;
            }
            if (requestOptions.allowRetries != null) {
                this._allowRetries = requestOptions.allowRetries;
            }
            if (requestOptions.maxRetries != null) {
                this._maxRetries = requestOptions.maxRetries;
            }
        }
    }
    options(requestUrl, additionalHeaders) {
        return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
    }
    get(requestUrl, additionalHeaders) {
        return this.request('GET', requestUrl, null, additionalHeaders || {});
    }
    del(requestUrl, additionalHeaders) {
        return this.request('DELETE', requestUrl, null, additionalHeaders || {});
    }
    post(requestUrl, data, additionalHeaders) {
        return this.request('POST', requestUrl, data, additionalHeaders || {});
    }
    patch(requestUrl, data, additionalHeaders) {
        return this.request('PATCH', requestUrl, data, additionalHeaders || {});
    }
    put(requestUrl, data, additionalHeaders) {
        return this.request('PUT', requestUrl, data, additionalHeaders || {});
    }
    head(requestUrl, additionalHeaders) {
        return this.request('HEAD', requestUrl, null, additionalHeaders || {});
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return this.request(verb, requestUrl, stream, additionalHeaders);
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    async getJson(requestUrl, additionalHeaders = {}) {
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        let res = await this.get(requestUrl, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async postJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.post(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async putJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.put(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async patchJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.patch(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    async request(verb, requestUrl, data, headers) {
        if (this._disposed) {
            throw new Error('Client has already been disposed.');
        }
        let parsedUrl = new URL(requestUrl);
        let info = this._prepareRequest(verb, parsedUrl, headers);
        // Only perform retries on reads since writes may not be idempotent.
        let maxTries = this._allowRetries && RetryableHttpVerbs.indexOf(verb) != -1
            ? this._maxRetries + 1
            : 1;
        let numTries = 0;
        let response;
        while (numTries < maxTries) {
            response = await this.requestRaw(info, data);
            // Check if it's an authentication challenge
            if (response &&
                response.message &&
                response.message.statusCode === HttpCodes.Unauthorized) {
                let authenticationHandler;
                for (let i = 0; i < this.handlers.length; i++) {
                    if (this.handlers[i].canHandleAuthentication(response)) {
                        authenticationHandler = this.handlers[i];
                        break;
                    }
                }
                if (authenticationHandler) {
                    return authenticationHandler.handleAuthentication(this, info, data);
                }
                else {
                    // We have received an unauthorized response but have no handlers to handle it.
                    // Let the response return to the caller.
                    return response;
                }
            }
            let redirectsRemaining = this._maxRedirects;
            while (HttpRedirectCodes.indexOf(response.message.statusCode) != -1 &&
                this._allowRedirects &&
                redirectsRemaining > 0) {
                const redirectUrl = response.message.headers['location'];
                if (!redirectUrl) {
                    // if there's no location to redirect to, we won't
                    break;
                }
                let parsedRedirectUrl = new URL(redirectUrl);
                if (parsedUrl.protocol == 'https:' &&
                    parsedUrl.protocol != parsedRedirectUrl.protocol &&
                    !this._allowRedirectDowngrade) {
                    throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                }
                // we need to finish reading the response before reassigning response
                // which will leak the open socket.
                await response.readBody();
                // strip authorization header if redirected to a different hostname
                if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                    for (let header in headers) {
                        // header names are case insensitive
                        if (header.toLowerCase() === 'authorization') {
                            delete headers[header];
                        }
                    }
                }
                // let's make the request with the new redirectUrl
                info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                response = await this.requestRaw(info, data);
                redirectsRemaining--;
            }
            if (HttpResponseRetryCodes.indexOf(response.message.statusCode) == -1) {
                // If not a retry code, return immediately instead of retrying
                return response;
            }
            numTries += 1;
            if (numTries < maxTries) {
                await response.readBody();
                await this._performExponentialBackoff(numTries);
            }
        }
        return response;
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return new Promise((resolve, reject) => {
            let callbackForResult = function (err, res) {
                if (err) {
                    reject(err);
                }
                resolve(res);
            };
            this.requestRawWithCallback(info, data, callbackForResult);
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        let socket;
        if (typeof data === 'string') {
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        let handleResult = (err, res) => {
            if (!callbackCalled) {
                callbackCalled = true;
                onResult(err, res);
            }
        };
        let req = info.httpModule.request(info.options, (msg) => {
            let res = new HttpClientResponse(msg);
            handleResult(null, res);
        });
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error('Request timeout: ' + info.options.path), null);
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err, null);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        let parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
        if (this.handlers) {
            this.handlers.forEach(handler => {
                handler.prepareRequest(info.options);
            });
        }
        return info;
    }
    _mergeHeaders(headers) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers));
        }
        return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
            clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
        let agent;
        let proxyUrl = pm.getProxyUrl(parsedUrl);
        let useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
            agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
            agent = this._agent;
        }
        // if agent is already assigned use that agent.
        if (!!agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (!!this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (useProxy) {
            // If using proxy, need tunnel
            if (!tunnel) {
                tunnel = __webpack_require__(294);
            }
            const agentOptions = {
                maxSockets: maxSockets,
                keepAlive: this._keepAlive,
                proxy: {
                    proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`,
                    host: proxyUrl.hostname,
                    port: proxyUrl.port
                }
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets: maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
            agent.options = Object.assign(agent.options || {}, {
                rejectUnauthorized: false
            });
        }
        return agent;
    }
    _performExponentialBackoff(retryNumber) {
        retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
        const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }
    static dateTimeDeserializer(key, value) {
        if (typeof value === 'string') {
            let a = new Date(value);
            if (!isNaN(a.valueOf())) {
                return a;
            }
        }
        return value;
    }
    async _processResponse(res, options) {
        return new Promise(async (resolve, reject) => {
            const statusCode = res.message.statusCode;
            const response = {
                statusCode: statusCode,
                result: null,
                headers: {}
            };
            // not found leads to null obj returned
            if (statusCode == HttpCodes.NotFound) {
                resolve(response);
            }
            let obj;
            let contents;
            // get the result from the body
            try {
                contents = await res.readBody();
                if (contents && contents.length > 0) {
                    if (options && options.deserializeDates) {
                        obj = JSON.parse(contents, HttpClient.dateTimeDeserializer);
                    }
                    else {
                        obj = JSON.parse(contents);
                    }
                    response.result = obj;
                }
                response.headers = res.message.headers;
            }
            catch (err) {
                // Invalid resource (contents not json);  leaving result obj null
            }
            // note that 3xx redirects are handled by the http layer.
            if (statusCode > 299) {
                let msg;
                // if exception/error in body, attempt to get better error
                if (obj && obj.message) {
                    msg = obj.message;
                }
                else if (contents && contents.length > 0) {
                    // it may be the case that the exception is in the body message as string
                    msg = contents;
                }
                else {
                    msg = 'Failed request: (' + statusCode + ')';
                }
                let err = new HttpClientError(msg, statusCode);
                err.result = response.result;
                reject(err);
            }
            else {
                resolve(response);
            }
        });
    }
}
exports.HttpClient = HttpClient;


/***/ }),

/***/ 443:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function getProxyUrl(reqUrl) {
    let usingSsl = reqUrl.protocol === 'https:';
    let proxyUrl;
    if (checkBypass(reqUrl)) {
        return proxyUrl;
    }
    let proxyVar;
    if (usingSsl) {
        proxyVar = process.env['https_proxy'] || process.env['HTTPS_PROXY'];
    }
    else {
        proxyVar = process.env['http_proxy'] || process.env['HTTP_PROXY'];
    }
    if (proxyVar) {
        proxyUrl = new URL(proxyVar);
    }
    return proxyUrl;
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    let noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    let upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (let upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperReqHosts.some(x => x === upperNoProxyItem)) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;


/***/ }),

/***/ 334:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

async function auth(token) {
  const tokenType = token.split(/\./).length === 3 ? "app" : /^v\d+\./.test(token) ? "installation" : "oauth";
  return {
    type: "token",
    token: token,
    tokenType
  };
}

/**
 * Prefix token for usage in the Authorization header
 *
 * @param token OAuth token or JSON Web Token
 */
function withAuthorizationPrefix(token) {
  if (token.split(/\./).length === 3) {
    return `bearer ${token}`;
  }

  return `token ${token}`;
}

async function hook(token, request, route, parameters) {
  const endpoint = request.endpoint.merge(route, parameters);
  endpoint.headers.authorization = withAuthorizationPrefix(token);
  return request(endpoint);
}

const createTokenAuth = function createTokenAuth(token) {
  if (!token) {
    throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
  }

  if (typeof token !== "string") {
    throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
  }

  token = token.replace(/^(token|bearer) +/i, "");
  return Object.assign(auth.bind(null, token), {
    hook: hook.bind(null, token)
  });
};

exports.createTokenAuth = createTokenAuth;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 762:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var universalUserAgent = __webpack_require__(429);
var beforeAfterHook = __webpack_require__(682);
var request = __webpack_require__(234);
var graphql = __webpack_require__(668);
var authToken = __webpack_require__(334);

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

const VERSION = "3.2.1";

class Octokit {
  constructor(options = {}) {
    const hook = new beforeAfterHook.Collection();
    const requestDefaults = {
      baseUrl: request.request.endpoint.DEFAULTS.baseUrl,
      headers: {},
      request: Object.assign({}, options.request, {
        hook: hook.bind(null, "request")
      }),
      mediaType: {
        previews: [],
        format: ""
      }
    }; // prepend default user agent with `options.userAgent` if set

    requestDefaults.headers["user-agent"] = [options.userAgent, `octokit-core.js/${VERSION} ${universalUserAgent.getUserAgent()}`].filter(Boolean).join(" ");

    if (options.baseUrl) {
      requestDefaults.baseUrl = options.baseUrl;
    }

    if (options.previews) {
      requestDefaults.mediaType.previews = options.previews;
    }

    if (options.timeZone) {
      requestDefaults.headers["time-zone"] = options.timeZone;
    }

    this.request = request.request.defaults(requestDefaults);
    this.graphql = graphql.withCustomRequest(this.request).defaults(requestDefaults);
    this.log = Object.assign({
      debug: () => {},
      info: () => {},
      warn: console.warn.bind(console),
      error: console.error.bind(console)
    }, options.log);
    this.hook = hook; // (1) If neither `options.authStrategy` nor `options.auth` are set, the `octokit` instance
    //     is unauthenticated. The `this.auth()` method is a no-op and no request hook is registered.
    // (2) If only `options.auth` is set, use the default token authentication strategy.
    // (3) If `options.authStrategy` is set then use it and pass in `options.auth`. Always pass own request as many strategies accept a custom request instance.
    // TODO: type `options.auth` based on `options.authStrategy`.

    if (!options.authStrategy) {
      if (!options.auth) {
        // (1)
        this.auth = async () => ({
          type: "unauthenticated"
        });
      } else {
        // (2)
        const auth = authToken.createTokenAuth(options.auth); // @ts-ignore  ¯\_(ツ)_/¯

        hook.wrap("request", auth.hook);
        this.auth = auth;
      }
    } else {
      const {
        authStrategy
      } = options,
            otherOptions = _objectWithoutProperties(options, ["authStrategy"]);

      const auth = authStrategy(Object.assign({
        request: this.request,
        log: this.log,
        // we pass the current octokit instance as well as its constructor options
        // to allow for authentication strategies that return a new octokit instance
        // that shares the same internal state as the current one. The original
        // requirement for this was the "event-octokit" authentication strategy
        // of https://github.com/probot/octokit-auth-probot.
        octokit: this,
        octokitOptions: otherOptions
      }, options.auth)); // @ts-ignore  ¯\_(ツ)_/¯

      hook.wrap("request", auth.hook);
      this.auth = auth;
    } // apply plugins
    // https://stackoverflow.com/a/16345172


    const classConstructor = this.constructor;
    classConstructor.plugins.forEach(plugin => {
      Object.assign(this, plugin(this, options));
    });
  }

  static defaults(defaults) {
    const OctokitWithDefaults = class extends this {
      constructor(...args) {
        const options = args[0] || {};

        if (typeof defaults === "function") {
          super(defaults(options));
          return;
        }

        super(Object.assign({}, defaults, options, options.userAgent && defaults.userAgent ? {
          userAgent: `${options.userAgent} ${defaults.userAgent}`
        } : null));
      }

    };
    return OctokitWithDefaults;
  }
  /**
   * Attach a plugin (or many) to your Octokit instance.
   *
   * @example
   * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
   */


  static plugin(...newPlugins) {
    var _a;

    const currentPlugins = this.plugins;
    const NewOctokit = (_a = class extends this {}, _a.plugins = currentPlugins.concat(newPlugins.filter(plugin => !currentPlugins.includes(plugin))), _a);
    return NewOctokit;
  }

}
Octokit.VERSION = VERSION;
Octokit.plugins = [];

exports.Octokit = Octokit;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 440:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var isPlainObject = __webpack_require__(287);
var universalUserAgent = __webpack_require__(429);

function lowercaseKeys(object) {
  if (!object) {
    return {};
  }

  return Object.keys(object).reduce((newObj, key) => {
    newObj[key.toLowerCase()] = object[key];
    return newObj;
  }, {});
}

function mergeDeep(defaults, options) {
  const result = Object.assign({}, defaults);
  Object.keys(options).forEach(key => {
    if (isPlainObject.isPlainObject(options[key])) {
      if (!(key in defaults)) Object.assign(result, {
        [key]: options[key]
      });else result[key] = mergeDeep(defaults[key], options[key]);
    } else {
      Object.assign(result, {
        [key]: options[key]
      });
    }
  });
  return result;
}

function removeUndefinedProperties(obj) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }

  return obj;
}

function merge(defaults, route, options) {
  if (typeof route === "string") {
    let [method, url] = route.split(" ");
    options = Object.assign(url ? {
      method,
      url
    } : {
      url: method
    }, options);
  } else {
    options = Object.assign({}, route);
  } // lowercase header names before merging with defaults to avoid duplicates


  options.headers = lowercaseKeys(options.headers); // remove properties with undefined values before merging

  removeUndefinedProperties(options);
  removeUndefinedProperties(options.headers);
  const mergedOptions = mergeDeep(defaults || {}, options); // mediaType.previews arrays are merged, instead of overwritten

  if (defaults && defaults.mediaType.previews.length) {
    mergedOptions.mediaType.previews = defaults.mediaType.previews.filter(preview => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews);
  }

  mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map(preview => preview.replace(/-preview/, ""));
  return mergedOptions;
}

function addQueryParameters(url, parameters) {
  const separator = /\?/.test(url) ? "&" : "?";
  const names = Object.keys(parameters);

  if (names.length === 0) {
    return url;
  }

  return url + separator + names.map(name => {
    if (name === "q") {
      return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
    }

    return `${name}=${encodeURIComponent(parameters[name])}`;
  }).join("&");
}

const urlVariableRegex = /\{[^}]+\}/g;

function removeNonChars(variableName) {
  return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
}

function extractUrlVariableNames(url) {
  const matches = url.match(urlVariableRegex);

  if (!matches) {
    return [];
  }

  return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}

function omit(object, keysToOmit) {
  return Object.keys(object).filter(option => !keysToOmit.includes(option)).reduce((obj, key) => {
    obj[key] = object[key];
    return obj;
  }, {});
}

// Based on https://github.com/bramstein/url-template, licensed under BSD
// TODO: create separate package.
//
// Copyright (c) 2012-2014, Bram Stein
// All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
// EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/* istanbul ignore file */
function encodeReserved(str) {
  return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
    if (!/%[0-9A-Fa-f]/.test(part)) {
      part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
    }

    return part;
  }).join("");
}

function encodeUnreserved(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

function encodeValue(operator, value, key) {
  value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);

  if (key) {
    return encodeUnreserved(key) + "=" + value;
  } else {
    return value;
  }
}

function isDefined(value) {
  return value !== undefined && value !== null;
}

function isKeyOperator(operator) {
  return operator === ";" || operator === "&" || operator === "?";
}

function getValues(context, operator, key, modifier) {
  var value = context[key],
      result = [];

  if (isDefined(value) && value !== "") {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      value = value.toString();

      if (modifier && modifier !== "*") {
        value = value.substring(0, parseInt(modifier, 10));
      }

      result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
    } else {
      if (modifier === "*") {
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function (value) {
            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
          });
        } else {
          Object.keys(value).forEach(function (k) {
            if (isDefined(value[k])) {
              result.push(encodeValue(operator, value[k], k));
            }
          });
        }
      } else {
        const tmp = [];

        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function (value) {
            tmp.push(encodeValue(operator, value));
          });
        } else {
          Object.keys(value).forEach(function (k) {
            if (isDefined(value[k])) {
              tmp.push(encodeUnreserved(k));
              tmp.push(encodeValue(operator, value[k].toString()));
            }
          });
        }

        if (isKeyOperator(operator)) {
          result.push(encodeUnreserved(key) + "=" + tmp.join(","));
        } else if (tmp.length !== 0) {
          result.push(tmp.join(","));
        }
      }
    }
  } else {
    if (operator === ";") {
      if (isDefined(value)) {
        result.push(encodeUnreserved(key));
      }
    } else if (value === "" && (operator === "&" || operator === "?")) {
      result.push(encodeUnreserved(key) + "=");
    } else if (value === "") {
      result.push("");
    }
  }

  return result;
}

function parseUrl(template) {
  return {
    expand: expand.bind(null, template)
  };
}

function expand(template, context) {
  var operators = ["+", "#", ".", "/", ";", "?", "&"];
  return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
    if (expression) {
      let operator = "";
      const values = [];

      if (operators.indexOf(expression.charAt(0)) !== -1) {
        operator = expression.charAt(0);
        expression = expression.substr(1);
      }

      expression.split(/,/g).forEach(function (variable) {
        var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
        values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
      });

      if (operator && operator !== "+") {
        var separator = ",";

        if (operator === "?") {
          separator = "&";
        } else if (operator !== "#") {
          separator = operator;
        }

        return (values.length !== 0 ? operator : "") + values.join(separator);
      } else {
        return values.join(",");
      }
    } else {
      return encodeReserved(literal);
    }
  });
}

function parse(options) {
  // https://fetch.spec.whatwg.org/#methods
  let method = options.method.toUpperCase(); // replace :varname with {varname} to make it RFC 6570 compatible

  let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
  let headers = Object.assign({}, options.headers);
  let body;
  let parameters = omit(options, ["method", "baseUrl", "url", "headers", "request", "mediaType"]); // extract variable names from URL to calculate remaining variables later

  const urlVariableNames = extractUrlVariableNames(url);
  url = parseUrl(url).expand(parameters);

  if (!/^http/.test(url)) {
    url = options.baseUrl + url;
  }

  const omittedParameters = Object.keys(options).filter(option => urlVariableNames.includes(option)).concat("baseUrl");
  const remainingParameters = omit(parameters, omittedParameters);
  const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);

  if (!isBinaryRequest) {
    if (options.mediaType.format) {
      // e.g. application/vnd.github.v3+json => application/vnd.github.v3.raw
      headers.accept = headers.accept.split(/,/).map(preview => preview.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${options.mediaType.format}`)).join(",");
    }

    if (options.mediaType.previews.length) {
      const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
      headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map(preview => {
        const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
        return `application/vnd.github.${preview}-preview${format}`;
      }).join(",");
    }
  } // for GET/HEAD requests, set URL query parameters from remaining parameters
  // for PATCH/POST/PUT/DELETE requests, set request body from remaining parameters


  if (["GET", "HEAD"].includes(method)) {
    url = addQueryParameters(url, remainingParameters);
  } else {
    if ("data" in remainingParameters) {
      body = remainingParameters.data;
    } else {
      if (Object.keys(remainingParameters).length) {
        body = remainingParameters;
      } else {
        headers["content-length"] = 0;
      }
    }
  } // default content-type for JSON if body is set


  if (!headers["content-type"] && typeof body !== "undefined") {
    headers["content-type"] = "application/json; charset=utf-8";
  } // GitHub expects 'content-length: 0' header for PUT/PATCH requests without body.
  // fetch does not allow to set `content-length` header, but we can set body to an empty string


  if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
    body = "";
  } // Only return body/request keys if present


  return Object.assign({
    method,
    url,
    headers
  }, typeof body !== "undefined" ? {
    body
  } : null, options.request ? {
    request: options.request
  } : null);
}

function endpointWithDefaults(defaults, route, options) {
  return parse(merge(defaults, route, options));
}

function withDefaults(oldDefaults, newDefaults) {
  const DEFAULTS = merge(oldDefaults, newDefaults);
  const endpoint = endpointWithDefaults.bind(null, DEFAULTS);
  return Object.assign(endpoint, {
    DEFAULTS,
    defaults: withDefaults.bind(null, DEFAULTS),
    merge: merge.bind(null, DEFAULTS),
    parse
  });
}

const VERSION = "6.0.9";

const userAgent = `octokit-endpoint.js/${VERSION} ${universalUserAgent.getUserAgent()}`; // DEFAULTS has all properties set that EndpointOptions has, except url.
// So we use RequestParameters and add method as additional required property.

const DEFAULTS = {
  method: "GET",
  baseUrl: "https://api.github.com",
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent": userAgent
  },
  mediaType: {
    format: "",
    previews: []
  }
};

const endpoint = withDefaults(null, DEFAULTS);

exports.endpoint = endpoint;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 668:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var request = __webpack_require__(234);
var universalUserAgent = __webpack_require__(429);

const VERSION = "4.5.7";

class GraphqlError extends Error {
  constructor(request, response) {
    const message = response.data.errors[0].message;
    super(message);
    Object.assign(this, response.data);
    Object.assign(this, {
      headers: response.headers
    });
    this.name = "GraphqlError";
    this.request = request; // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

}

const NON_VARIABLE_OPTIONS = ["method", "baseUrl", "url", "headers", "request", "query", "mediaType"];
const GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
function graphql(request, query, options) {
  if (typeof query === "string" && options && "query" in options) {
    return Promise.reject(new Error(`[@octokit/graphql] "query" cannot be used as variable name`));
  }

  const parsedOptions = typeof query === "string" ? Object.assign({
    query
  }, options) : query;
  const requestOptions = Object.keys(parsedOptions).reduce((result, key) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = parsedOptions[key];
      return result;
    }

    if (!result.variables) {
      result.variables = {};
    }

    result.variables[key] = parsedOptions[key];
    return result;
  }, {}); // workaround for GitHub Enterprise baseUrl set with /api/v3 suffix
  // https://github.com/octokit/auth-app.js/issues/111#issuecomment-657610451

  const baseUrl = parsedOptions.baseUrl || request.endpoint.DEFAULTS.baseUrl;

  if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
    requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
  }

  return request(requestOptions).then(response => {
    if (response.data.errors) {
      const headers = {};

      for (const key of Object.keys(response.headers)) {
        headers[key] = response.headers[key];
      }

      throw new GraphqlError(requestOptions, {
        headers,
        data: response.data
      });
    }

    return response.data.data;
  });
}

function withDefaults(request$1, newDefaults) {
  const newRequest = request$1.defaults(newDefaults);

  const newApi = (query, options) => {
    return graphql(newRequest, query, options);
  };

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: request.request.endpoint
  });
}

const graphql$1 = withDefaults(request.request, {
  headers: {
    "user-agent": `octokit-graphql.js/${VERSION} ${universalUserAgent.getUserAgent()}`
  },
  method: "POST",
  url: "/graphql"
});
function withCustomRequest(customRequest) {
  return withDefaults(customRequest, {
    method: "POST",
    url: "/graphql"
  });
}

exports.graphql = graphql$1;
exports.withCustomRequest = withCustomRequest;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 193:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

const VERSION = "2.6.0";

/**
 * Some “list” response that can be paginated have a different response structure
 *
 * They have a `total_count` key in the response (search also has `incomplete_results`,
 * /installation/repositories also has `repository_selection`), as well as a key with
 * the list of the items which name varies from endpoint to endpoint.
 *
 * Octokit normalizes these responses so that paginated results are always returned following
 * the same structure. One challenge is that if the list response has only one page, no Link
 * header is provided, so this header alone is not sufficient to check wether a response is
 * paginated or not.
 *
 * We check if a "total_count" key is present in the response data, but also make sure that
 * a "url" property is not, as the "Get the combined status for a specific ref" endpoint would
 * otherwise match: https://developer.github.com/v3/repos/statuses/#get-the-combined-status-for-a-specific-ref
 */
function normalizePaginatedListResponse(response) {
  const responseNeedsNormalization = "total_count" in response.data && !("url" in response.data);
  if (!responseNeedsNormalization) return response; // keep the additional properties intact as there is currently no other way
  // to retrieve the same information.

  const incompleteResults = response.data.incomplete_results;
  const repositorySelection = response.data.repository_selection;
  const totalCount = response.data.total_count;
  delete response.data.incomplete_results;
  delete response.data.repository_selection;
  delete response.data.total_count;
  const namespaceKey = Object.keys(response.data)[0];
  const data = response.data[namespaceKey];
  response.data = data;

  if (typeof incompleteResults !== "undefined") {
    response.data.incomplete_results = incompleteResults;
  }

  if (typeof repositorySelection !== "undefined") {
    response.data.repository_selection = repositorySelection;
  }

  response.data.total_count = totalCount;
  return response;
}

function iterator(octokit, route, parameters) {
  const options = typeof route === "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
  const requestMethod = typeof route === "function" ? route : octokit.request;
  const method = options.method;
  const headers = options.headers;
  let url = options.url;
  return {
    [Symbol.asyncIterator]: () => ({
      async next() {
        if (!url) return {
          done: true
        };
        const response = await requestMethod({
          method,
          url,
          headers
        });
        const normalizedResponse = normalizePaginatedListResponse(response); // `response.headers.link` format:
        // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
        // sets `url` to undefined if "next" URL is not present or `link` header is not set

        url = ((normalizedResponse.headers.link || "").match(/<([^>]+)>;\s*rel="next"/) || [])[1];
        return {
          value: normalizedResponse
        };
      }

    })
  };
}

function paginate(octokit, route, parameters, mapFn) {
  if (typeof parameters === "function") {
    mapFn = parameters;
    parameters = undefined;
  }

  return gather(octokit, [], iterator(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
}

function gather(octokit, results, iterator, mapFn) {
  return iterator.next().then(result => {
    if (result.done) {
      return results;
    }

    let earlyExit = false;

    function done() {
      earlyExit = true;
    }

    results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);

    if (earlyExit) {
      return results;
    }

    return gather(octokit, results, iterator, mapFn);
  });
}

const composePaginateRest = Object.assign(paginate, {
  iterator
});

/**
 * @param octokit Octokit instance
 * @param options Options passed to Octokit constructor
 */

function paginateRest(octokit) {
  return {
    paginate: Object.assign(paginate.bind(null, octokit), {
      iterator: iterator.bind(null, octokit)
    })
  };
}
paginateRest.VERSION = VERSION;

exports.composePaginateRest = composePaginateRest;
exports.paginateRest = paginateRest;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 44:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

const Endpoints = {
  actions: {
    addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
    cancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"],
    createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
    createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    createRegistrationTokenForOrg: ["POST /orgs/{org}/actions/runners/registration-token"],
    createRegistrationTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/registration-token"],
    createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
    createRemoveTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/remove-token"],
    createWorkflowDispatch: ["POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"],
    deleteArtifact: ["DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
    deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    deleteSelfHostedRunnerFromOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}"],
    deleteSelfHostedRunnerFromRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"],
    deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
    deleteWorkflowRunLogs: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
    downloadArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"],
    downloadJobLogsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"],
    downloadWorkflowRunLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
    getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
    getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
    getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
    getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
    getSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}"],
    getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
    getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
    getWorkflowRunUsage: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"],
    getWorkflowUsage: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"],
    listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
    listJobsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"],
    listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
    listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
    listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
    listRunnerApplicationsForRepo: ["GET /repos/{owner}/{repo}/actions/runners/downloads"],
    listSelectedReposForOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}/repositories"],
    listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
    listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
    listWorkflowRunArtifacts: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"],
    listWorkflowRuns: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"],
    listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
    reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
    removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
    setSelectedReposForOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"]
  },
  activity: {
    checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
    deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
    deleteThreadSubscription: ["DELETE /notifications/threads/{thread_id}/subscription"],
    getFeeds: ["GET /feeds"],
    getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
    getThread: ["GET /notifications/threads/{thread_id}"],
    getThreadSubscriptionForAuthenticatedUser: ["GET /notifications/threads/{thread_id}/subscription"],
    listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
    listNotificationsForAuthenticatedUser: ["GET /notifications"],
    listOrgEventsForAuthenticatedUser: ["GET /users/{username}/events/orgs/{org}"],
    listPublicEvents: ["GET /events"],
    listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
    listPublicEventsForUser: ["GET /users/{username}/events/public"],
    listPublicOrgEvents: ["GET /orgs/{org}/events"],
    listReceivedEventsForUser: ["GET /users/{username}/received_events"],
    listReceivedPublicEventsForUser: ["GET /users/{username}/received_events/public"],
    listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
    listRepoNotificationsForAuthenticatedUser: ["GET /repos/{owner}/{repo}/notifications"],
    listReposStarredByAuthenticatedUser: ["GET /user/starred"],
    listReposStarredByUser: ["GET /users/{username}/starred"],
    listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
    listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
    listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
    listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
    markNotificationsAsRead: ["PUT /notifications"],
    markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
    markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
    setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
    setThreadSubscription: ["PUT /notifications/threads/{thread_id}/subscription"],
    starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
    unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
  },
  apps: {
    addRepoToInstallation: ["PUT /user/installations/{installation_id}/repositories/{repository_id}"],
    checkToken: ["POST /applications/{client_id}/token"],
    createContentAttachment: ["POST /content_references/{content_reference_id}/attachments", {
      mediaType: {
        previews: ["corsair"]
      }
    }],
    createFromManifest: ["POST /app-manifests/{code}/conversions"],
    createInstallationAccessToken: ["POST /app/installations/{installation_id}/access_tokens"],
    deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
    deleteInstallation: ["DELETE /app/installations/{installation_id}"],
    deleteToken: ["DELETE /applications/{client_id}/token"],
    getAuthenticated: ["GET /app"],
    getBySlug: ["GET /apps/{app_slug}"],
    getInstallation: ["GET /app/installations/{installation_id}"],
    getOrgInstallation: ["GET /orgs/{org}/installation"],
    getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
    getSubscriptionPlanForAccount: ["GET /marketplace_listing/accounts/{account_id}"],
    getSubscriptionPlanForAccountStubbed: ["GET /marketplace_listing/stubbed/accounts/{account_id}"],
    getUserInstallation: ["GET /users/{username}/installation"],
    listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
    listAccountsForPlanStubbed: ["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"],
    listInstallationReposForAuthenticatedUser: ["GET /user/installations/{installation_id}/repositories"],
    listInstallations: ["GET /app/installations"],
    listInstallationsForAuthenticatedUser: ["GET /user/installations"],
    listPlans: ["GET /marketplace_listing/plans"],
    listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
    listReposAccessibleToInstallation: ["GET /installation/repositories"],
    listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
    listSubscriptionsForAuthenticatedUserStubbed: ["GET /user/marketplace_purchases/stubbed"],
    removeRepoFromInstallation: ["DELETE /user/installations/{installation_id}/repositories/{repository_id}"],
    resetToken: ["PATCH /applications/{client_id}/token"],
    revokeInstallationAccessToken: ["DELETE /installation/token"],
    suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
    unsuspendInstallation: ["DELETE /app/installations/{installation_id}/suspended"]
  },
  billing: {
    getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
    getGithubActionsBillingUser: ["GET /users/{username}/settings/billing/actions"],
    getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
    getGithubPackagesBillingUser: ["GET /users/{username}/settings/billing/packages"],
    getSharedStorageBillingOrg: ["GET /orgs/{org}/settings/billing/shared-storage"],
    getSharedStorageBillingUser: ["GET /users/{username}/settings/billing/shared-storage"]
  },
  checks: {
    create: ["POST /repos/{owner}/{repo}/check-runs", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    createSuite: ["POST /repos/{owner}/{repo}/check-suites", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listAnnotations: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listForSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    rerequestSuite: ["POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    setSuitesPreferences: ["PATCH /repos/{owner}/{repo}/check-suites/preferences", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}", {
      mediaType: {
        previews: ["antiope"]
      }
    }]
  },
  codeScanning: {
    getAlert: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}", {}, {
      renamedParameters: {
        alert_id: "alert_number"
      }
    }],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
    listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
    updateAlert: ["PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"],
    uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"]
  },
  codesOfConduct: {
    getAllCodesOfConduct: ["GET /codes_of_conduct", {
      mediaType: {
        previews: ["scarlet-witch"]
      }
    }],
    getConductCode: ["GET /codes_of_conduct/{key}", {
      mediaType: {
        previews: ["scarlet-witch"]
      }
    }],
    getForRepo: ["GET /repos/{owner}/{repo}/community/code_of_conduct", {
      mediaType: {
        previews: ["scarlet-witch"]
      }
    }]
  },
  emojis: {
    get: ["GET /emojis"]
  },
  gists: {
    checkIsStarred: ["GET /gists/{gist_id}/star"],
    create: ["POST /gists"],
    createComment: ["POST /gists/{gist_id}/comments"],
    delete: ["DELETE /gists/{gist_id}"],
    deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
    fork: ["POST /gists/{gist_id}/forks"],
    get: ["GET /gists/{gist_id}"],
    getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
    getRevision: ["GET /gists/{gist_id}/{sha}"],
    list: ["GET /gists"],
    listComments: ["GET /gists/{gist_id}/comments"],
    listCommits: ["GET /gists/{gist_id}/commits"],
    listForUser: ["GET /users/{username}/gists"],
    listForks: ["GET /gists/{gist_id}/forks"],
    listPublic: ["GET /gists/public"],
    listStarred: ["GET /gists/starred"],
    star: ["PUT /gists/{gist_id}/star"],
    unstar: ["DELETE /gists/{gist_id}/star"],
    update: ["PATCH /gists/{gist_id}"],
    updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"]
  },
  git: {
    createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
    createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
    createRef: ["POST /repos/{owner}/{repo}/git/refs"],
    createTag: ["POST /repos/{owner}/{repo}/git/tags"],
    createTree: ["POST /repos/{owner}/{repo}/git/trees"],
    deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
    getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
    getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
    getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
    getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
    getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
    listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
    updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]
  },
  gitignore: {
    getAllTemplates: ["GET /gitignore/templates"],
    getTemplate: ["GET /gitignore/templates/{name}"]
  },
  interactions: {
    getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    removeRestrictionsForRepo: ["DELETE /repos/{owner}/{repo}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }]
  },
  issues: {
    addAssignees: ["POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
    addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
    create: ["POST /repos/{owner}/{repo}/issues"],
    createComment: ["POST /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    createLabel: ["POST /repos/{owner}/{repo}/labels"],
    createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
    deleteComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
    deleteMilestone: ["DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"],
    get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
    getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
    getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
    getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
    list: ["GET /issues"],
    listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
    listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
    listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
    listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
    listEventsForTimeline: ["GET /repos/{owner}/{repo}/issues/{issue_number}/timeline", {
      mediaType: {
        previews: ["mockingbird"]
      }
    }],
    listForAuthenticatedUser: ["GET /user/issues"],
    listForOrg: ["GET /orgs/{org}/issues"],
    listForRepo: ["GET /repos/{owner}/{repo}/issues"],
    listLabelsForMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"],
    listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
    listLabelsOnIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
    lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    removeAllLabels: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    removeAssignees: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
    removeLabel: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"],
    setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
    updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
    updateMilestone: ["PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"]
  },
  licenses: {
    get: ["GET /licenses/{license}"],
    getAllCommonlyUsed: ["GET /licenses"],
    getForRepo: ["GET /repos/{owner}/{repo}/license"]
  },
  markdown: {
    render: ["POST /markdown"],
    renderRaw: ["POST /markdown/raw", {
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    }]
  },
  meta: {
    get: ["GET /meta"]
  },
  migrations: {
    cancelImport: ["DELETE /repos/{owner}/{repo}/import"],
    deleteArchiveForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    deleteArchiveForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    downloadArchiveForOrg: ["GET /orgs/{org}/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    getArchiveForAuthenticatedUser: ["GET /user/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    getCommitAuthors: ["GET /repos/{owner}/{repo}/import/authors"],
    getImportStatus: ["GET /repos/{owner}/{repo}/import"],
    getLargeFiles: ["GET /repos/{owner}/{repo}/import/large_files"],
    getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listForAuthenticatedUser: ["GET /user/migrations", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listForOrg: ["GET /orgs/{org}/migrations", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listReposForUser: ["GET /user/migrations/{migration_id}/repositories", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    mapCommitAuthor: ["PATCH /repos/{owner}/{repo}/import/authors/{author_id}"],
    setLfsPreference: ["PATCH /repos/{owner}/{repo}/import/lfs"],
    startForAuthenticatedUser: ["POST /user/migrations"],
    startForOrg: ["POST /orgs/{org}/migrations"],
    startImport: ["PUT /repos/{owner}/{repo}/import"],
    unlockRepoForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    unlockRepoForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    updateImport: ["PATCH /repos/{owner}/{repo}/import"]
  },
  orgs: {
    blockUser: ["PUT /orgs/{org}/blocks/{username}"],
    checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
    checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
    checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
    convertMemberToOutsideCollaborator: ["PUT /orgs/{org}/outside_collaborators/{username}"],
    createInvitation: ["POST /orgs/{org}/invitations"],
    createWebhook: ["POST /orgs/{org}/hooks"],
    deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
    get: ["GET /orgs/{org}"],
    getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
    getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
    getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
    list: ["GET /organizations"],
    listAppInstallations: ["GET /orgs/{org}/installations"],
    listBlockedUsers: ["GET /orgs/{org}/blocks"],
    listForAuthenticatedUser: ["GET /user/orgs"],
    listForUser: ["GET /users/{username}/orgs"],
    listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
    listMembers: ["GET /orgs/{org}/members"],
    listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
    listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
    listPendingInvitations: ["GET /orgs/{org}/invitations"],
    listPublicMembers: ["GET /orgs/{org}/public_members"],
    listWebhooks: ["GET /orgs/{org}/hooks"],
    pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
    removeMember: ["DELETE /orgs/{org}/members/{username}"],
    removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
    removeOutsideCollaborator: ["DELETE /orgs/{org}/outside_collaborators/{username}"],
    removePublicMembershipForAuthenticatedUser: ["DELETE /orgs/{org}/public_members/{username}"],
    setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
    setPublicMembershipForAuthenticatedUser: ["PUT /orgs/{org}/public_members/{username}"],
    unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
    update: ["PATCH /orgs/{org}"],
    updateMembershipForAuthenticatedUser: ["PATCH /user/memberships/orgs/{org}"],
    updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"]
  },
  projects: {
    addCollaborator: ["PUT /projects/{project_id}/collaborators/{username}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createCard: ["POST /projects/columns/{column_id}/cards", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createColumn: ["POST /projects/{project_id}/columns", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createForAuthenticatedUser: ["POST /user/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createForOrg: ["POST /orgs/{org}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createForRepo: ["POST /repos/{owner}/{repo}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    delete: ["DELETE /projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    deleteCard: ["DELETE /projects/columns/cards/{card_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    deleteColumn: ["DELETE /projects/columns/{column_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    get: ["GET /projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    getCard: ["GET /projects/columns/cards/{card_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    getColumn: ["GET /projects/columns/{column_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    getPermissionForUser: ["GET /projects/{project_id}/collaborators/{username}/permission", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listCards: ["GET /projects/columns/{column_id}/cards", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listCollaborators: ["GET /projects/{project_id}/collaborators", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listColumns: ["GET /projects/{project_id}/columns", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listForOrg: ["GET /orgs/{org}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listForRepo: ["GET /repos/{owner}/{repo}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listForUser: ["GET /users/{username}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    moveCard: ["POST /projects/columns/cards/{card_id}/moves", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    moveColumn: ["POST /projects/columns/{column_id}/moves", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    removeCollaborator: ["DELETE /projects/{project_id}/collaborators/{username}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    update: ["PATCH /projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    updateCard: ["PATCH /projects/columns/cards/{card_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    updateColumn: ["PATCH /projects/columns/{column_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }]
  },
  pulls: {
    checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    create: ["POST /repos/{owner}/{repo}/pulls"],
    createReplyForReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"],
    createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    createReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
    deletePendingReview: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    deleteReviewComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    dismissReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"],
    get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
    getReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    list: ["GET /repos/{owner}/{repo}/pulls"],
    listCommentsForReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"],
    listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
    listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
    listRequestedReviewers: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    listReviewComments: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
    listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
    listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    removeRequestedReviewers: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    requestReviewers: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    submitReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"],
    update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
    updateBranch: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch", {
      mediaType: {
        previews: ["lydian"]
      }
    }],
    updateReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    updateReviewComment: ["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"]
  },
  rateLimit: {
    get: ["GET /rate_limit"]
  },
  reactions: {
    createForCommitComment: ["POST /repos/{owner}/{repo}/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForIssueComment: ["POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForPullRequestReviewComment: ["POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForTeamDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForTeamDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForIssueComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForPullRequestComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForTeamDiscussion: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForTeamDiscussionComment: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteLegacy: ["DELETE /reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }, {
      deprecated: "octokit.reactions.deleteLegacy() is deprecated, see https://developer.github.com/v3/reactions/#delete-a-reaction-legacy"
    }],
    listForCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForIssueComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForPullRequestReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForTeamDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForTeamDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }]
  },
  repos: {
    acceptInvitation: ["PATCH /user/repository_invitations/{invitation_id}"],
    addAppAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
    addStatusCheckContexts: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    addTeamAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    addUserAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
    checkVulnerabilityAlerts: ["GET /repos/{owner}/{repo}/vulnerability-alerts", {
      mediaType: {
        previews: ["dorian"]
      }
    }],
    compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
    createCommitComment: ["POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
    createCommitSignatureProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }],
    createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
    createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
    createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
    createDeploymentStatus: ["POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
    createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
    createForAuthenticatedUser: ["POST /user/repos"],
    createFork: ["POST /repos/{owner}/{repo}/forks"],
    createInOrg: ["POST /orgs/{org}/repos"],
    createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
    createPagesSite: ["POST /repos/{owner}/{repo}/pages", {
      mediaType: {
        previews: ["switcheroo"]
      }
    }],
    createRelease: ["POST /repos/{owner}/{repo}/releases"],
    createUsingTemplate: ["POST /repos/{template_owner}/{template_repo}/generate", {
      mediaType: {
        previews: ["baptiste"]
      }
    }],
    createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
    declineInvitation: ["DELETE /user/repository_invitations/{invitation_id}"],
    delete: ["DELETE /repos/{owner}/{repo}"],
    deleteAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
    deleteAdminBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    deleteBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"],
    deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
    deleteCommitSignatureProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }],
    deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
    deleteDeployment: ["DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"],
    deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
    deleteInvitation: ["DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"],
    deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages", {
      mediaType: {
        previews: ["switcheroo"]
      }
    }],
    deletePullRequestReviewProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
    deleteReleaseAsset: ["DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
    disableAutomatedSecurityFixes: ["DELETE /repos/{owner}/{repo}/automated-security-fixes", {
      mediaType: {
        previews: ["london"]
      }
    }],
    disableVulnerabilityAlerts: ["DELETE /repos/{owner}/{repo}/vulnerability-alerts", {
      mediaType: {
        previews: ["dorian"]
      }
    }],
    downloadArchive: ["GET /repos/{owner}/{repo}/{archive_format}/{ref}"],
    enableAutomatedSecurityFixes: ["PUT /repos/{owner}/{repo}/automated-security-fixes", {
      mediaType: {
        previews: ["london"]
      }
    }],
    enableVulnerabilityAlerts: ["PUT /repos/{owner}/{repo}/vulnerability-alerts", {
      mediaType: {
        previews: ["dorian"]
      }
    }],
    get: ["GET /repos/{owner}/{repo}"],
    getAccessRestrictions: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
    getAdminBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    getAllStatusCheckContexts: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"],
    getAllTopics: ["GET /repos/{owner}/{repo}/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    getAppsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"],
    getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
    getBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection"],
    getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
    getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
    getCollaboratorPermissionLevel: ["GET /repos/{owner}/{repo}/collaborators/{username}/permission"],
    getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
    getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
    getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
    getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
    getCommitSignatureProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }],
    getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile", {
      mediaType: {
        previews: ["black-panther"]
      }
    }],
    getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
    getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
    getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
    getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
    getDeploymentStatus: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"],
    getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
    getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
    getPages: ["GET /repos/{owner}/{repo}/pages"],
    getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
    getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
    getPullRequestReviewProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
    getReadme: ["GET /repos/{owner}/{repo}/readme"],
    getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
    getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
    getStatusChecksProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    getTeamsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"],
    getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
    getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
    getUsersWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"],
    getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
    getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
    listBranches: ["GET /repos/{owner}/{repo}/branches"],
    listBranchesForHeadCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head", {
      mediaType: {
        previews: ["groot"]
      }
    }],
    listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
    listCommentsForCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
    listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
    listCommitStatusesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/statuses"],
    listCommits: ["GET /repos/{owner}/{repo}/commits"],
    listContributors: ["GET /repos/{owner}/{repo}/contributors"],
    listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
    listDeploymentStatuses: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
    listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
    listForAuthenticatedUser: ["GET /user/repos"],
    listForOrg: ["GET /orgs/{org}/repos"],
    listForUser: ["GET /users/{username}/repos"],
    listForks: ["GET /repos/{owner}/{repo}/forks"],
    listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
    listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
    listLanguages: ["GET /repos/{owner}/{repo}/languages"],
    listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
    listPublic: ["GET /repositories"],
    listPullRequestsAssociatedWithCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls", {
      mediaType: {
        previews: ["groot"]
      }
    }],
    listReleaseAssets: ["GET /repos/{owner}/{repo}/releases/{release_id}/assets"],
    listReleases: ["GET /repos/{owner}/{repo}/releases"],
    listTags: ["GET /repos/{owner}/{repo}/tags"],
    listTeams: ["GET /repos/{owner}/{repo}/teams"],
    listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
    merge: ["POST /repos/{owner}/{repo}/merges"],
    pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
    removeAppAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    removeCollaborator: ["DELETE /repos/{owner}/{repo}/collaborators/{username}"],
    removeStatusCheckContexts: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    removeStatusCheckProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    removeTeamAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    removeUserAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
    setAdminBranchProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    setAppAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    setStatusCheckContexts: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    setTeamAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    setUserAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
    transfer: ["POST /repos/{owner}/{repo}/transfer"],
    update: ["PATCH /repos/{owner}/{repo}"],
    updateBranchProtection: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection"],
    updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
    updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
    updateInvitation: ["PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"],
    updatePullRequestReviewProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
    updateReleaseAsset: ["PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    updateStatusCheckPotection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
    uploadReleaseAsset: ["POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}", {
      baseUrl: "https://uploads.github.com"
    }]
  },
  search: {
    code: ["GET /search/code"],
    commits: ["GET /search/commits", {
      mediaType: {
        previews: ["cloak"]
      }
    }],
    issuesAndPullRequests: ["GET /search/issues"],
    labels: ["GET /search/labels"],
    repos: ["GET /search/repositories"],
    topics: ["GET /search/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    users: ["GET /search/users"]
  },
  teams: {
    addOrUpdateMembershipForUserInOrg: ["PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    addOrUpdateProjectPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    addOrUpdateRepoPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    checkPermissionsForProjectInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    checkPermissionsForRepoInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    create: ["POST /orgs/{org}/teams"],
    createDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
    createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
    deleteDiscussionCommentInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    deleteDiscussionInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
    getByName: ["GET /orgs/{org}/teams/{team_slug}"],
    getDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    getDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    getMembershipForUserInOrg: ["GET /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    list: ["GET /orgs/{org}/teams"],
    listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
    listDiscussionCommentsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
    listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
    listForAuthenticatedUser: ["GET /user/teams"],
    listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
    listPendingInvitationsInOrg: ["GET /orgs/{org}/teams/{team_slug}/invitations"],
    listProjectsInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
    removeMembershipForUserInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    removeProjectInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}"],
    removeRepoInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    updateDiscussionCommentInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    updateDiscussionInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
  },
  users: {
    addEmailForAuthenticated: ["POST /user/emails"],
    block: ["PUT /user/blocks/{username}"],
    checkBlocked: ["GET /user/blocks/{username}"],
    checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
    checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
    createGpgKeyForAuthenticated: ["POST /user/gpg_keys"],
    createPublicSshKeyForAuthenticated: ["POST /user/keys"],
    deleteEmailForAuthenticated: ["DELETE /user/emails"],
    deleteGpgKeyForAuthenticated: ["DELETE /user/gpg_keys/{gpg_key_id}"],
    deletePublicSshKeyForAuthenticated: ["DELETE /user/keys/{key_id}"],
    follow: ["PUT /user/following/{username}"],
    getAuthenticated: ["GET /user"],
    getByUsername: ["GET /users/{username}"],
    getContextForUser: ["GET /users/{username}/hovercard"],
    getGpgKeyForAuthenticated: ["GET /user/gpg_keys/{gpg_key_id}"],
    getPublicSshKeyForAuthenticated: ["GET /user/keys/{key_id}"],
    list: ["GET /users"],
    listBlockedByAuthenticated: ["GET /user/blocks"],
    listEmailsForAuthenticated: ["GET /user/emails"],
    listFollowedByAuthenticated: ["GET /user/following"],
    listFollowersForAuthenticatedUser: ["GET /user/followers"],
    listFollowersForUser: ["GET /users/{username}/followers"],
    listFollowingForUser: ["GET /users/{username}/following"],
    listGpgKeysForAuthenticated: ["GET /user/gpg_keys"],
    listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
    listPublicEmailsForAuthenticated: ["GET /user/public_emails"],
    listPublicKeysForUser: ["GET /users/{username}/keys"],
    listPublicSshKeysForAuthenticated: ["GET /user/keys"],
    setPrimaryEmailVisibilityForAuthenticated: ["PATCH /user/email/visibility"],
    unblock: ["DELETE /user/blocks/{username}"],
    unfollow: ["DELETE /user/following/{username}"],
    updateAuthenticated: ["PATCH /user"]
  }
};

const VERSION = "4.2.1";

function endpointsToMethods(octokit, endpointsMap) {
  const newMethods = {};

  for (const [scope, endpoints] of Object.entries(endpointsMap)) {
    for (const [methodName, endpoint] of Object.entries(endpoints)) {
      const [route, defaults, decorations] = endpoint;
      const [method, url] = route.split(/ /);
      const endpointDefaults = Object.assign({
        method,
        url
      }, defaults);

      if (!newMethods[scope]) {
        newMethods[scope] = {};
      }

      const scopeMethods = newMethods[scope];

      if (decorations) {
        scopeMethods[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
        continue;
      }

      scopeMethods[methodName] = octokit.request.defaults(endpointDefaults);
    }
  }

  return newMethods;
}

function decorate(octokit, scope, methodName, defaults, decorations) {
  const requestWithDefaults = octokit.request.defaults(defaults);
  /* istanbul ignore next */

  function withDecorations(...args) {
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
    let options = requestWithDefaults.endpoint.merge(...args); // There are currently no other decorations than `.mapToData`

    if (decorations.mapToData) {
      options = Object.assign({}, options, {
        data: options[decorations.mapToData],
        [decorations.mapToData]: undefined
      });
      return requestWithDefaults(options);
    }

    if (decorations.renamed) {
      const [newScope, newMethodName] = decorations.renamed;
      octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
    }

    if (decorations.deprecated) {
      octokit.log.warn(decorations.deprecated);
    }

    if (decorations.renamedParameters) {
      // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
      const options = requestWithDefaults.endpoint.merge(...args);

      for (const [name, alias] of Object.entries(decorations.renamedParameters)) {
        if (name in options) {
          octokit.log.warn(`"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`);

          if (!(alias in options)) {
            options[alias] = options[name];
          }

          delete options[name];
        }
      }

      return requestWithDefaults(options);
    } // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488


    return requestWithDefaults(...args);
  }

  return Object.assign(withDecorations, requestWithDefaults);
}

/**
 * This plugin is a 1:1 copy of internal @octokit/rest plugins. The primary
 * goal is to rebuild @octokit/rest on top of @octokit/core. Once that is
 * done, we will remove the registerEndpoints methods and return the methods
 * directly as with the other plugins. At that point we will also remove the
 * legacy workarounds and deprecations.
 *
 * See the plan at
 * https://github.com/octokit/plugin-rest-endpoint-methods.js/pull/1
 */

function restEndpointMethods(octokit) {
  return endpointsToMethods(octokit, Endpoints);
}
restEndpointMethods.VERSION = VERSION;

exports.restEndpointMethods = restEndpointMethods;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 537:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var deprecation = __webpack_require__(932);
var once = _interopDefault(__webpack_require__(223));

const logOnce = once(deprecation => console.warn(deprecation));
/**
 * Error with extra properties to help with debugging
 */

class RequestError extends Error {
  constructor(message, statusCode, options) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = "HttpError";
    this.status = statusCode;
    Object.defineProperty(this, "code", {
      get() {
        logOnce(new deprecation.Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
        return statusCode;
      }

    });
    this.headers = options.headers || {}; // redact request credentials without mutating original request options

    const requestCopy = Object.assign({}, options.request);

    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]")
      });
    }

    requestCopy.url = requestCopy.url // client_id & client_secret can be passed as URL query parameters to increase rate limit
    // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
    .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]") // OAuth tokens can be passed as URL query parameters, although it is not recommended
    // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
    .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
    this.request = requestCopy;
  }

}

exports.RequestError = RequestError;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 234:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var endpoint = __webpack_require__(440);
var universalUserAgent = __webpack_require__(429);
var isPlainObject = __webpack_require__(287);
var nodeFetch = _interopDefault(__webpack_require__(467));
var requestError = __webpack_require__(537);

const VERSION = "5.4.10";

function getBufferResponse(response) {
  return response.arrayBuffer();
}

function fetchWrapper(requestOptions) {
  if (isPlainObject.isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  let headers = {};
  let status;
  let url;
  const fetch = requestOptions.request && requestOptions.request.fetch || nodeFetch;
  return fetch(requestOptions.url, Object.assign({
    method: requestOptions.method,
    body: requestOptions.body,
    headers: requestOptions.headers,
    redirect: requestOptions.redirect
  }, requestOptions.request)).then(response => {
    url = response.url;
    status = response.status;

    for (const keyAndValue of response.headers) {
      headers[keyAndValue[0]] = keyAndValue[1];
    }

    if (status === 204 || status === 205) {
      return;
    } // GitHub API returns 200 for HEAD requests


    if (requestOptions.method === "HEAD") {
      if (status < 400) {
        return;
      }

      throw new requestError.RequestError(response.statusText, status, {
        headers,
        request: requestOptions
      });
    }

    if (status === 304) {
      throw new requestError.RequestError("Not modified", status, {
        headers,
        request: requestOptions
      });
    }

    if (status >= 400) {
      return response.text().then(message => {
        const error = new requestError.RequestError(message, status, {
          headers,
          request: requestOptions
        });

        try {
          let responseBody = JSON.parse(error.message);
          Object.assign(error, responseBody);
          let errors = responseBody.errors; // Assumption `errors` would always be in Array format

          error.message = error.message + ": " + errors.map(JSON.stringify).join(", ");
        } catch (e) {// ignore, see octokit/rest.js#684
        }

        throw error;
      });
    }

    const contentType = response.headers.get("content-type");

    if (/application\/json/.test(contentType)) {
      return response.json();
    }

    if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
      return response.text();
    }

    return getBufferResponse(response);
  }).then(data => {
    return {
      status,
      url,
      headers,
      data
    };
  }).catch(error => {
    if (error instanceof requestError.RequestError) {
      throw error;
    }

    throw new requestError.RequestError(error.message, 500, {
      headers,
      request: requestOptions
    });
  });
}

function withDefaults(oldEndpoint, newDefaults) {
  const endpoint = oldEndpoint.defaults(newDefaults);

  const newApi = function (route, parameters) {
    const endpointOptions = endpoint.merge(route, parameters);

    if (!endpointOptions.request || !endpointOptions.request.hook) {
      return fetchWrapper(endpoint.parse(endpointOptions));
    }

    const request = (route, parameters) => {
      return fetchWrapper(endpoint.parse(endpoint.merge(route, parameters)));
    };

    Object.assign(request, {
      endpoint,
      defaults: withDefaults.bind(null, endpoint)
    });
    return endpointOptions.request.hook(request, endpointOptions);
  };

  return Object.assign(newApi, {
    endpoint,
    defaults: withDefaults.bind(null, endpoint)
  });
}

const request = withDefaults(endpoint.endpoint, {
  headers: {
    "user-agent": `octokit-request.js/${VERSION} ${universalUserAgent.getUserAgent()}`
  }
});

exports.request = request;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 682:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var register = __webpack_require__(670)
var addHook = __webpack_require__(549)
var removeHook = __webpack_require__(819)

// bind with array of arguments: https://stackoverflow.com/a/21792913
var bind = Function.bind
var bindable = bind.bind(bind)

function bindApi (hook, state, name) {
  var removeHookRef = bindable(removeHook, null).apply(null, name ? [state, name] : [state])
  hook.api = { remove: removeHookRef }
  hook.remove = removeHookRef

  ;['before', 'error', 'after', 'wrap'].forEach(function (kind) {
    var args = name ? [state, kind, name] : [state, kind]
    hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args)
  })
}

function HookSingular () {
  var singularHookName = 'h'
  var singularHookState = {
    registry: {}
  }
  var singularHook = register.bind(null, singularHookState, singularHookName)
  bindApi(singularHook, singularHookState, singularHookName)
  return singularHook
}

function HookCollection () {
  var state = {
    registry: {}
  }

  var hook = register.bind(null, state)
  bindApi(hook, state)

  return hook
}

var collectionHookDeprecationMessageDisplayed = false
function Hook () {
  if (!collectionHookDeprecationMessageDisplayed) {
    console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4')
    collectionHookDeprecationMessageDisplayed = true
  }
  return HookCollection()
}

Hook.Singular = HookSingular.bind()
Hook.Collection = HookCollection.bind()

module.exports = Hook
// expose constructors as a named property for TypeScript
module.exports.Hook = Hook
module.exports.Singular = Hook.Singular
module.exports.Collection = Hook.Collection


/***/ }),

/***/ 549:
/***/ ((module) => {

module.exports = addHook

function addHook (state, kind, name, hook) {
  var orig = hook
  if (!state.registry[name]) {
    state.registry[name] = []
  }

  if (kind === 'before') {
    hook = function (method, options) {
      return Promise.resolve()
        .then(orig.bind(null, options))
        .then(method.bind(null, options))
    }
  }

  if (kind === 'after') {
    hook = function (method, options) {
      var result
      return Promise.resolve()
        .then(method.bind(null, options))
        .then(function (result_) {
          result = result_
          return orig(result, options)
        })
        .then(function () {
          return result
        })
    }
  }

  if (kind === 'error') {
    hook = function (method, options) {
      return Promise.resolve()
        .then(method.bind(null, options))
        .catch(function (error) {
          return orig(error, options)
        })
    }
  }

  state.registry[name].push({
    hook: hook,
    orig: orig
  })
}


/***/ }),

/***/ 670:
/***/ ((module) => {

module.exports = register

function register (state, name, method, options) {
  if (typeof method !== 'function') {
    throw new Error('method for before hook must be a function')
  }

  if (!options) {
    options = {}
  }

  if (Array.isArray(name)) {
    return name.reverse().reduce(function (callback, name) {
      return register.bind(null, state, name, callback, options)
    }, method)()
  }

  return Promise.resolve()
    .then(function () {
      if (!state.registry[name]) {
        return method(options)
      }

      return (state.registry[name]).reduce(function (method, registered) {
        return registered.hook.bind(null, method, options)
      }, method)()
    })
}


/***/ }),

/***/ 819:
/***/ ((module) => {

module.exports = removeHook

function removeHook (state, name, method) {
  if (!state.registry[name]) {
    return
  }

  var index = state.registry[name]
    .map(function (registered) { return registered.orig })
    .indexOf(method)

  if (index === -1) {
    return
  }

  state.registry[name].splice(index, 1)
}


/***/ }),

/***/ 932:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

class Deprecation extends Error {
  constructor(message) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'Deprecation';
  }

}

exports.Deprecation = Deprecation;


/***/ }),

/***/ 287:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  var ctor,prot;

  if (isObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

exports.isPlainObject = isPlainObject;


/***/ }),

/***/ 467:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(__webpack_require__(413));
var http = _interopDefault(__webpack_require__(605));
var Url = _interopDefault(__webpack_require__(835));
var https = _interopDefault(__webpack_require__(211));
var zlib = _interopDefault(__webpack_require__(761));

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = __webpack_require__(877).convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

module.exports = exports = fetch;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;


/***/ }),

/***/ 223:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var wrappy = __webpack_require__(940)
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),

/***/ 294:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(219);


/***/ }),

/***/ 219:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var net = __webpack_require__(631);
var tls = __webpack_require__(16);
var http = __webpack_require__(605);
var https = __webpack_require__(211);
var events = __webpack_require__(614);
var assert = __webpack_require__(357);
var util = __webpack_require__(669);


exports.httpOverHttp = httpOverHttp;
exports.httpsOverHttp = httpsOverHttp;
exports.httpOverHttps = httpOverHttps;
exports.httpsOverHttps = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self = this;
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket)
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}


var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  }
} else {
  debug = function() {};
}
exports.debug = debug; // for test


/***/ }),

/***/ 839:
/***/ ((__unused_webpack_module, exports) => {

class e{constructor(e){const{length:a,separator:i,dictionaries:n,style:l,seed:r}=e;this.dictionaries=n,this.separator=i,this.length=a,this.style=l,this.seed=r}generate(){if(!this.dictionaries)throw new Error('Cannot find any dictionary. Please provide at least one, or leave the "dictionary" field empty in the config object');if(this.length<=0)throw new Error("Invalid length provided");if(this.length>this.dictionaries.length)throw new Error(`The length cannot be bigger than the number of dictionaries.\nLength provided: ${this.length}. Number of dictionaries provided: ${this.dictionaries.length}`);return this.dictionaries.slice(0,this.length).reduce((e,a)=>{let i=a[Math.floor((this.seed?(n=this.seed,(e=>{e=1831565813+(e|=0)|0;let a=Math.imul(e^e>>>15,1|e);return a=a+Math.imul(a^a>>>7,61|a)^a,((a^a>>>14)>>>0)/4294967296})(n)):Math.random())*a.length)]||"";var n;if("lowerCase"===this.style)i=i.toLowerCase();else if("capital"===this.style){const[e,...a]=i.split("");i=e.toUpperCase()+a.join("")}else"upperCase"===this.style&&(i=i.toUpperCase());return e?`${e}${this.separator}${i}`:""+i},"")}}const a={separator:"_",dictionaries:[]};exports.NumberDictionary=class{static generate(e={}){let a=e.min||1,i=e.max||999;if(e.length){const n=Math.pow(10,e.length);return a=n/10,i=n-1,[""+(Math.floor(Math.random()*(i-a))+a)]}return[""+(Math.floor(Math.random()*(i-a))+a)]}},exports.adjectives=["average","big","colossal","fat","giant","gigantic","great","huge","immense","large","little","long","mammoth","massive","miniature","petite","puny","short","small","tall","tiny","boiling","breezy","broken","bumpy","chilly","cold","cool","creepy","crooked","cuddly","curly","damaged","damp","dirty","dry","dusty","filthy","flaky","fluffy","wet","broad","chubby","crooked","curved","deep","flat","high","hollow","low","narrow","round","shallow","skinny","square","steep","straight","wide","ancient","brief","early","fast","late","long","modern","old","quick","rapid","short","slow","swift","young","abundant","empty","few","heavy","light","many","numerous","Sound","cooing","deafening","faint","harsh","hissing","hushed","husky","loud","melodic","moaning","mute","noisy","purring","quiet","raspy","resonant","screeching","shrill","silent","soft","squealing","thundering","voiceless","whispering","bitter","delicious","fresh","juicy","ripe","rotten","salty","sour","spicy","stale","sticky","strong","sweet","tasteless","tasty","thirsty","fluttering","fuzzy","greasy","grubby","hard","hot","icy","loose","melted","plastic","prickly","rainy","rough","scattered","shaggy","shaky","sharp","shivering","silky","slimy","slippery","smooth","soft","solid","steady","sticky","tender","tight","uneven","weak","wet","wooden","afraid","angry","annoyed","anxious","arrogant","ashamed","awful","bad","bewildered","bored","combative","condemned","confused","creepy","cruel","dangerous","defeated","defiant","depressed","disgusted","disturbed","eerie","embarrassed","envious","evil","fierce","foolish","frantic","frightened","grieving","helpless","homeless","hungry","hurt","ill","jealous","lonely","mysterious","naughty","nervous","obnoxious","outrageous","panicky","repulsive","scary","scornful","selfish","sore","tense","terrible","thoughtless","tired","troubled","upset","uptight","weary","wicked","worried","agreeable","amused","brave","calm","charming","cheerful","comfortable","cooperative","courageous","delightful","determined","eager","elated","enchanting","encouraging","energetic","enthusiastic","excited","exuberant","fair","faithful","fantastic","fine","friendly","funny","gentle","glorious","good","happy","healthy","helpful","hilarious","jolly","joyous","kind","lively","lovely","lucky","obedient","perfect","pleasant","proud","relieved","silly","smiling","splendid","successful","thoughtful","victorious","vivacious","witty","wonderful","zealous","zany","other","good","new","old","great","high","small","different","large","local","social","important","long","young","national","british","right","early","possible","big","little","political","able","late","general","full","far","low","public","available","bad","main","sure","clear","major","economic","only","likely","real","black","particular","international","special","difficult","certain","open","whole","white","free","short","easy","strong","european","central","similar","human","common","necessary","single","personal","hard","private","poor","financial","wide","foreign","simple","recent","concerned","american","various","close","fine","english","wrong","present","royal","natural","individual","nice","french","following","current","modern","labour","legal","happy","final","red","normal","serious","previous","total","prime","significant","industrial","sorry","dead","specific","appropriate","top","soviet","basic","military","original","successful","aware","hon","popular","heavy","professional","direct","dark","cold","ready","green","useful","effective","western","traditional","scottish","german","independent","deep","interesting","considerable","involved","physical","left","hot","existing","responsible","complete","medical","blue","extra","past","male","interested","fair","essential","beautiful","civil","primary","obvious","future","environmental","positive","senior","nuclear","annual","relevant","huge","rich","commercial","safe","regional","practical","official","separate","key","chief","regular","due","additional","active","powerful","complex","standard","impossible","light","warm","middle","fresh","sexual","front","domestic","actual","united","technical","ordinary","cheap","strange","internal","excellent","quiet","soft","potential","northern","religious","quick","very","famous","cultural","proper","broad","joint","formal","limited","conservative","lovely","usual","ltd","unable","rural","initial","substantial","christian","bright","average","leading","reasonable","immediate","suitable","equal","detailed","working","overall","female","afraid","democratic","growing","sufficient","scientific","eastern","correct","inc","irish","expensive","educational","mental","dangerous","critical","increased","familiar","unlikely","double","perfect","slow","tiny","dry","historical","thin","daily","southern","increasing","wild","alone","urban","empty","married","narrow","liberal","supposed","upper","apparent","tall","busy","bloody","prepared","russian","moral","careful","clean","attractive","japanese","vital","thick","alternative","fast","ancient","elderly","rare","external","capable","brief","wonderful","grand","typical","entire","grey","constant","vast","surprised","ideal","terrible","academic","funny","minor","pleased","severe","ill","corporate","negative","permanent","weak","brown","fundamental","odd","crucial","inner","used","criminal","contemporary","sharp","sick","near","roman","massive","unique","secondary","parliamentary","african","unknown","subsequent","angry","alive","guilty","lucky","enormous","well","communist","yellow","unusual","net","tough","dear","extensive","glad","remaining","agricultural","alright","healthy","italian","principal","tired","efficient","comfortable","chinese","relative","friendly","conventional","willing","sudden","proposed","voluntary","slight","valuable","dramatic","golden","temporary","federal","keen","flat","silent","indian","worried","pale","statutory","welsh","dependent","firm","wet","competitive","armed","radical","outside","acceptable","sensitive","living","pure","global","emotional","sad","secret","rapid","adequate","fixed","sweet","administrative","wooden","remarkable","comprehensive","surprising","solid","rough","mere","mass","brilliant","maximum","absolute","tory","electronic","visual","electric","cool","spanish","literary","continuing","supreme","chemical","genuine","exciting","written","stupid","advanced","extreme","classical","fit","favourite","socialist","widespread","confident","straight","catholic","proud","numerous","opposite","distinct","mad","helpful","given","disabled","consistent","anxious","nervous","awful","stable","constitutional","satisfied","conscious","developing","strategic","holy","smooth","dominant","remote","theoretical","outstanding","pink","pretty","clinical","minimum","honest","impressive","related","residential","extraordinary","plain","visible","accurate","distant","still","greek","complicated","musical","precise","gentle","broken","live","silly","fat","tight","monetary","round","psychological","violent","unemployed","inevitable","junior","sensible","grateful","pleasant","dirty","structural","welcome","deaf","above","continuous","blind","overseas","mean","entitled","delighted","loose","occasional","evident","desperate","fellow","universal","square","steady","classic","equivalent","intellectual","victorian","level","ultimate","creative","lost","medieval","clever","linguistic","convinced","judicial","raw","sophisticated","asleep","vulnerable","illegal","outer","revolutionary","bitter","changing","australian","native","imperial","strict","wise","informal","flexible","collective","frequent","experimental","spiritual","intense","rational","ethnic","generous","inadequate","prominent","logical","bare","historic","modest","dutch","acute","electrical","valid","weekly","gross","automatic","loud","reliable","mutual","liable","multiple","ruling","curious","arab","sole","jewish","managing","pregnant","latin","nearby","exact","underlying","identical","satisfactory","marginal","distinctive","electoral","urgent","presidential","controversial","oral","everyday","encouraging","organic","continued","expected","statistical","desirable","innocent","improved","exclusive","marked","experienced","unexpected","superb","sheer","disappointed","frightened","gastric","capitalist","romantic","naked","reluctant","magnificent","convenient","established","closed","uncertain","artificial","diplomatic","tremendous","marine","mechanical","retail","institutional","mixed","required","biological","known","functional","straightforward","superior","digital","spectacular","unhappy","confused","unfair","aggressive","spare","painful","abstract","asian","associated","legislative","monthly","intelligent","hungry","explicit","nasty","just","faint","coloured","ridiculous","amazing","comparable","successive","realistic","back","decent","unnecessary","flying","random","influential","dull","genetic","neat","marvellous","crazy","damp","giant","secure","bottom","skilled","subtle","elegant","brave","lesser","parallel","steep","intensive","casual","tropical","lonely","partial","preliminary","concrete","alleged","assistant","vertical","upset","delicate","mild","occupational","excessive","progressive","iraqi","exceptional","integrated","striking","continental","okay","harsh","combined","fierce","handsome","characteristic","chronic","compulsory","interim","objective","splendid","magic","systematic","obliged","payable","fun","horrible","primitive","fascinating","ideological","metropolitan","surrounding","estimated","peaceful","premier","operational","technological","kind","advisory","hostile","precious","gay","accessible","determined","excited","impressed","provincial","smart","endless","isolated","drunk","geographical","like","dynamic","boring","forthcoming","unfortunate","definite","super","notable","indirect","stiff","wealthy","awkward","lively","neutral","artistic","content","mature","colonial","ambitious","evil","magnetic","verbal","legitimate","sympathetic","empirical","head","shallow","vague","naval","depressed","shared","added","shocked","mid","worthwhile","qualified","missing","blank","absent","favourable","polish","israeli","developed","profound","representative","enthusiastic","dreadful","rigid","reduced","cruel","coastal","peculiar","racial","ugly","swiss","crude","extended","selected","eager","feminist","canadian","bold","relaxed","corresponding","running","planned","applicable","immense","allied","comparative","uncomfortable","conservation","productive","beneficial","bored","charming","minimal","mobile","turkish","orange","rear","passive","suspicious","overwhelming","fatal","resulting","symbolic","registered","neighbouring","calm","irrelevant","patient","compact","profitable","rival","loyal","moderate","distinguished","interior","noble","insufficient","eligible","mysterious","varying","managerial","molecular","olympic","linear","prospective","printed","parental","diverse","elaborate","furious","fiscal","burning","useless","semantic","embarrassed","inherent","philosophical","deliberate","awake","variable","promising","unpleasant","varied","sacred","selective","inclined","tender","hidden","worthy","intermediate","sound","protective","fortunate","slim","islamic","defensive","divine","stuck","driving","invisible","misleading","circular","mathematical","inappropriate","liquid","persistent","solar","doubtful","manual","architectural","intact","incredible","devoted","prior","tragic","respectable","optimistic","convincing","unacceptable","decisive","competent","spatial","respective","binding","relieved","nursing","toxic","select","redundant","integral","then","probable","amateur","fond","passing","specified","territorial","horizontal","inland","cognitive","regulatory","miserable","resident","polite","scared","marxist","gothic","civilian","instant","lengthy","adverse","korean","unconscious","anonymous","aesthetic","orthodox","static","unaware","costly","fantastic","foolish","fashionable","causal","compatible","wee","implicit","dual","ok","cheerful","subjective","forward","surviving","exotic","purple","cautious","visiting","aggregate","ethical","protestant","teenage","dying","disastrous","delicious","confidential","underground","thorough","grim","autonomous","atomic","frozen","colourful","injured","uniform","ashamed","glorious","wicked","coherent","rising","shy","novel","balanced","delightful","arbitrary","adjacent","psychiatric","worrying","weird","unchanged","rolling","evolutionary","intimate","sporting","disciplinary","formidable","lexical","noisy","gradual","accused","homeless","supporting","coming","renewed","excess","retired","rubber","chosen","outdoor","embarrassing","preferred","bizarre","appalling","agreed","imaginative","governing","accepted","vocational","palestinian","mighty","puzzled","worldwide","handicapped","organisational","sunny","eldest","eventual","spontaneous","vivid","rude","faithful","ministerial","innovative","controlled","conceptual","unwilling","civic","meaningful","disturbing","alive","brainy","breakable","busy","careful","cautious","clever","concerned","crazy","curious","dead","different","difficult","doubtful","easy","famous","fragile","helpful","helpless","important","impossible","innocent","inquisitive","modern","open","outstanding","poor","powerful","puzzled","real","rich","shy","sleepy","stupid","super","tame","uninterested","wandering","wild","wrong","adorable","alert","average","beautiful","blonde","bloody","blushing","bright","clean","clear","cloudy","colorful","crowded","cute","dark","drab","distinct","dull","elegant","fancy","filthy","glamorous","gleaming","graceful","grotesque","homely","light","misty","motionless","muddy","plain","poised","quaint","shiny","smoggy","sparkling","spotless","stormy","strange","ugly","unsightly","unusual","bad","better","beautiful","big","black","blue","bright","clumsy","crazy","dizzy","dull","fat","frail","friendly","funny","great","green","gigantic","gorgeous","grumpy","handsome","happy","horrible","itchy","jittery","jolly","kind","long","lazy","magnificent","magenta","many","mighty","mushy","nasty","new","nice","nosy","nutty","nutritious","odd","orange","ordinary","pretty","precious","prickly","purple","quaint","quiet","quick","quickest","rainy","rare","ratty","red","roasted","robust","round","sad","scary","scrawny","short","silly","stingy","strange","striped","spotty","tart","tall","tame","tan","tender","testy","tricky","tough","ugly","ugliest","vast","watery","wasteful","wonderful","yellow","yummy","zany"],exports.animals=["canidae","felidae","cat","cattle","dog","donkey","goat","horse","pig","rabbit","aardvark","aardwolf","albatross","alligator","alpaca","amphibian","anaconda","angelfish","anglerfish","ant","anteater","antelope","antlion","ape","aphid","armadillo","asp","baboon","badger","bandicoot","barnacle","barracuda","basilisk","bass","bat","bear","beaver","bedbug","bee","beetle","bird","bison","blackbird","boa","boar","bobcat","bobolink","bonobo","booby","bovid","bug","butterfly","buzzard","camel","canid","capybara","cardinal","caribou","carp","cat","catshark","caterpillar","catfish","cattle","centipede","cephalopod","chameleon","cheetah","chickadee","chicken","chimpanzee","chinchilla","chipmunk","clam","clownfish","cobra","cockroach","cod","condor","constrictor","coral","cougar","cow","coyote","crab","crane","crawdad","crayfish","cricket","crocodile","crow","cuckoo","cicada","damselfly","deer","dingo","dinosaur","dog","dolphin","donkey","dormouse","dove","dragonfly","dragon","duck","eagle","earthworm","earwig","echidna","eel","egret","elephant","elk","emu","ermine","falcon","ferret","finch","firefly","fish","flamingo","flea","fly","flyingfish","fowl","fox","frog","gamefowl","galliform","gazelle","gecko","gerbil","gibbon","giraffe","goat","goldfish","goose","gopher","gorilla","grasshopper","grouse","guan","guanaco","guineafowl","gull","guppy","haddock","halibut","hamster","hare","harrier","hawk","hedgehog","heron","herring","hippopotamus","hookworm","hornet","horse","hoverfly","hummingbird","hyena","iguana","impala","jackal","jaguar","jay","jellyfish","junglefowl","kangaroo","kingfisher","kite","kiwi","koala","koi","krill","ladybug","lamprey","landfowl","lark","leech","lemming","lemur","leopard","leopon","limpet","lion","lizard","llama","lobster","locust","loon","louse","lungfish","lynx","macaw","mackerel","magpie","mammal","manatee","mandrill","marlin","marmoset","marmot","marsupial","marten","mastodon","meadowlark","meerkat","mink","minnow","mite","mockingbird","mole","mollusk","mongoose","monkey","moose","mosquito","moth","mouse","mule","muskox","narwhal","newt","nightingale","ocelot","octopus","opossum","orangutan","orca","ostrich","otter","owl","ox","panda","panther","parakeet","parrot","parrotfish","partridge","peacock","peafowl","pelican","penguin","perch","pheasant","pig","pigeon","pike","pinniped","piranha","planarian","platypus","pony","porcupine","porpoise","possum","prawn","primate","ptarmigan","puffin","puma","python","quail","quelea","quokka","rabbit","raccoon","rat","rattlesnake","raven","reindeer","reptile","rhinoceros","roadrunner","rodent","rook","rooster","roundworm","sailfish","salamander","salmon","sawfish","scallop","scorpion","seahorse","shark","sheep","shrew","shrimp","silkworm","silverfish","skink","skunk","sloth","slug","smelt","snail","snake","snipe","sole","sparrow","spider","spoonbill","squid","squirrel","starfish","stingray","stoat","stork","sturgeon","swallow","swan","swift","swordfish","swordtail","tahr","takin","tapir","tarantula","tarsier","termite","tern","thrush","tick","tiger","tiglon","toad","tortoise","toucan","trout","tuna","turkey","turtle","tyrannosaurus","urial","vicuna","viper","vole","vulture","wallaby","walrus","wasp","warbler","weasel","whale","whippet","whitefish","wildcat","wildebeest","wildfowl","wolf","wolverine","wombat","woodpecker","worm","wren","xerinae","yak","zebra","alpaca","cat","cattle","chicken","dog","donkey","ferret","gayal","goldfish","guppy","horse","koi","llama","sheep","yak","unicorn"],exports.colors=["amaranth","amber","amethyst","apricot","aqua","aquamarine","azure","beige","black","blue","blush","bronze","brown","chocolate","coffee","copper","coral","crimson","cyan","emerald","fuchsia","gold","gray","green","harlequin","indigo","ivory","jade","lavender","lime","magenta","maroon","moccasin","olive","orange","peach","pink","plum","purple","red","rose","salmon","sapphire","scarlet","silver","tan","teal","tomato","turquoise","violet","white","yellow"],exports.countries=["Afghanistan","Åland Islands","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua & Barbuda","Argentina","Armenia","Aruba","Ascension Island","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Indian Ocean Territory","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Canary Islands","Cape Verde","Caribbean Netherlands","Cayman Islands","Central African Republic","Ceuta & Melilla","Chad","Chile","China","Christmas Island","Cocos Islands","Colombia","Comoros","Congo","Cook Islands","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Curaçao","Cyprus","Czechia","Denmark","Diego Garcia","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Eurozone","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Guiana","French Polynesia","French Southern Territories","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hong Kong SAR China","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau SAR China","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","North Korea","Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Palestinian Territories","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn Islands","Poland","Portugal","Puerto Rico","Qatar","Réunion","Romania","Russia","Rwanda","Samoa","San Marino","São Tomé & Príncipe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Sint Maarten","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia & South Sandwich Islands","South Korea","South Sudan","Spain","Sri Lanka","St. Barthélemy","St. Helena","St. Kitts & Nevis","St. Lucia","St. Martin","St. Pierre & Miquelon","St. Vincent & Grenadines","Sudan","Suriname","Svalbard & Jan Mayen","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad & Tobago","Tristan da Cunha","Tunisia","Turkey","Turkmenistan","Turks & Caicos Islands","Tuvalu","U.S. Outlying Islands","U.S. Virgin Islands","Uganda","Ukraine","United Arab Emirates","United Kingdom","United Nations","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Wallis & Futuna","Western Sahara","Yemen","Zambia","Zimbabwe"],exports.names=["Aaren","Aarika","Abagael","Abagail","Abbe","Abbey","Abbi","Abbie","Abby","Abbye","Abigael","Abigail","Abigale","Abra","Ada","Adah","Adaline","Adan","Adara","Adda","Addi","Addia","Addie","Addy","Adel","Adela","Adelaida","Adelaide","Adele","Adelheid","Adelice","Adelina","Adelind","Adeline","Adella","Adelle","Adena","Adey","Adi","Adiana","Adina","Adora","Adore","Adoree","Adorne","Adrea","Adria","Adriaens","Adrian","Adriana","Adriane","Adrianna","Adrianne","Adriena","Adrienne","Aeriel","Aeriela","Aeriell","Afton","Ag","Agace","Agata","Agatha","Agathe","Aggi","Aggie","Aggy","Agna","Agnella","Agnes","Agnese","Agnesse","Agneta","Agnola","Agretha","Aida","Aidan","Aigneis","Aila","Aile","Ailee","Aileen","Ailene","Ailey","Aili","Ailina","Ailis","Ailsun","Ailyn","Aime","Aimee","Aimil","Aindrea","Ainslee","Ainsley","Ainslie","Ajay","Alaine","Alameda","Alana","Alanah","Alane","Alanna","Alayne","Alberta","Albertina","Albertine","Albina","Alecia","Aleda","Aleece","Aleen","Alejandra","Alejandrina","Alena","Alene","Alessandra","Aleta","Alethea","Alex","Alexa","Alexandra","Alexandrina","Alexi","Alexia","Alexina","Alexine","Alexis","Alfi","Alfie","Alfreda","Alfy","Ali","Alia","Alica","Alice","Alicea","Alicia","Alida","Alidia","Alie","Alika","Alikee","Alina","Aline","Alis","Alisa","Alisha","Alison","Alissa","Alisun","Alix","Aliza","Alla","Alleen","Allegra","Allene","Alli","Allianora","Allie","Allina","Allis","Allison","Allissa","Allix","Allsun","Allx","Ally","Allyce","Allyn","Allys","Allyson","Alma","Almeda","Almeria","Almeta","Almira","Almire","Aloise","Aloisia","Aloysia","Alta","Althea","Alvera","Alverta","Alvina","Alvinia","Alvira","Alyce","Alyda","Alys","Alysa","Alyse","Alysia","Alyson","Alyss","Alyssa","Amabel","Amabelle","Amalea","Amalee","Amaleta","Amalia","Amalie","Amalita","Amalle","Amanda","Amandi","Amandie","Amandy","Amara","Amargo","Amata","Amber","Amberly","Ambur","Ame","Amelia","Amelie","Amelina","Ameline","Amelita","Ami","Amie","Amii","Amil","Amitie","Amity","Ammamaria","Amy","Amye","Ana","Anabal","Anabel","Anabella","Anabelle","Analiese","Analise","Anallese","Anallise","Anastasia","Anastasie","Anastassia","Anatola","Andee","Andeee","Anderea","Andi","Andie","Andra","Andrea","Andreana","Andree","Andrei","Andria","Andriana","Andriette","Andromache","Andy","Anestassia","Anet","Anett","Anetta","Anette","Ange","Angel","Angela","Angele","Angelia","Angelica","Angelika","Angelina","Angeline","Angelique","Angelita","Angelle","Angie","Angil","Angy","Ania","Anica","Anissa","Anita","Anitra","Anjanette","Anjela","Ann","Ann-marie","Anna","Anna-diana","Anna-diane","Anna-maria","Annabal","Annabel","Annabela","Annabell","Annabella","Annabelle","Annadiana","Annadiane","Annalee","Annaliese","Annalise","Annamaria","Annamarie","Anne","Anne-corinne","Anne-marie","Annecorinne","Anneliese","Annelise","Annemarie","Annetta","Annette","Anni","Annice","Annie","Annis","Annissa","Annmaria","Annmarie","Annnora","Annora","Anny","Anselma","Ansley","Anstice","Anthe","Anthea","Anthia","Anthiathia","Antoinette","Antonella","Antonetta","Antonia","Antonie","Antonietta","Antonina","Anya","Appolonia","April","Aprilette","Ara","Arabel","Arabela","Arabele","Arabella","Arabelle","Arda","Ardath","Ardeen","Ardelia","Ardelis","Ardella","Ardelle","Arden","Ardene","Ardenia","Ardine","Ardis","Ardisj","Ardith","Ardra","Ardyce","Ardys","Ardyth","Aretha","Ariadne","Ariana","Aridatha","Ariel","Ariela","Ariella","Arielle","Arlana","Arlee","Arleen","Arlen","Arlena","Arlene","Arleta","Arlette","Arleyne","Arlie","Arliene","Arlina","Arlinda","Arline","Arluene","Arly","Arlyn","Arlyne","Aryn","Ashely","Ashia","Ashien","Ashil","Ashla","Ashlan","Ashlee","Ashleigh","Ashlen","Ashley","Ashli","Ashlie","Ashly","Asia","Astra","Astrid","Astrix","Atalanta","Athena","Athene","Atlanta","Atlante","Auberta","Aubine","Aubree","Aubrette","Aubrey","Aubrie","Aubry","Audi","Audie","Audra","Audre","Audrey","Audrie","Audry","Audrye","Audy","Augusta","Auguste","Augustina","Augustine","Aundrea","Aura","Aurea","Aurel","Aurelea","Aurelia","Aurelie","Auria","Aurie","Aurilia","Aurlie","Auroora","Aurora","Aurore","Austin","Austina","Austine","Ava","Aveline","Averil","Averyl","Avie","Avis","Aviva","Avivah","Avril","Avrit","Ayn","Bab","Babara","Babb","Babbette","Babbie","Babette","Babita","Babs","Bambi","Bambie","Bamby","Barb","Barbabra","Barbara","Barbara-anne","Barbaraanne","Barbe","Barbee","Barbette","Barbey","Barbi","Barbie","Barbra","Barby","Bari","Barrie","Barry","Basia","Bathsheba","Batsheva","Bea","Beatrice","Beatrisa","Beatrix","Beatriz","Bebe","Becca","Becka","Becki","Beckie","Becky","Bee","Beilul","Beitris","Bekki","Bel","Belia","Belicia","Belinda","Belita","Bell","Bella","Bellanca","Belle","Bellina","Belva","Belvia","Bendite","Benedetta","Benedicta","Benedikta","Benetta","Benita","Benni","Bennie","Benny","Benoite","Berenice","Beret","Berget","Berna","Bernadene","Bernadette","Bernadina","Bernadine","Bernardina","Bernardine","Bernelle","Bernete","Bernetta","Bernette","Berni","Bernice","Bernie","Bernita","Berny","Berri","Berrie","Berry","Bert","Berta","Berte","Bertha","Berthe","Berti","Bertie","Bertina","Bertine","Berty","Beryl","Beryle","Bess","Bessie","Bessy","Beth","Bethanne","Bethany","Bethena","Bethina","Betsey","Betsy","Betta","Bette","Bette-ann","Betteann","Betteanne","Betti","Bettina","Bettine","Betty","Bettye","Beulah","Bev","Beverie","Beverlee","Beverley","Beverlie","Beverly","Bevvy","Bianca","Bianka","Bibbie","Bibby","Bibbye","Bibi","Biddie","Biddy","Bidget","Bili","Bill","Billi","Billie","Billy","Billye","Binni","Binnie","Binny","Bird","Birdie","Birgit","Birgitta","Blair","Blaire","Blake","Blakelee","Blakeley","Blanca","Blanch","Blancha","Blanche","Blinni","Blinnie","Blinny","Bliss","Blisse","Blithe","Blondell","Blondelle","Blondie","Blondy","Blythe","Bobbe","Bobbee","Bobbette","Bobbi","Bobbie","Bobby","Bobbye","Bobette","Bobina","Bobine","Bobinette","Bonita","Bonnee","Bonni","Bonnibelle","Bonnie","Bonny","Brana","Brandais","Brande","Brandea","Brandi","Brandice","Brandie","Brandise","Brandy","Breanne","Brear","Bree","Breena","Bren","Brena","Brenda","Brenn","Brenna","Brett","Bria","Briana","Brianna","Brianne","Bride","Bridget","Bridgette","Bridie","Brier","Brietta","Brigid","Brigida","Brigit","Brigitta","Brigitte","Brina","Briney","Brinn","Brinna","Briny","Brit","Brita","Britney","Britni","Britt","Britta","Brittan","Brittaney","Brittani","Brittany","Britte","Britteny","Brittne","Brittney","Brittni","Brook","Brooke","Brooks","Brunhilda","Brunhilde","Bryana","Bryn","Bryna","Brynn","Brynna","Brynne","Buffy","Bunni","Bunnie","Bunny","Cacilia","Cacilie","Cahra","Cairistiona","Caitlin","Caitrin","Cal","Calida","Calla","Calley","Calli","Callida","Callie","Cally","Calypso","Cam","Camala","Camel","Camella","Camellia","Cami","Camila","Camile","Camilla","Camille","Cammi","Cammie","Cammy","Candace","Candi","Candice","Candida","Candide","Candie","Candis","Candra","Candy","Caprice","Cara","Caralie","Caren","Carena","Caresa","Caressa","Caresse","Carey","Cari","Caria","Carie","Caril","Carilyn","Carin","Carina","Carine","Cariotta","Carissa","Carita","Caritta","Carla","Carlee","Carleen","Carlen","Carlene","Carley","Carlie","Carlin","Carlina","Carline","Carlita","Carlota","Carlotta","Carly","Carlye","Carlyn","Carlynn","Carlynne","Carma","Carmel","Carmela","Carmelia","Carmelina","Carmelita","Carmella","Carmelle","Carmen","Carmencita","Carmina","Carmine","Carmita","Carmon","Caro","Carol","Carol-jean","Carola","Carolan","Carolann","Carole","Carolee","Carolin","Carolina","Caroline","Caroljean","Carolyn","Carolyne","Carolynn","Caron","Carree","Carri","Carrie","Carrissa","Carroll","Carry","Cary","Caryl","Caryn","Casandra","Casey","Casi","Casie","Cass","Cassandra","Cassandre","Cassandry","Cassaundra","Cassey","Cassi","Cassie","Cassondra","Cassy","Catarina","Cate","Caterina","Catha","Catharina","Catharine","Cathe","Cathee","Catherin","Catherina","Catherine","Cathi","Cathie","Cathleen","Cathlene","Cathrin","Cathrine","Cathryn","Cathy","Cathyleen","Cati","Catie","Catina","Catlaina","Catlee","Catlin","Catrina","Catriona","Caty","Caye","Cayla","Cecelia","Cecil","Cecile","Ceciley","Cecilia","Cecilla","Cecily","Ceil","Cele","Celene","Celesta","Celeste","Celestia","Celestina","Celestine","Celestyn","Celestyna","Celia","Celie","Celina","Celinda","Celine","Celinka","Celisse","Celka","Celle","Cesya","Chad","Chanda","Chandal","Chandra","Channa","Chantal","Chantalle","Charil","Charin","Charis","Charissa","Charisse","Charita","Charity","Charla","Charlean","Charleen","Charlena","Charlene","Charline","Charlot","Charlotta","Charlotte","Charmain","Charmaine","Charmane","Charmian","Charmine","Charmion","Charo","Charyl","Chastity","Chelsae","Chelsea","Chelsey","Chelsie","Chelsy","Cher","Chere","Cherey","Cheri","Cherianne","Cherice","Cherida","Cherie","Cherilyn","Cherilynn","Cherin","Cherise","Cherish","Cherlyn","Cherri","Cherrita","Cherry","Chery","Cherye","Cheryl","Cheslie","Chiarra","Chickie","Chicky","Chiquia","Chiquita","Chlo","Chloe","Chloette","Chloris","Chris","Chrissie","Chrissy","Christa","Christabel","Christabella","Christal","Christalle","Christan","Christean","Christel","Christen","Christi","Christian","Christiana","Christiane","Christie","Christin","Christina","Christine","Christy","Christye","Christyna","Chrysa","Chrysler","Chrystal","Chryste","Chrystel","Cicely","Cicily","Ciel","Cilka","Cinda","Cindee","Cindelyn","Cinderella","Cindi","Cindie","Cindra","Cindy","Cinnamon","Cissiee","Cissy","Clair","Claire","Clara","Clarabelle","Clare","Claresta","Clareta","Claretta","Clarette","Clarey","Clari","Claribel","Clarice","Clarie","Clarinda","Clarine","Clarissa","Clarisse","Clarita","Clary","Claude","Claudelle","Claudetta","Claudette","Claudia","Claudie","Claudina","Claudine","Clea","Clem","Clemence","Clementia","Clementina","Clementine","Clemmie","Clemmy","Cleo","Cleopatra","Clerissa","Clio","Clo","Cloe","Cloris","Clotilda","Clovis","Codee","Codi","Codie","Cody","Coleen","Colene","Coletta","Colette","Colleen","Collen","Collete","Collette","Collie","Colline","Colly","Con","Concettina","Conchita","Concordia","Conni","Connie","Conny","Consolata","Constance","Constancia","Constancy","Constanta","Constantia","Constantina","Constantine","Consuela","Consuelo","Cookie","Cora","Corabel","Corabella","Corabelle","Coral","Coralie","Coraline","Coralyn","Cordelia","Cordelie","Cordey","Cordi","Cordie","Cordula","Cordy","Coreen","Corella","Corenda","Corene","Coretta","Corette","Corey","Cori","Corie","Corilla","Corina","Corine","Corinna","Corinne","Coriss","Corissa","Corliss","Corly","Cornela","Cornelia","Cornelle","Cornie","Corny","Correna","Correy","Corri","Corrianne","Corrie","Corrina","Corrine","Corrinne","Corry","Cortney","Cory","Cosetta","Cosette","Costanza","Courtenay","Courtnay","Courtney","Crin","Cris","Crissie","Crissy","Crista","Cristabel","Cristal","Cristen","Cristi","Cristie","Cristin","Cristina","Cristine","Cristionna","Cristy","Crysta","Crystal","Crystie","Cthrine","Cyb","Cybil","Cybill","Cymbre","Cynde","Cyndi","Cyndia","Cyndie","Cyndy","Cynthea","Cynthia","Cynthie","Cynthy","Dacey","Dacia","Dacie","Dacy","Dael","Daffi","Daffie","Daffy","Dagmar","Dahlia","Daile","Daisey","Daisi","Daisie","Daisy","Dale","Dalenna","Dalia","Dalila","Dallas","Daloris","Damara","Damaris","Damita","Dana","Danell","Danella","Danette","Dani","Dania","Danica","Danice","Daniela","Daniele","Daniella","Danielle","Danika","Danila","Danit","Danita","Danna","Danni","Dannie","Danny","Dannye","Danya","Danyelle","Danyette","Daphene","Daphna","Daphne","Dara","Darb","Darbie","Darby","Darcee","Darcey","Darci","Darcie","Darcy","Darda","Dareen","Darell","Darelle","Dari","Daria","Darice","Darla","Darleen","Darlene","Darline","Darlleen","Daron","Darrelle","Darryl","Darsey","Darsie","Darya","Daryl","Daryn","Dasha","Dasi","Dasie","Dasya","Datha","Daune","Daveen","Daveta","Davida","Davina","Davine","Davita","Dawn","Dawna","Dayle","Dayna","Ddene","De","Deana","Deane","Deanna","Deanne","Deb","Debbi","Debbie","Debby","Debee","Debera","Debi","Debor","Debora","Deborah","Debra","Dede","Dedie","Dedra","Dee","Deeann","Deeanne","Deedee","Deena","Deerdre","Deeyn","Dehlia","Deidre","Deina","Deirdre","Del","Dela","Delcina","Delcine","Delia","Delila","Delilah","Delinda","Dell","Della","Delly","Delora","Delores","Deloria","Deloris","Delphine","Delphinia","Demeter","Demetra","Demetria","Demetris","Dena","Deni","Denice","Denise","Denna","Denni","Dennie","Denny","Deny","Denys","Denyse","Deonne","Desdemona","Desirae","Desiree","Desiri","Deva","Devan","Devi","Devin","Devina","Devinne","Devon","Devondra","Devonna","Devonne","Devora","Di","Diahann","Dian","Diana","Diandra","Diane","Diane-marie","Dianemarie","Diann","Dianna","Dianne","Diannne","Didi","Dido","Diena","Dierdre","Dina","Dinah","Dinnie","Dinny","Dion","Dione","Dionis","Dionne","Dita","Dix","Dixie","Dniren","Dode","Dodi","Dodie","Dody","Doe","Doll","Dolley","Dolli","Dollie","Dolly","Dolores","Dolorita","Doloritas","Domeniga","Dominga","Domini","Dominica","Dominique","Dona","Donella","Donelle","Donetta","Donia","Donica","Donielle","Donna","Donnamarie","Donni","Donnie","Donny","Dora","Doralia","Doralin","Doralyn","Doralynn","Doralynne","Dore","Doreen","Dorelia","Dorella","Dorelle","Dorena","Dorene","Doretta","Dorette","Dorey","Dori","Doria","Dorian","Dorice","Dorie","Dorine","Doris","Dorisa","Dorise","Dorita","Doro","Dorolice","Dorolisa","Dorotea","Doroteya","Dorothea","Dorothee","Dorothy","Dorree","Dorri","Dorrie","Dorris","Dorry","Dorthea","Dorthy","Dory","Dosi","Dot","Doti","Dotti","Dottie","Dotty","Dre","Dreddy","Dredi","Drona","Dru","Druci","Drucie","Drucill","Drucy","Drusi","Drusie","Drusilla","Drusy","Dulce","Dulcea","Dulci","Dulcia","Dulciana","Dulcie","Dulcine","Dulcinea","Dulcy","Dulsea","Dusty","Dyan","Dyana","Dyane","Dyann","Dyanna","Dyanne","Dyna","Dynah","Eachelle","Eada","Eadie","Eadith","Ealasaid","Eartha","Easter","Eba","Ebba","Ebonee","Ebony","Eda","Eddi","Eddie","Eddy","Ede","Edee","Edeline","Eden","Edi","Edie","Edin","Edita","Edith","Editha","Edithe","Ediva","Edna","Edwina","Edy","Edyth","Edythe","Effie","Eileen","Eilis","Eimile","Eirena","Ekaterina","Elaina","Elaine","Elana","Elane","Elayne","Elberta","Elbertina","Elbertine","Eleanor","Eleanora","Eleanore","Electra","Eleen","Elena","Elene","Eleni","Elenore","Eleonora","Eleonore","Elfie","Elfreda","Elfrida","Elfrieda","Elga","Elianora","Elianore","Elicia","Elie","Elinor","Elinore","Elisa","Elisabet","Elisabeth","Elisabetta","Elise","Elisha","Elissa","Elita","Eliza","Elizabet","Elizabeth","Elka","Elke","Ella","Elladine","Elle","Ellen","Ellene","Ellette","Elli","Ellie","Ellissa","Elly","Ellyn","Ellynn","Elmira","Elna","Elnora","Elnore","Eloisa","Eloise","Elonore","Elora","Elsa","Elsbeth","Else","Elset","Elsey","Elsi","Elsie","Elsinore","Elspeth","Elsy","Elva","Elvera","Elvina","Elvira","Elwira","Elyn","Elyse","Elysee","Elysha","Elysia","Elyssa","Em","Ema","Emalee","Emalia","Emelda","Emelia","Emelina","Emeline","Emelita","Emelyne","Emera","Emilee","Emili","Emilia","Emilie","Emiline","Emily","Emlyn","Emlynn","Emlynne","Emma","Emmalee","Emmaline","Emmalyn","Emmalynn","Emmalynne","Emmeline","Emmey","Emmi","Emmie","Emmy","Emmye","Emogene","Emyle","Emylee","Engracia","Enid","Enrica","Enrichetta","Enrika","Enriqueta","Eolanda","Eolande","Eran","Erda","Erena","Erica","Ericha","Ericka","Erika","Erin","Erina","Erinn","Erinna","Erma","Ermengarde","Ermentrude","Ermina","Erminia","Erminie","Erna","Ernaline","Ernesta","Ernestine","Ertha","Eryn","Esma","Esmaria","Esme","Esmeralda","Essa","Essie","Essy","Esta","Estel","Estele","Estell","Estella","Estelle","Ester","Esther","Estrella","Estrellita","Ethel","Ethelda","Ethelin","Ethelind","Etheline","Ethelyn","Ethyl","Etta","Etti","Ettie","Etty","Eudora","Eugenia","Eugenie","Eugine","Eula","Eulalie","Eunice","Euphemia","Eustacia","Eva","Evaleen","Evangelia","Evangelin","Evangelina","Evangeline","Evania","Evanne","Eve","Eveleen","Evelina","Eveline","Evelyn","Evey","Evie","Evita","Evonne","Evvie","Evvy","Evy","Eyde","Eydie","Ezmeralda","Fae","Faina","Faith","Fallon","Fan","Fanchette","Fanchon","Fancie","Fancy","Fanechka","Fania","Fanni","Fannie","Fanny","Fanya","Fara","Farah","Farand","Farica","Farra","Farrah","Farrand","Faun","Faunie","Faustina","Faustine","Fawn","Fawne","Fawnia","Fay","Faydra","Faye","Fayette","Fayina","Fayre","Fayth","Faythe","Federica","Fedora","Felecia","Felicdad","Felice","Felicia","Felicity","Felicle","Felipa","Felisha","Felita","Feliza","Fenelia","Feodora","Ferdinanda","Ferdinande","Fern","Fernanda","Fernande","Fernandina","Ferne","Fey","Fiann","Fianna","Fidela","Fidelia","Fidelity","Fifi","Fifine","Filia","Filide","Filippa","Fina","Fiona","Fionna","Fionnula","Fiorenze","Fleur","Fleurette","Flo","Flor","Flora","Florance","Flore","Florella","Florence","Florencia","Florentia","Florenza","Florette","Flori","Floria","Florida","Florie","Florina","Florinda","Floris","Florri","Florrie","Florry","Flory","Flossi","Flossie","Flossy","Flss","Fran","Francene","Frances","Francesca","Francine","Francisca","Franciska","Francoise","Francyne","Frank","Frankie","Franky","Franni","Frannie","Franny","Frayda","Fred","Freda","Freddi","Freddie","Freddy","Fredelia","Frederica","Fredericka","Frederique","Fredi","Fredia","Fredra","Fredrika","Freida","Frieda","Friederike","Fulvia","Gabbey","Gabbi","Gabbie","Gabey","Gabi","Gabie","Gabriel","Gabriela","Gabriell","Gabriella","Gabrielle","Gabriellia","Gabrila","Gaby","Gae","Gael","Gail","Gale","Galina","Garland","Garnet","Garnette","Gates","Gavra","Gavrielle","Gay","Gaye","Gayel","Gayla","Gayle","Gayleen","Gaylene","Gaynor","Gelya","Gena","Gene","Geneva","Genevieve","Genevra","Genia","Genna","Genni","Gennie","Gennifer","Genny","Genovera","Genvieve","George","Georgeanna","Georgeanne","Georgena","Georgeta","Georgetta","Georgette","Georgia","Georgiana","Georgianna","Georgianne","Georgie","Georgina","Georgine","Geralda","Geraldine","Gerda","Gerhardine","Geri","Gerianna","Gerianne","Gerladina","Germain","Germaine","Germana","Gerri","Gerrie","Gerrilee","Gerry","Gert","Gerta","Gerti","Gertie","Gertrud","Gertruda","Gertrude","Gertrudis","Gerty","Giacinta","Giana","Gianina","Gianna","Gigi","Gilberta","Gilberte","Gilbertina","Gilbertine","Gilda","Gilemette","Gill","Gillan","Gilli","Gillian","Gillie","Gilligan","Gilly","Gina","Ginelle","Ginevra","Ginger","Ginni","Ginnie","Ginnifer","Ginny","Giorgia","Giovanna","Gipsy","Giralda","Gisela","Gisele","Gisella","Giselle","Giuditta","Giulia","Giulietta","Giustina","Gizela","Glad","Gladi","Gladys","Gleda","Glen","Glenda","Glenine","Glenn","Glenna","Glennie","Glennis","Glori","Gloria","Gloriana","Gloriane","Glory","Glyn","Glynda","Glynis","Glynnis","Gnni","Godiva","Golda","Goldarina","Goldi","Goldia","Goldie","Goldina","Goldy","Grace","Gracia","Gracie","Grata","Gratia","Gratiana","Gray","Grayce","Grazia","Greer","Greta","Gretal","Gretchen","Grete","Gretel","Grethel","Gretna","Gretta","Grier","Griselda","Grissel","Guendolen","Guenevere","Guenna","Guglielma","Gui","Guillema","Guillemette","Guinevere","Guinna","Gunilla","Gus","Gusella","Gussi","Gussie","Gussy","Gusta","Gusti","Gustie","Gusty","Gwen","Gwendolen","Gwendolin","Gwendolyn","Gweneth","Gwenette","Gwenneth","Gwenni","Gwennie","Gwenny","Gwenora","Gwenore","Gwyn","Gwyneth","Gwynne","Gypsy","Hadria","Hailee","Haily","Haleigh","Halette","Haley","Hali","Halie","Halimeda","Halley","Halli","Hallie","Hally","Hana","Hanna","Hannah","Hanni","Hannie","Hannis","Hanny","Happy","Harlene","Harley","Harli","Harlie","Harmonia","Harmonie","Harmony","Harri","Harrie","Harriet","Harriett","Harrietta","Harriette","Harriot","Harriott","Hatti","Hattie","Hatty","Hayley","Hazel","Heath","Heather","Heda","Hedda","Heddi","Heddie","Hedi","Hedvig","Hedvige","Hedwig","Hedwiga","Hedy","Heida","Heidi","Heidie","Helaina","Helaine","Helen","Helen-elizabeth","Helena","Helene","Helenka","Helga","Helge","Helli","Heloise","Helsa","Helyn","Hendrika","Henka","Henrie","Henrieta","Henrietta","Henriette","Henryetta","Hephzibah","Hermia","Hermina","Hermine","Herminia","Hermione","Herta","Hertha","Hester","Hesther","Hestia","Hetti","Hettie","Hetty","Hilary","Hilda","Hildagard","Hildagarde","Hilde","Hildegaard","Hildegarde","Hildy","Hillary","Hilliary","Hinda","Holli","Hollie","Holly","Holly-anne","Hollyanne","Honey","Honor","Honoria","Hope","Horatia","Hortense","Hortensia","Hulda","Hyacinth","Hyacintha","Hyacinthe","Hyacinthia","Hyacinthie","Hynda","Ianthe","Ibbie","Ibby","Ida","Idalia","Idalina","Idaline","Idell","Idelle","Idette","Ileana","Ileane","Ilene","Ilise","Ilka","Illa","Ilsa","Ilse","Ilysa","Ilyse","Ilyssa","Imelda","Imogen","Imogene","Imojean","Ina","Indira","Ines","Inesita","Inessa","Inez","Inga","Ingaberg","Ingaborg","Inge","Ingeberg","Ingeborg","Inger","Ingrid","Ingunna","Inna","Iolande","Iolanthe","Iona","Iormina","Ira","Irena","Irene","Irina","Iris","Irita","Irma","Isa","Isabel","Isabelita","Isabella","Isabelle","Isadora","Isahella","Iseabal","Isidora","Isis","Isobel","Issi","Issie","Issy","Ivett","Ivette","Ivie","Ivonne","Ivory","Ivy","Izabel","Jacenta","Jacinda","Jacinta","Jacintha","Jacinthe","Jackelyn","Jacki","Jackie","Jacklin","Jacklyn","Jackquelin","Jackqueline","Jacky","Jaclin","Jaclyn","Jacquelin","Jacqueline","Jacquelyn","Jacquelynn","Jacquenetta","Jacquenette","Jacquetta","Jacquette","Jacqui","Jacquie","Jacynth","Jada","Jade","Jaime","Jaimie","Jaine","Jami","Jamie","Jamima","Jammie","Jan","Jana","Janaya","Janaye","Jandy","Jane","Janean","Janeczka","Janeen","Janel","Janela","Janella","Janelle","Janene","Janenna","Janessa","Janet","Janeta","Janetta","Janette","Janeva","Janey","Jania","Janice","Janie","Janifer","Janina","Janine","Janis","Janith","Janka","Janna","Jannel","Jannelle","Janot","Jany","Jaquelin","Jaquelyn","Jaquenetta","Jaquenette","Jaquith","Jasmin","Jasmina","Jasmine","Jayme","Jaymee","Jayne","Jaynell","Jazmin","Jean","Jeana","Jeane","Jeanelle","Jeanette","Jeanie","Jeanine","Jeanna","Jeanne","Jeannette","Jeannie","Jeannine","Jehanna","Jelene","Jemie","Jemima","Jemimah","Jemmie","Jemmy","Jen","Jena","Jenda","Jenelle","Jeni","Jenica","Jeniece","Jenifer","Jeniffer","Jenilee","Jenine","Jenn","Jenna","Jennee","Jennette","Jenni","Jennica","Jennie","Jennifer","Jennilee","Jennine","Jenny","Jeralee","Jere","Jeri","Jermaine","Jerrie","Jerrilee","Jerrilyn","Jerrine","Jerry","Jerrylee","Jess","Jessa","Jessalin","Jessalyn","Jessamine","Jessamyn","Jesse","Jesselyn","Jessi","Jessica","Jessie","Jessika","Jessy","Jewel","Jewell","Jewelle","Jill","Jillana","Jillane","Jillayne","Jilleen","Jillene","Jilli","Jillian","Jillie","Jilly","Jinny","Jo","Jo-ann","Jo-anne","Joan","Joana","Joane","Joanie","Joann","Joanna","Joanne","Joannes","Jobey","Jobi","Jobie","Jobina","Joby","Jobye","Jobyna","Jocelin","Joceline","Jocelyn","Jocelyne","Jodee","Jodi","Jodie","Jody","Joeann","Joela","Joelie","Joell","Joella","Joelle","Joellen","Joelly","Joellyn","Joelynn","Joete","Joey","Johanna","Johannah","Johna","Johnath","Johnette","Johnna","Joice","Jojo","Jolee","Joleen","Jolene","Joletta","Joli","Jolie","Joline","Joly","Jolyn","Jolynn","Jonell","Joni","Jonie","Jonis","Jordain","Jordan","Jordana","Jordanna","Jorey","Jori","Jorie","Jorrie","Jorry","Joscelin","Josee","Josefa","Josefina","Josepha","Josephina","Josephine","Josey","Josi","Josie","Josselyn","Josy","Jourdan","Joy","Joya","Joyan","Joyann","Joyce","Joycelin","Joye","Jsandye","Juana","Juanita","Judi","Judie","Judith","Juditha","Judy","Judye","Juieta","Julee","Juli","Julia","Juliana","Juliane","Juliann","Julianna","Julianne","Julie","Julienne","Juliet","Julieta","Julietta","Juliette","Julina","Juline","Julissa","Julita","June","Junette","Junia","Junie","Junina","Justina","Justine","Justinn","Jyoti","Kacey","Kacie","Kacy","Kaela","Kai","Kaia","Kaila","Kaile","Kailey","Kaitlin","Kaitlyn","Kaitlynn","Kaja","Kakalina","Kala","Kaleena","Kali","Kalie","Kalila","Kalina","Kalinda","Kalindi","Kalli","Kally","Kameko","Kamila","Kamilah","Kamillah","Kandace","Kandy","Kania","Kanya","Kara","Kara-lynn","Karalee","Karalynn","Kare","Karee","Karel","Karen","Karena","Kari","Karia","Karie","Karil","Karilynn","Karin","Karina","Karine","Kariotta","Karisa","Karissa","Karita","Karla","Karlee","Karleen","Karlen","Karlene","Karlie","Karlotta","Karlotte","Karly","Karlyn","Karmen","Karna","Karol","Karola","Karole","Karolina","Karoline","Karoly","Karon","Karrah","Karrie","Karry","Kary","Karyl","Karylin","Karyn","Kasey","Kass","Kassandra","Kassey","Kassi","Kassia","Kassie","Kat","Kata","Katalin","Kate","Katee","Katerina","Katerine","Katey","Kath","Katha","Katharina","Katharine","Katharyn","Kathe","Katherina","Katherine","Katheryn","Kathi","Kathie","Kathleen","Kathlin","Kathrine","Kathryn","Kathryne","Kathy","Kathye","Kati","Katie","Katina","Katine","Katinka","Katleen","Katlin","Katrina","Katrine","Katrinka","Katti","Kattie","Katuscha","Katusha","Katy","Katya","Kay","Kaycee","Kaye","Kayla","Kayle","Kaylee","Kayley","Kaylil","Kaylyn","Keeley","Keelia","Keely","Kelcey","Kelci","Kelcie","Kelcy","Kelila","Kellen","Kelley","Kelli","Kellia","Kellie","Kellina","Kellsie","Kelly","Kellyann","Kelsey","Kelsi","Kelsy","Kendra","Kendre","Kenna","Keri","Keriann","Kerianne","Kerri","Kerrie","Kerrill","Kerrin","Kerry","Kerstin","Kesley","Keslie","Kessia","Kessiah","Ketti","Kettie","Ketty","Kevina","Kevyn","Ki","Kiah","Kial","Kiele","Kiersten","Kikelia","Kiley","Kim","Kimberlee","Kimberley","Kimberli","Kimberly","Kimberlyn","Kimbra","Kimmi","Kimmie","Kimmy","Kinna","Kip","Kipp","Kippie","Kippy","Kira","Kirbee","Kirbie","Kirby","Kiri","Kirsten","Kirsteni","Kirsti","Kirstin","Kirstyn","Kissee","Kissiah","Kissie","Kit","Kitti","Kittie","Kitty","Kizzee","Kizzie","Klara","Klarika","Klarrisa","Konstance","Konstanze","Koo","Kora","Koral","Koralle","Kordula","Kore","Korella","Koren","Koressa","Kori","Korie","Korney","Korrie","Korry","Kris","Krissie","Krissy","Krista","Kristal","Kristan","Kriste","Kristel","Kristen","Kristi","Kristien","Kristin","Kristina","Kristine","Kristy","Kristyn","Krysta","Krystal","Krystalle","Krystle","Krystyna","Kyla","Kyle","Kylen","Kylie","Kylila","Kylynn","Kym","Kynthia","Kyrstin","Lacee","Lacey","Lacie","Lacy","Ladonna","Laetitia","Laina","Lainey","Lana","Lanae","Lane","Lanette","Laney","Lani","Lanie","Lanita","Lanna","Lanni","Lanny","Lara","Laraine","Lari","Larina","Larine","Larisa","Larissa","Lark","Laryssa","Latashia","Latia","Latisha","Latrena","Latrina","Laura","Lauraine","Laural","Lauralee","Laure","Lauree","Laureen","Laurel","Laurella","Lauren","Laurena","Laurene","Lauretta","Laurette","Lauri","Laurianne","Laurice","Laurie","Lauryn","Lavena","Laverna","Laverne","Lavina","Lavinia","Lavinie","Layla","Layne","Layney","Lea","Leah","Leandra","Leann","Leanna","Leanor","Leanora","Lebbie","Leda","Lee","Leeann","Leeanne","Leela","Leelah","Leena","Leesa","Leese","Legra","Leia","Leigh","Leigha","Leila","Leilah","Leisha","Lela","Lelah","Leland","Lelia","Lena","Lenee","Lenette","Lenka","Lenna","Lenora","Lenore","Leodora","Leoine","Leola","Leoline","Leona","Leonanie","Leone","Leonelle","Leonie","Leonora","Leonore","Leontine","Leontyne","Leora","Leshia","Lesley","Lesli","Leslie","Lesly","Lesya","Leta","Lethia","Leticia","Letisha","Letitia","Letizia","Letta","Letti","Lettie","Letty","Lexi","Lexie","Lexine","Lexis","Lexy","Leyla","Lezlie","Lia","Lian","Liana","Liane","Lianna","Lianne","Lib","Libbey","Libbi","Libbie","Libby","Licha","Lida","Lidia","Liesa","Lil","Lila","Lilah","Lilas","Lilia","Lilian","Liliane","Lilias","Lilith","Lilla","Lilli","Lillian","Lillis","Lilllie","Lilly","Lily","Lilyan","Lin","Lina","Lind","Linda","Lindi","Lindie","Lindsay","Lindsey","Lindsy","Lindy","Linea","Linell","Linet","Linette","Linn","Linnea","Linnell","Linnet","Linnie","Linzy","Lira","Lisa","Lisabeth","Lisbeth","Lise","Lisetta","Lisette","Lisha","Lishe","Lissa","Lissi","Lissie","Lissy","Lita","Liuka","Liv","Liva","Livia","Livvie","Livvy","Livvyy","Livy","Liz","Liza","Lizabeth","Lizbeth","Lizette","Lizzie","Lizzy","Loella","Lois","Loise","Lola","Loleta","Lolita","Lolly","Lona","Lonee","Loni","Lonna","Lonni","Lonnie","Lora","Lorain","Loraine","Loralee","Loralie","Loralyn","Loree","Loreen","Lorelei","Lorelle","Loren","Lorena","Lorene","Lorenza","Loretta","Lorette","Lori","Loria","Lorianna","Lorianne","Lorie","Lorilee","Lorilyn","Lorinda","Lorine","Lorita","Lorna","Lorne","Lorraine","Lorrayne","Lorri","Lorrie","Lorrin","Lorry","Lory","Lotta","Lotte","Lotti","Lottie","Lotty","Lou","Louella","Louisa","Louise","Louisette","Loutitia","Lu","Luce","Luci","Lucia","Luciana","Lucie","Lucienne","Lucila","Lucilia","Lucille","Lucina","Lucinda","Lucine","Lucita","Lucky","Lucretia","Lucy","Ludovika","Luella","Luelle","Luisa","Luise","Lula","Lulita","Lulu","Lura","Lurette","Lurleen","Lurlene","Lurline","Lusa","Luz","Lyda","Lydia","Lydie","Lyn","Lynda","Lynde","Lyndel","Lyndell","Lyndsay","Lyndsey","Lyndsie","Lyndy","Lynea","Lynelle","Lynett","Lynette","Lynn","Lynna","Lynne","Lynnea","Lynnell","Lynnelle","Lynnet","Lynnett","Lynnette","Lynsey","Lyssa","Mab","Mabel","Mabelle","Mable","Mada","Madalena","Madalyn","Maddalena","Maddi","Maddie","Maddy","Madel","Madelaine","Madeleine","Madelena","Madelene","Madelin","Madelina","Madeline","Madella","Madelle","Madelon","Madelyn","Madge","Madlen","Madlin","Madonna","Mady","Mae","Maegan","Mag","Magda","Magdaia","Magdalen","Magdalena","Magdalene","Maggee","Maggi","Maggie","Maggy","Mahala","Mahalia","Maia","Maible","Maiga","Maighdiln","Mair","Maire","Maisey","Maisie","Maitilde","Mala","Malanie","Malena","Malia","Malina","Malinda","Malinde","Malissa","Malissia","Mallissa","Mallorie","Mallory","Malorie","Malory","Malva","Malvina","Malynda","Mame","Mamie","Manda","Mandi","Mandie","Mandy","Manon","Manya","Mara","Marabel","Marcela","Marcelia","Marcella","Marcelle","Marcellina","Marcelline","Marchelle","Marci","Marcia","Marcie","Marcile","Marcille","Marcy","Mareah","Maren","Marena","Maressa","Marga","Margalit","Margalo","Margaret","Margareta","Margarete","Margaretha","Margarethe","Margaretta","Margarette","Margarita","Margaux","Marge","Margeaux","Margery","Marget","Margette","Margi","Margie","Margit","Margo","Margot","Margret","Marguerite","Margy","Mari","Maria","Mariam","Marian","Mariana","Mariann","Marianna","Marianne","Maribel","Maribelle","Maribeth","Marice","Maridel","Marie","Marie-ann","Marie-jeanne","Marieann","Mariejeanne","Mariel","Mariele","Marielle","Mariellen","Marietta","Mariette","Marigold","Marijo","Marika","Marilee","Marilin","Marillin","Marilyn","Marin","Marina","Marinna","Marion","Mariquilla","Maris","Marisa","Mariska","Marissa","Marita","Maritsa","Mariya","Marj","Marja","Marje","Marji","Marjie","Marjorie","Marjory","Marjy","Marketa","Marla","Marlane","Marleah","Marlee","Marleen","Marlena","Marlene","Marley","Marlie","Marline","Marlo","Marlyn","Marna","Marne","Marney","Marni","Marnia","Marnie","Marquita","Marrilee","Marris","Marrissa","Marsha","Marsiella","Marta","Martelle","Martguerita","Martha","Marthe","Marthena","Marti","Martica","Martie","Martina","Martita","Marty","Martynne","Mary","Marya","Maryann","Maryanna","Maryanne","Marybelle","Marybeth","Maryellen","Maryjane","Maryjo","Maryl","Marylee","Marylin","Marylinda","Marylou","Marylynne","Maryrose","Marys","Marysa","Masha","Matelda","Mathilda","Mathilde","Matilda","Matilde","Matti","Mattie","Matty","Maud","Maude","Maudie","Maura","Maure","Maureen","Maureene","Maurene","Maurine","Maurise","Maurita","Maurizia","Mavis","Mavra","Max","Maxi","Maxie","Maxine","Maxy","May","Maybelle","Maye","Mead","Meade","Meagan","Meaghan","Meara","Mechelle","Meg","Megan","Megen","Meggi","Meggie","Meggy","Meghan","Meghann","Mehetabel","Mei","Mel","Mela","Melamie","Melania","Melanie","Melantha","Melany","Melba","Melesa","Melessa","Melicent","Melina","Melinda","Melinde","Melisa","Melisande","Melisandra","Melisenda","Melisent","Melissa","Melisse","Melita","Melitta","Mella","Melli","Mellicent","Mellie","Mellisa","Mellisent","Melloney","Melly","Melodee","Melodie","Melody","Melonie","Melony","Melosa","Melva","Mercedes","Merci","Mercie","Mercy","Meredith","Meredithe","Meridel","Meridith","Meriel","Merilee","Merilyn","Meris","Merissa","Merl","Merla","Merle","Merlina","Merline","Merna","Merola","Merralee","Merridie","Merrie","Merrielle","Merrile","Merrilee","Merrili","Merrill","Merrily","Merry","Mersey","Meryl","Meta","Mia","Micaela","Michaela","Michaelina","Michaeline","Michaella","Michal","Michel","Michele","Michelina","Micheline","Michell","Michelle","Micki","Mickie","Micky","Midge","Mignon","Mignonne","Miguela","Miguelita","Mikaela","Mil","Mildred","Mildrid","Milena","Milicent","Milissent","Milka","Milli","Millicent","Millie","Millisent","Milly","Milzie","Mimi","Min","Mina","Minda","Mindy","Minerva","Minetta","Minette","Minna","Minnaminnie","Minne","Minni","Minnie","Minnnie","Minny","Minta","Miquela","Mira","Mirabel","Mirabella","Mirabelle","Miran","Miranda","Mireielle","Mireille","Mirella","Mirelle","Miriam","Mirilla","Mirna","Misha","Missie","Missy","Misti","Misty","Mitzi","Modesta","Modestia","Modestine","Modesty","Moina","Moira","Moll","Mollee","Molli","Mollie","Molly","Mommy","Mona","Monah","Monica","Monika","Monique","Mora","Moreen","Morena","Morgan","Morgana","Morganica","Morganne","Morgen","Moria","Morissa","Morna","Moselle","Moyna","Moyra","Mozelle","Muffin","Mufi","Mufinella","Muire","Mureil","Murial","Muriel","Murielle","Myra","Myrah","Myranda","Myriam","Myrilla","Myrle","Myrlene","Myrna","Myrta","Myrtia","Myrtice","Myrtie","Myrtle","Nada","Nadean","Nadeen","Nadia","Nadine","Nadiya","Nady","Nadya","Nalani","Nan","Nana","Nananne","Nance","Nancee","Nancey","Nanci","Nancie","Nancy","Nanete","Nanette","Nani","Nanice","Nanine","Nannette","Nanni","Nannie","Nanny","Nanon","Naoma","Naomi","Nara","Nari","Nariko","Nat","Nata","Natala","Natalee","Natalie","Natalina","Nataline","Natalya","Natasha","Natassia","Nathalia","Nathalie","Natividad","Natka","Natty","Neala","Neda","Nedda","Nedi","Neely","Neila","Neile","Neilla","Neille","Nelia","Nelie","Nell","Nelle","Nelli","Nellie","Nelly","Nerissa","Nerita","Nert","Nerta","Nerte","Nerti","Nertie","Nerty","Nessa","Nessi","Nessie","Nessy","Nesta","Netta","Netti","Nettie","Nettle","Netty","Nevsa","Neysa","Nichol","Nichole","Nicholle","Nicki","Nickie","Nicky","Nicol","Nicola","Nicole","Nicolea","Nicolette","Nicoli","Nicolina","Nicoline","Nicolle","Nikaniki","Nike","Niki","Nikki","Nikkie","Nikoletta","Nikolia","Nina","Ninetta","Ninette","Ninnetta","Ninnette","Ninon","Nissa","Nisse","Nissie","Nissy","Nita","Nixie","Noami","Noel","Noelani","Noell","Noella","Noelle","Noellyn","Noelyn","Noemi","Nola","Nolana","Nolie","Nollie","Nomi","Nona","Nonah","Noni","Nonie","Nonna","Nonnah","Nora","Norah","Norean","Noreen","Norene","Norina","Norine","Norma","Norri","Norrie","Norry","Novelia","Nydia","Nyssa","Octavia","Odele","Odelia","Odelinda","Odella","Odelle","Odessa","Odetta","Odette","Odilia","Odille","Ofelia","Ofella","Ofilia","Ola","Olenka","Olga","Olia","Olimpia","Olive","Olivette","Olivia","Olivie","Oliy","Ollie","Olly","Olva","Olwen","Olympe","Olympia","Olympie","Ondrea","Oneida","Onida","Oona","Opal","Opalina","Opaline","Ophelia","Ophelie","Ora","Oralee","Oralia","Oralie","Oralla","Oralle","Orel","Orelee","Orelia","Orelie","Orella","Orelle","Oriana","Orly","Orsa","Orsola","Ortensia","Otha","Othelia","Othella","Othilia","Othilie","Ottilie","Page","Paige","Paloma","Pam","Pamela","Pamelina","Pamella","Pammi","Pammie","Pammy","Pandora","Pansie","Pansy","Paola","Paolina","Papagena","Pat","Patience","Patrica","Patrice","Patricia","Patrizia","Patsy","Patti","Pattie","Patty","Paula","Paule","Pauletta","Paulette","Pauli","Paulie","Paulina","Pauline","Paulita","Pauly","Pavia","Pavla","Pearl","Pearla","Pearle","Pearline","Peg","Pegeen","Peggi","Peggie","Peggy","Pen","Penelopa","Penelope","Penni","Pennie","Penny","Pepi","Pepita","Peri","Peria","Perl","Perla","Perle","Perri","Perrine","Perry","Persis","Pet","Peta","Petra","Petrina","Petronella","Petronia","Petronilla","Petronille","Petunia","Phaedra","Phaidra","Phebe","Phedra","Phelia","Phil","Philipa","Philippa","Philippe","Philippine","Philis","Phillida","Phillie","Phillis","Philly","Philomena","Phoebe","Phylis","Phyllida","Phyllis","Phyllys","Phylys","Pia","Pier","Pierette","Pierrette","Pietra","Piper","Pippa","Pippy","Polly","Pollyanna","Pooh","Poppy","Portia","Pris","Prisca","Priscella","Priscilla","Prissie","Pru","Prudence","Prudi","Prudy","Prue","Queenie","Quentin","Querida","Quinn","Quinta","Quintana","Quintilla","Quintina","Rachael","Rachel","Rachele","Rachelle","Rae","Raeann","Raf","Rafa","Rafaela","Rafaelia","Rafaelita","Rahal","Rahel","Raina","Raine","Rakel","Ralina","Ramona","Ramonda","Rana","Randa","Randee","Randene","Randi","Randie","Randy","Ranee","Rani","Rania","Ranice","Ranique","Ranna","Raphaela","Raquel","Raquela","Rasia","Rasla","Raven","Ray","Raychel","Raye","Rayna","Raynell","Rayshell","Rea","Reba","Rebbecca","Rebe","Rebeca","Rebecca","Rebecka","Rebeka","Rebekah","Rebekkah","Ree","Reeba","Reena","Reeta","Reeva","Regan","Reggi","Reggie","Regina","Regine","Reiko","Reina","Reine","Remy","Rena","Renae","Renata","Renate","Rene","Renee","Renell","Renelle","Renie","Rennie","Reta","Retha","Revkah","Rey","Reyna","Rhea","Rheba","Rheta","Rhetta","Rhiamon","Rhianna","Rhianon","Rhoda","Rhodia","Rhodie","Rhody","Rhona","Rhonda","Riane","Riannon","Rianon","Rica","Ricca","Rici","Ricki","Rickie","Ricky","Riki","Rikki","Rina","Risa","Rita","Riva","Rivalee","Rivi","Rivkah","Rivy","Roana","Roanna","Roanne","Robbi","Robbie","Robbin","Robby","Robbyn","Robena","Robenia","Roberta","Robin","Robina","Robinet","Robinett","Robinetta","Robinette","Robinia","Roby","Robyn","Roch","Rochell","Rochella","Rochelle","Rochette","Roda","Rodi","Rodie","Rodina","Rois","Romola","Romona","Romonda","Romy","Rona","Ronalda","Ronda","Ronica","Ronna","Ronni","Ronnica","Ronnie","Ronny","Roobbie","Rora","Rori","Rorie","Rory","Ros","Rosa","Rosabel","Rosabella","Rosabelle","Rosaleen","Rosalia","Rosalie","Rosalind","Rosalinda","Rosalinde","Rosaline","Rosalyn","Rosalynd","Rosamond","Rosamund","Rosana","Rosanna","Rosanne","Rose","Roseann","Roseanna","Roseanne","Roselia","Roselin","Roseline","Rosella","Roselle","Rosemaria","Rosemarie","Rosemary","Rosemonde","Rosene","Rosetta","Rosette","Roshelle","Rosie","Rosina","Rosita","Roslyn","Rosmunda","Rosy","Row","Rowe","Rowena","Roxana","Roxane","Roxanna","Roxanne","Roxi","Roxie","Roxine","Roxy","Roz","Rozalie","Rozalin","Rozamond","Rozanna","Rozanne","Roze","Rozele","Rozella","Rozelle","Rozina","Rubetta","Rubi","Rubia","Rubie","Rubina","Ruby","Ruperta","Ruth","Ruthann","Ruthanne","Ruthe","Ruthi","Ruthie","Ruthy","Ryann","Rycca","Saba","Sabina","Sabine","Sabra","Sabrina","Sacha","Sada","Sadella","Sadie","Sadye","Saidee","Sal","Salaidh","Sallee","Salli","Sallie","Sally","Sallyann","Sallyanne","Saloma","Salome","Salomi","Sam","Samantha","Samara","Samaria","Sammy","Sande","Sandi","Sandie","Sandra","Sandy","Sandye","Sapphira","Sapphire","Sara","Sara-ann","Saraann","Sarah","Sarajane","Saree","Sarena","Sarene","Sarette","Sari","Sarina","Sarine","Sarita","Sascha","Sasha","Sashenka","Saudra","Saundra","Savina","Sayre","Scarlet","Scarlett","Sean","Seana","Seka","Sela","Selena","Selene","Selestina","Selia","Selie","Selina","Selinda","Seline","Sella","Selle","Selma","Sena","Sephira","Serena","Serene","Shae","Shaina","Shaine","Shalna","Shalne","Shana","Shanda","Shandee","Shandeigh","Shandie","Shandra","Shandy","Shane","Shani","Shanie","Shanna","Shannah","Shannen","Shannon","Shanon","Shanta","Shantee","Shara","Sharai","Shari","Sharia","Sharity","Sharl","Sharla","Sharleen","Sharlene","Sharline","Sharon","Sharona","Sharron","Sharyl","Shaun","Shauna","Shawn","Shawna","Shawnee","Shay","Shayla","Shaylah","Shaylyn","Shaylynn","Shayna","Shayne","Shea","Sheba","Sheela","Sheelagh","Sheelah","Sheena","Sheeree","Sheila","Sheila-kathryn","Sheilah","Shel","Shela","Shelagh","Shelba","Shelbi","Shelby","Shelia","Shell","Shelley","Shelli","Shellie","Shelly","Shena","Sher","Sheree","Sheri","Sherie","Sherill","Sherilyn","Sherline","Sherri","Sherrie","Sherry","Sherye","Sheryl","Shina","Shir","Shirl","Shirlee","Shirleen","Shirlene","Shirley","Shirline","Shoshana","Shoshanna","Siana","Sianna","Sib","Sibbie","Sibby","Sibeal","Sibel","Sibella","Sibelle","Sibilla","Sibley","Sibyl","Sibylla","Sibylle","Sidoney","Sidonia","Sidonnie","Sigrid","Sile","Sileas","Silva","Silvana","Silvia","Silvie","Simona","Simone","Simonette","Simonne","Sindee","Siobhan","Sioux","Siouxie","Sisely","Sisile","Sissie","Sissy","Siusan","Sofia","Sofie","Sondra","Sonia","Sonja","Sonni","Sonnie","Sonnnie","Sonny","Sonya","Sophey","Sophi","Sophia","Sophie","Sophronia","Sorcha","Sosanna","Stace","Stacee","Stacey","Staci","Stacia","Stacie","Stacy","Stafani","Star","Starla","Starlene","Starlin","Starr","Stefa","Stefania","Stefanie","Steffane","Steffi","Steffie","Stella","Stepha","Stephana","Stephani","Stephanie","Stephannie","Stephenie","Stephi","Stephie","Stephine","Stesha","Stevana","Stevena","Stoddard","Storm","Stormi","Stormie","Stormy","Sue","Suellen","Sukey","Suki","Sula","Sunny","Sunshine","Susan","Susana","Susanetta","Susann","Susanna","Susannah","Susanne","Susette","Susi","Susie","Susy","Suzann","Suzanna","Suzanne","Suzette","Suzi","Suzie","Suzy","Sybil","Sybila","Sybilla","Sybille","Sybyl","Sydel","Sydelle","Sydney","Sylvia","Tabatha","Tabbatha","Tabbi","Tabbie","Tabbitha","Tabby","Tabina","Tabitha","Taffy","Talia","Tallia","Tallie","Tallou","Tallulah","Tally","Talya","Talyah","Tamar","Tamara","Tamarah","Tamarra","Tamera","Tami","Tamiko","Tamma","Tammara","Tammi","Tammie","Tammy","Tamqrah","Tamra","Tana","Tandi","Tandie","Tandy","Tanhya","Tani","Tania","Tanitansy","Tansy","Tanya","Tara","Tarah","Tarra","Tarrah","Taryn","Tasha","Tasia","Tate","Tatiana","Tatiania","Tatum","Tawnya","Tawsha","Ted","Tedda","Teddi","Teddie","Teddy","Tedi","Tedra","Teena","Teirtza","Teodora","Tera","Teresa","Terese","Teresina","Teresita","Teressa","Teri","Teriann","Terra","Terri","Terrie","Terrijo","Terry","Terrye","Tersina","Terza","Tess","Tessa","Tessi","Tessie","Tessy","Thalia","Thea","Theadora","Theda","Thekla","Thelma","Theo","Theodora","Theodosia","Theresa","Therese","Theresina","Theresita","Theressa","Therine","Thia","Thomasa","Thomasin","Thomasina","Thomasine","Tiena","Tierney","Tiertza","Tiff","Tiffani","Tiffanie","Tiffany","Tiffi","Tiffie","Tiffy","Tilda","Tildi","Tildie","Tildy","Tillie","Tilly","Tim","Timi","Timmi","Timmie","Timmy","Timothea","Tina","Tine","Tiphani","Tiphanie","Tiphany","Tish","Tisha","Tobe","Tobey","Tobi","Toby","Tobye","Toinette","Toma","Tomasina","Tomasine","Tomi","Tommi","Tommie","Tommy","Toni","Tonia","Tonie","Tony","Tonya","Tonye","Tootsie","Torey","Tori","Torie","Torrie","Tory","Tova","Tove","Tracee","Tracey","Traci","Tracie","Tracy","Trenna","Tresa","Trescha","Tressa","Tricia","Trina","Trish","Trisha","Trista","Trix","Trixi","Trixie","Trixy","Truda","Trude","Trudey","Trudi","Trudie","Trudy","Trula","Tuesday","Twila","Twyla","Tybi","Tybie","Tyne","Ula","Ulla","Ulrica","Ulrika","Ulrikaumeko","Ulrike","Umeko","Una","Ursa","Ursala","Ursola","Ursula","Ursulina","Ursuline","Uta","Val","Valaree","Valaria","Vale","Valeda","Valencia","Valene","Valenka","Valentia","Valentina","Valentine","Valera","Valeria","Valerie","Valery","Valerye","Valida","Valina","Valli","Vallie","Vally","Valma","Valry","Van","Vanda","Vanessa","Vania","Vanna","Vanni","Vannie","Vanny","Vanya","Veda","Velma","Velvet","Venita","Venus","Vera","Veradis","Vere","Verena","Verene","Veriee","Verile","Verina","Verine","Verla","Verna","Vernice","Veronica","Veronika","Veronike","Veronique","Vevay","Vi","Vicki","Vickie","Vicky","Victoria","Vida","Viki","Vikki","Vikky","Vilhelmina","Vilma","Vin","Vina","Vinita","Vinni","Vinnie","Vinny","Viola","Violante","Viole","Violet","Violetta","Violette","Virgie","Virgina","Virginia","Virginie","Vita","Vitia","Vitoria","Vittoria","Viv","Viva","Vivi","Vivia","Vivian","Viviana","Vivianna","Vivianne","Vivie","Vivien","Viviene","Vivienne","Viviyan","Vivyan","Vivyanne","Vonni","Vonnie","Vonny","Vyky","Wallie","Wallis","Walliw","Wally","Waly","Wanda","Wandie","Wandis","Waneta","Wanids","Wenda","Wendeline","Wendi","Wendie","Wendy","Wendye","Wenona","Wenonah","Whitney","Wileen","Wilhelmina","Wilhelmine","Wilie","Willa","Willabella","Willamina","Willetta","Willette","Willi","Willie","Willow","Willy","Willyt","Wilma","Wilmette","Wilona","Wilone","Wilow","Windy","Wini","Winifred","Winna","Winnah","Winne","Winni","Winnie","Winnifred","Winny","Winona","Winonah","Wren","Wrennie","Wylma","Wynn","Wynne","Wynnie","Wynny","Xaviera","Xena","Xenia","Xylia","Xylina","Yalonda","Yasmeen","Yasmin","Yelena","Yetta","Yettie","Yetty","Yevette","Ynes","Ynez","Yoko","Yolanda","Yolande","Yolane","Yolanthe","Yoshi","Yoshiko","Yovonnda","Ysabel","Yvette","Yvonne","Zabrina","Zahara","Zandra","Zaneta","Zara","Zarah","Zaria","Zarla","Zea","Zelda","Zelma","Zena","Zenia","Zia","Zilvia","Zita","Zitella","Zoe","Zola","Zonda","Zondra","Zonnya","Zora","Zorah","Zorana","Zorina","Zorine","Zsazsa","Zulema","Zuzana"],exports.starWars=["Luke Skywalker","C-3PO","R2-D2","Darth Vader","Leia Organa","Owen Lars","Beru Whitesun lars","R5-D4","Biggs Darklighter","Obi-Wan Kenobi","Anakin Skywalker","Wilhuff Tarkin","Chewbacca","Han Solo","Greedo","Jabba Desilijic Tiure","Wedge Antilles","Jek Tono Porkins","Yoda","Palpatine","Boba Fett","IG-88","Bossk","Lando Calrissian","Lobot","Ackbar","Mon Mothma","Arvel Crynyd","Wicket Systri Warrick","Nien Nunb","Qui-Gon Jinn","Nute Gunray","Finis Valorum","Padmé Amidala","Jar Jar Binks","Roos Tarpals","Rugor Nass","Ric Olié","Watto","Sebulba","Quarsh Panaka","Shmi Skywalker","Darth Maul","Bib Fortuna","Ayla Secura","Ratts Tyerel","Dud Bolt","Gasgano","Ben Quadinaros","Mace Windu","Ki-Adi-Mundi","Kit Fisto","Eeth Koth","Adi Gallia","Saesee Tiin","Yarael Poof","Plo Koon","Mas Amedda","Gregar Typho","Cordé","Cliegg Lars","Poggle the Lesser","Luminara Unduli","Barriss Offee","Dormé","Dooku","Bail Prestor Organa","Jango Fett","Zam Wesell","Dexter Jettster","Lama Su","Taun We","Jocasta Nu","R4-P17","Wat Tambor","San Hill","Shaak Ti","Grievous","Tarfful","Raymus Antilles","Sly Moore","Tion Medon"],exports.uniqueNamesGenerator=i=>{const n=[...i&&i.dictionaries||a.dictionaries],l={...a,...i,length:i&&i.length||n.length,dictionaries:n};if(!i||!i.dictionaries||!i.dictionaries.length)throw new Error('A "dictionaries" array must be provided. This is a breaking change introduced starting from Unique Name Generator v4. Read more about the breaking change here: https://github.com/andreasonny83/unique-names-generator#migration-guide');return new e(l).generate()};
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 429:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }

  if (typeof process === "object" && "version" in process) {
    return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
  }

  return "<environment undetectable>";
}

exports.getUserAgent = getUserAgent;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 940:
/***/ ((module) => {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ }),

/***/ 877:
/***/ ((module) => {

module.exports = eval("require")("encoding");


/***/ }),

/***/ 357:
/***/ ((module) => {

"use strict";
module.exports = require("assert");;

/***/ }),

/***/ 614:
/***/ ((module) => {

"use strict";
module.exports = require("events");;

/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ 605:
/***/ ((module) => {

"use strict";
module.exports = require("http");;

/***/ }),

/***/ 211:
/***/ ((module) => {

"use strict";
module.exports = require("https");;

/***/ }),

/***/ 631:
/***/ ((module) => {

"use strict";
module.exports = require("net");;

/***/ }),

/***/ 87:
/***/ ((module) => {

"use strict";
module.exports = require("os");;

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),

/***/ 413:
/***/ ((module) => {

"use strict";
module.exports = require("stream");;

/***/ }),

/***/ 16:
/***/ ((module) => {

"use strict";
module.exports = require("tls");;

/***/ }),

/***/ 835:
/***/ ((module) => {

"use strict";
module.exports = require("url");;

/***/ }),

/***/ 669:
/***/ ((module) => {

"use strict";
module.exports = require("util");;

/***/ }),

/***/ 761:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(109);
/******/ })()
;