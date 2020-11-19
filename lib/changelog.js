"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changelog = exports.sections = exports.ChangelogSection = exports.SectionType = void 0;
const versions_1 = require("./versions");
var SectionType;
(function (SectionType) {
    SectionType["release"] = "release";
    SectionType["internal"] = "internal";
})(SectionType = exports.SectionType || (exports.SectionType = {}));
class ChangelogSection {
    constructor(name, tags, type, increases = versions_1.VersionIncrease.none, hide = false) {
        this.tags = tags;
        this.displayName = name;
        this.type = type;
        this.increases = increases;
        this.hide = hide;
    }
}
exports.ChangelogSection = ChangelogSection;
// ordered list of changelog sections
exports.sections = [
    new ChangelogSection('New Features', ['bug', 'bugfix', 'fix'], SectionType.release, versions_1.VersionIncrease.minor),
    new ChangelogSection('Bug Fixes', ['feature', 'feat', 'new-feat', 'new-feature'], SectionType.release, versions_1.VersionIncrease.patch),
    new ChangelogSection('Changes', ['change', 'refactor', 'changes'], SectionType.release, versions_1.VersionIncrease.minor),
    new ChangelogSection('Languages', ['language', 'lang', 'new-lang', 'new-language'], SectionType.release, versions_1.VersionIncrease.minor),
    new ChangelogSection('Language Fixes', ['language-fix', 'lang-fix', 'lang(fix)', 'langfix', 'fix-lang'], SectionType.release, versions_1.VersionIncrease.patch),
    new ChangelogSection('Metadata', ['metadata', 'meta'], SectionType.release, versions_1.VersionIncrease.patch, true),
    new ChangelogSection('Documentation', ['documentation', 'docs', 'doc'], SectionType.internal),
    new ChangelogSection('Build System', ['ci', 'build-system', 'build'], SectionType.internal),
    new ChangelogSection('Tests', ['tests', 'test', 'testing'], SectionType.internal),
    new ChangelogSection('Miscellaneous', ['misc', 'chore'], SectionType.internal)
];
const lowercase = (input) => input.charAt(0).toLowerCase() + input.slice(1);
function changelog(changes, type) {
    var text = [];
    for (const section of exports.sections.filter(section => section.type == type)) {
        if (section.hide)
            continue;
        var foundOne = false;
        for (const change of changes) {
            if (change.section == section) {
                if (!foundOne) {
                    text.push(`${section.displayName}`);
                    foundOne = true;
                }
                text.push(`- ${lowercase(change.content)}`);
            }
        }
        if (foundOne)
            text.push('');
    }
    return text.join('\n');
}
exports.changelog = changelog;
