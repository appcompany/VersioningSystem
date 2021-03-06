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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const changelog_1 = require("./changelog");
const context_1 = require("./context");
const versions_1 = require("./versions");
try {
    const context = new context_1.ReleaseContext();
    if (context.options.token == '' || context.options.token == undefined) {
        throw Error('No token supplied, please provide a working access token.');
    }
    context.load(async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        if (context.options.tests) {
            const files = (_c = (await ((_a = context.connection) === null || _a === void 0 ? void 0 : _a.paginate((_b = context.connection) === null || _b === void 0 ? void 0 : _b.pulls.listFiles, { ...github.context.repo, pull_number: context.pullNumber })))) !== null && _c !== void 0 ? _c : [];
            for (const file of files) {
                console.log(`${file.filename} > ${file.status}`);
            }
        }
        if (context.options.labels) {
            const labels = changelog_1.changelist(changelog_1.log(context)).map(change => change.section.tags[0]);
            var toAdd = [];
            var toRemove = [];
            for (const label of changelog_1.sections.map(section => section.tags[0])) {
                if (labels.includes(label) && !context.labels.includes(label))
                    toAdd.push(label);
                if (!labels.includes(label) && context.labels.includes(label))
                    toRemove.push(label);
            }
            if (toAdd.length > 0)
                await ((_d = context.connection) === null || _d === void 0 ? void 0 : _d.issues.addLabels({ ...github.context.repo, issue_number: context.pullNumber, labels: toAdd }));
            for (const label of toRemove) {
                await ((_e = context.connection) === null || _e === void 0 ? void 0 : _e.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: label }));
            }
        }
        if (context.options.preview || context.options.changelog)
            changelog_1.previewComment(context);
        if (context.options.release) {
            if (context.currentVersion == undefined)
                return core.setFailed('could not determine current version');
            if (context.status.canMerge == false) {
                await ((_f = context.connection) === null || _f === void 0 ? void 0 : _f.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: 'create-release' }));
                return core.setFailed('this pull request is not ready to merge yet');
            }
            const changes = changelog_1.changelist(changelog_1.log(context));
            const appstore_changelog = changelog_1.appStoreChangelog(context, changes).trim();
            const internal_changelog = changelog_1.internalChangelog(changes).trim();
            const release_changelog = changelog_1.releaseChangelog(changes).trim();
            var bump = versions_1.VersionIncrease.none;
            for (const change of changes) {
                if (versions_1.increaseOrder.indexOf(change.section.increases) < versions_1.increaseOrder.indexOf(bump))
                    bump = change.section.increases;
            }
            const version = versions_1.nextVersion(context.currentVersion, bump);
            const sha = (_h = (await ((_g = context.connection) === null || _g === void 0 ? void 0 : _g.pulls.merge({
                ...github.context.repo,
                pull_number: context.pullNumber,
                merge_method: 'squash',
                commit_title: context.status.canRelease ? `merging v${version.display} into ${context.releaseTarget}` : `merging pull #${context.pullNumber} into ${context.releaseTarget}`,
                commit_message: changelog_1.log(context)
            })))) === null || _h === void 0 ? void 0 : _h.data.sha;
            if (sha != undefined && context.status.canRelease) {
                const release_id = (_k = (await ((_j = context.connection) === null || _j === void 0 ? void 0 : _j.repos.createRelease({
                    ...github.context.repo,
                    tag_name: version.display,
                    target_commitish: sha,
                    name: version.display,
                    body: release_changelog,
                    draft: false,
                    prerelease: context.releaseTarget != context_1.ReleaseTarget.appstore
                })))) === null || _k === void 0 ? void 0 : _k.data.id;
                if (release_id) {
                    await ((_l = context.connection) === null || _l === void 0 ? void 0 : _l.repos.uploadReleaseAsset({ ...github.context.repo, release_id, name: 'release.json', data: JSON.stringify({
                            prev_version: context.currentVersion,
                            version, changes, release_changelog,
                            appstore_changelog, internal_changelog,
                            sha, pull_number: context.pullNumber
                        }) }));
                    await ((_m = context.connection) === null || _m === void 0 ? void 0 : _m.repos.uploadReleaseAsset({ ...github.context.repo, release_id, name: 'appstore_changelog', data: appstore_changelog }));
                    await ((_o = context.connection) === null || _o === void 0 ? void 0 : _o.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: 'create-release' }));
                    await ((_p = context.connection) === null || _p === void 0 ? void 0 : _p.issues.addLabels({ ...github.context.repo, issue_number: context.pullNumber, labels: ['released'] }));
                }
            }
        }
    });
}
catch (err) {
    core.setFailed(err);
}
