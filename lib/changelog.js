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
exports.changelog = exports.sections = exports.ChangelogSection = exports.SectionType = void 0;
const versions_1 = require("./versions");
const github = __importStar(require("@actions/github"));
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
    new ChangelogSection('Bug Fixes', 'bug', ['bug', 'bugfix', 'fix'], SectionType.release, versions_1.VersionIncrease.minor),
    new ChangelogSection('New Features', 'feature', ['feature', 'feat', 'new-feat', 'new-feature'], SectionType.release, versions_1.VersionIncrease.patch),
    new ChangelogSection('Changes', 'change', ['change', 'refactor', 'changes'], SectionType.release, versions_1.VersionIncrease.minor),
    new ChangelogSection('Languages', 'language', ['language', 'lang', 'new-lang', 'new-language'], SectionType.release, versions_1.VersionIncrease.minor),
    new ChangelogSection('Language Fixes', 'language-fix', ['language-fix', 'lang-fix', 'lang(fix)', 'langfix', 'fix-lang'], SectionType.release, versions_1.VersionIncrease.patch),
    new ChangelogSection('Metadata', 'metadata', ['metadata', 'meta'], SectionType.release, versions_1.VersionIncrease.patch, true),
    new ChangelogSection('Documentation', 'documentation', ['documentation', 'docs', 'doc'], SectionType.internal),
    new ChangelogSection('Build System', 'ci', ['ci', 'build-system', 'build'], SectionType.internal),
    new ChangelogSection('Tests', 'tests', ['tests', 'test', 'testing'], SectionType.internal),
    new ChangelogSection('Miscellaneous', 'misc', ['misc', 'chore'], SectionType.internal)
];
const changelog = (context) => {
    var _a, _b;
    const changelog = (() => {
        var _a, _b;
        if (context.options.changelog) {
            var changelog = '';
            for (const commit of context.commits.filter(commit => !commit.alreadyInBase)) {
                for (const change of commit.changes) {
                    changelog += `[${change.section.tags[0]}]-> ${change.message}\n`;
                }
            }
            return changelog;
        }
        else {
            var open = false;
            var changelog = '';
            for (const line of ((_b = (_a = context.comments.find(comment => comment.id == context.status.changelogCommentID)) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : '').split('\n')) {
                if (line.includes('<!-- begin-changelog-list -->'))
                    open = true;
                else if (open && line.includes('<!-- end-changelog-list -->'))
                    open = false;
                else if (open)
                    changelog += `${line.replace(/[\`]/g, '').trim()}\n`;
            }
            return changelog;
        }
    })();
    const changes = changelog.split('\n').flatMap(line => {
        var _a, _b, _c;
        const regex = new RegExp(/\[(?<tag>.*?)\]\-\>/g);
        const tag = (_c = (_b = (_a = regex.exec(line)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.tag) !== null && _c !== void 0 ? _c : '';
        const section = exports.sections.find(section => section.tags.includes(tag));
        const message = line.replace(regex, '').trim();
        return section != undefined ? { section, message } : [];
    });
    const sectionTags = changes.map(change => change.section.tags[0]);
    var appstoreChangelog = '';
    for (const section of exports.sections.filter(section => section.type == SectionType.release)) {
        if (sectionTags.includes(section.tags[0])) {
            appstoreChangelog += `${section.displayName}:\n`;
            for (const change of changes.filter(change => change.section.tags[0] == section.tags[0])) {
                appstoreChangelog += `- ${change.message}\n`;
            }
        }
    }
    var internalChangelog = '';
    for (const section of exports.sections.filter(section => section.type == SectionType.internal)) {
        if (sectionTags.includes(section.tags[0])) {
            internalChangelog += `${section.displayName}:\n`;
            for (const change of changes.filter(change => change.section.tags[0] == section.tags[0])) {
                internalChangelog += `- ${change.message}\n`;
            }
        }
    }
    const comment = `
    # Changelogs.
    > please make any needed changes and wait for the preview to generate in a comment below.
    <!-- begin-changelog-list -->
    \`\`\`
    ${changelog.length == 0 ? '-' : changelog.trim()}
    \`\`\`
    <!-- end-changelog-list -->
    ### App Store Preview
    \`\`\`
    ${appstoreChangelog.length == 0 ? 'No releaseable changes.' : appstoreChangelog.trim()}
    \`\`\`
    ##### Internal Preview
    \`\`\`
    ${internalChangelog.length == 0 ? 'No internal changes.' : internalChangelog.trim()}
    \`\`\`
    - [ ] Changelogs are correct. (will trigger a merge + release)
    <!-- version-bot-comment: changelog -->
  `.split('\n').map(line => line.trim()).join('\n');
    if (context.status.changelogCommentID != undefined) {
        (_a = context.connection) === null || _a === void 0 ? void 0 : _a.issues.updateComment({ ...github.context.repo, comment_id: context.status.changelogCommentID, body: comment });
    }
    else {
        (_b = context.connection) === null || _b === void 0 ? void 0 : _b.issues.createComment({ ...github.context.repo, issue_number: context.pullNumber, body: comment });
    }
};
exports.changelog = changelog;
