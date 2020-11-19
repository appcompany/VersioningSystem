"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyze = exports.extractList = void 0;
const changelog_1 = require("./changelog");
const versions_1 = require("./versions");
function extractList(body) {
    var inList = false;
    return body.split('\n').map(line => line.trim()).filter(line => {
        if (!inList && line.indexOf('changes-begin') > -1) {
            inList = true;
            return false;
        }
        if (inList && line.indexOf('changes-end') > -1) {
            inList = false;
            return false;
        }
        if (inList && line != '```')
            return true;
        return false;
    }).join('\n');
}
exports.extractList = extractList;
function analyze(list) {
    var _a;
    const changes = list.split('\n')
        .map(line => {
        const section = changelog_1.sections.find(section => { var _a, _b; return section.tags.includes((_b = (_a = line.match(/([^[]+(?=]->))/g)) === null || _a === void 0 ? void 0 : _a.join('')) !== null && _b !== void 0 ? _b : ''); });
        const content = line.split(']->')[1].trim().replace(/\.+$/, '');
        return { section, content };
    });
    const current = versions_1.currentVersion();
    const increase = (_a = changes.map(change => { var _a; return (_a = change.section) === null || _a === void 0 ? void 0 : _a.increases; }).sort()[0]) !== null && _a !== void 0 ? _a : versions_1.VersionIncrease.none;
    return {
        versionBump: increase,
        changes,
        currentVersion: current,
        nextVersion: versions_1.nextVersion(current, increase),
        releaseChangelog: changelog_1.changelog(changes, changelog_1.SectionType.release),
        internalChangelog: changelog_1.changelog(changes, changelog_1.SectionType.internal)
    };
}
exports.analyze = analyze;
