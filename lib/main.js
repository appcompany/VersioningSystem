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
try {
    const context = new context_1.ReleaseContext();
    if (context.options.token == '' || context.options.token == undefined) {
        throw Error('No token supplied, please provide a working access token.');
    }
    context.load(async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
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
                await ((_a = context.connection) === null || _a === void 0 ? void 0 : _a.issues.addLabels({ ...github.context.repo, issue_number: context.pullNumber, labels: toAdd }));
            for (const label of toRemove) {
                await ((_b = context.connection) === null || _b === void 0 ? void 0 : _b.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: label }));
            }
        }
        if (context.options.preview || context.options.changelog)
            changelog_1.previewComment(context);
        if (context.options.release) {
            if (((_c = context.nextVersion) === null || _c === void 0 ? void 0 : _c.display) != undefined) {
                const sha = (_e = (await ((_d = context.connection) === null || _d === void 0 ? void 0 : _d.pulls.merge({
                    ...github.context.repo,
                    pull_number: context.pullNumber,
                    merge_method: 'squash',
                    commit_title: `merging v${context.nextVersion.display} into ${context.releaseTarget}`,
                    commit_message: changelog_1.log(context)
                })))) === null || _e === void 0 ? void 0 : _e.data.sha;
                if (sha != undefined) {
                    const changelog = changelog_1.log(context);
                    const changes = changelog_1.changelist(changelog);
                    const tags = changes.map(change => change.section.tags[0]);
                    const appstore = changelog_1.appStoreChangelog(context, tags, changes).trim();
                    const internal = changelog_1.internalChangelog(tags, changes).trim();
                    const release_id = (_g = (await ((_f = context.connection) === null || _f === void 0 ? void 0 : _f.repos.createRelease({
                        ...github.context.repo,
                        tag_name: context.nextVersion.display,
                        target_commitish: sha,
                        name: context.nextVersion.display,
                        body: `${appstore}\n\n${internal}`.trim(),
                        draft: true,
                        prerelease: context.releaseTarget != context_1.ReleaseTarget.appstore
                    })))) === null || _g === void 0 ? void 0 : _g.data.id;
                    if (release_id) {
                        (_h = context.connection) === null || _h === void 0 ? void 0 : _h.repos.uploadReleaseAsset({ ...github.context.repo, release_id, name: 'release.json', data: JSON.stringify({
                                prev_version: context.currentVersion,
                                version: context.nextVersion,
                                changes: changelog_1.changelist(changelog_1.log(context)),
                                appstore_changelog: appstore,
                                internal_changelog: internal,
                                sha, pull_number: context.pullNumber
                            }) });
                    }
                }
            }
        }
    });
}
catch (err) {
    core.setFailed(err);
}
