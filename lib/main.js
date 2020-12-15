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
const context_1 = require("./context");
try {
    const context = new context_1.ReleaseContext();
    if (context.options.token == '' || context.options.token == undefined) {
        throw Error('No token supplied, please provide a working access token.');
    }
    context.load(() => {
        var _a, _b;
        if (context.options.changelog) {
            var changelog = '';
            for (const commit of context.commits) {
                for (const change of commit.changes) {
                    changelog += `[${change.section.tags[0]}]-> ${change.message}\n`;
                }
            }
            const comment = `### Changelog Preview.\nplease make any needed changes and tick the checkbox below.\n${changelog}\n[ ] Changelog is correct (will auto release)\n<!-- version-bot-comment: changelog -->`;
            console.log(`generated comment:\n${comment}`);
            if (context.status.changelogCommentID != undefined) {
                (_a = context.connection) === null || _a === void 0 ? void 0 : _a.issues.updateComment({ ...github.context.repo, comment_id: context.status.changelogCommentID, body: comment });
            }
            else {
                (_b = context.connection) === null || _b === void 0 ? void 0 : _b.issues.createComment({ ...github.context.repo, issue_number: context.pullNumber, body: changelog });
            }
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
