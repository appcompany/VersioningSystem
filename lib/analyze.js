"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateComment = exports.analyze = exports.extractList = void 0;
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
function analyze(releases, targetBranch, list) {
    var _a, _b, _c, _d, _e;
    const changes = list.split('\n')
        .map(line => {
        const section = changelog_1.sections.find(section => { var _a, _b; return section.tags.includes((_b = (_a = line.match(/([^[]+(?=]->))/g)) === null || _a === void 0 ? void 0 : _a.join('')) !== null && _b !== void 0 ? _b : ''); });
        const content = line.split(']->')[1].trim().replace(/\.+$/, '');
        return { section, content };
    });
    const current = versions_1.currentVersion(releases);
    const increase = (_a = changes.map(change => { var _a; return (_a = change.section) === null || _a === void 0 ? void 0 : _a.increases; }).sort()[0]) !== null && _a !== void 0 ? _a : versions_1.VersionIncrease.none;
    var labels = [];
    for (const change of changes) {
        if (!labels.includes((_c = (_b = change.section) === null || _b === void 0 ? void 0 : _b.tags[0]) !== null && _c !== void 0 ? _c : '')) {
            labels.push((_e = (_d = change.section) === null || _d === void 0 ? void 0 : _d.tags[0]) !== null && _e !== void 0 ? _e : '');
        }
    }
    labels = labels.filter(tag => tag != '');
    if (increase != versions_1.VersionIncrease.none)
        labels.push('releasable');
    const next = versions_1.nextVersion(current, increase);
    return {
        versionBump: increase,
        changes, labels,
        currentVersion: current,
        nextVersion: next,
        nextTag: `v${next.display}${targetBranch == 'appstore' ? '' : `-${targetBranch}`}`,
        releaseChangelog: changelog_1.changelog(changes, changelog_1.SectionType.release),
        internalChangelog: changelog_1.changelog(changes, changelog_1.SectionType.internal)
    };
}
exports.analyze = analyze;
function generateComment(targetBranch, analysis) {
    return `
      ${(() => {
        if (analysis.versionBump == versions_1.VersionIncrease.none) {
            return 'This pull request will currently not cause a release to be created, but can still be merged.';
        }
        else {
            return 'This pull request contains releasable changes.\nYou can release a new version with the `ready` label.';
        }
    })()}
      #### Version Details
      Release Stream: ${targetBranch}
      *${analysis.currentVersion.display}* -> **${analysis.nextTag}**

      ### App Store Preview
      \`\`\`
      ${analysis.releaseChangelog.trim().length > 0 ? analysis.releaseChangelog.trim() : 'no changes'}
      \`\`\`
      ### Internal Changes
      \`\`\`
      ${analysis.internalChangelog.trim().length > 0 ? analysis.internalChangelog.trim() : 'no changes'}
      \`\`\`
      <!-- version-bot-comment: release-notes -->
    `.split('\n').map(line => line.trim()).join('\n').trim();
}
exports.generateComment = generateComment;
