import * as core from '@actions/core'
import * as github from '@actions/github' 
import { analyze, extractList, generateComment } from './analyze'
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

function versionName(used: string[]) : string {
  const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
  if (used.includes(randomName)) return versionName(used)
  else return randomName
}

async function run() {
  try {
    const context = github.context
    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.')
      return
    }

    const token = core.getInput('token')
    const octokit = github.getOctokit(token)

    const pull_number = context.payload.pull_request.number
    const pullRequestBody = context.payload.pull_request.body ?? ''

    const releases = await octokit.paginate(octokit.repos.listReleases, { ...context.repo })
    releases
    const data = (await octokit.pulls.get({ ...context.repo, pull_number })).data
    const comments = await octokit.paginate(octokit.issues.listComments, { ...context.repo, issue_number: pull_number })
    const releaseComment = comments.find(comment => comment.body.includes('<!-- version-bot-comment: release-notes -->'))?.id
    const shouldRelease = data.labels.map(label => label.name).includes('ready')
    const targetBranch = data.base.ref

    const analysis = analyze(releases.filter(release => !release.prerelease).map(release => release.tag_name) ,extractList(pullRequestBody))
    const commentBody = generateComment(targetBranch, analysis)
    const didMerge : boolean = data.merged

    core.info(`didMerge: ${didMerge}`)

    if (releaseComment != undefined && shouldRelease && !didMerge) {
      const versionTag = `v${analysis.nextVersion.display}${targetBranch == 'appstore' ? '' : `-${targetBranch}`}`
      octokit.pulls.merge({
        ...context.repo,
        pull_number,
        commit_title: versionTag,
        commit_message: `${analysis.releaseChangelog}\n${analysis.internalChangelog}`.trim(),
        merge_method: 'squash'
      })
      .then(() => {
        core.info(`merged into release stream ${targetBranch}`)
        octokit.repos.createRelease({
          ...context.repo,
          tag_name: versionTag,
          name: versionName(releases.map(release => release.name)),
          body: analysis.releaseChangelog,
          prerelease: targetBranch == 'appstore' ? false : true,
          target_commitish: targetBranch
        })
        .then(() => {
          core.info(`created release ${versionTag}`)
        })
        .catch(err => {
          core.setFailed(`unable to create release. reason: ${err}`)
        })
      })
      .catch(err => {
        core.setFailed(`unable to merge into release stream ${targetBranch}. reason: ${err}`)
      })
    } else if (releaseComment == undefined) {
      octokit.issues.createComment({
        ...context.repo,
        issue_number: pull_number,
        body: commentBody
      })
      .then(() => {
        core.info('commented on pull request.')
      })
      .catch(err => {
        core.setFailed(`unable to create comment on pull request. reason: ${err}`)
      })
    } else {
      octokit.issues.updateComment({
        ...context.repo,
        issue_number: pull_number,
        comment_id: releaseComment,
        body: commentBody
      })
      .then(() => {
        core.info('updated comment on pull request.')
      })
      .catch(err => {
        core.setFailed(`unable to update comment on pull request. reason: ${err}`)
      })
    }
    
    octokit.issues.addLabels({
      ...context.repo,
      issue_number: pull_number,
      labels: analysis.labels
    })
    .then(() => {
      core.info('set labels on pull request.')
    })
    .catch(err => {
      core.setFailed(`unable to set labels on pull request. reason: ${err}`)
    })
    core.setOutput('change_analysis.json',JSON.stringify(analysis))

  } catch (error) {
    core.setFailed(error.message)
  }
}

if (!process.env.TESTING) run();

