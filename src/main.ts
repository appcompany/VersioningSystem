import * as core from '@actions/core'
import * as github from '@actions/github' 
import { should } from 'chai'
import { analyze, extractList, generateComment } from './analyze'

const token = core.getInput('token')
const octokit = github.getOctokit(token)

async function run() {
  try {
    const context = github.context
    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.')
      return
    }

    const pull_number = context.payload.pull_request.number
    const pullRequestBody = context.payload.pull_request.body ?? ''

    const analysis = analyze(extractList(pullRequestBody))
    const commentBody = generateComment(analysis)

    const comments = await octokit.paginate(octokit.issues.listComments, { ...context.repo, issue_number: pull_number })
    const releaseComment = comments.find(comment => comment.body.includes('<!-- version-bot-comment: release-notes -->'))?.id
    const shouldRelease = comments.find(comment => comment.body.includes('/release')) != undefined
    const targetBranch = (await octokit.pulls.get({ ...context.repo, pull_number })).data.base.ref
    const didMerge = await octokit.pulls.checkIfMerged({ ...context.repo, pull_number })
    
    core.info(targetBranch)

    if (releaseComment != undefined && shouldRelease && !didMerge) {
      octokit.pulls.merge({
        ...context.repo,
        pull_number,
        commit_title: `v${analysis.nextVersion.display}${targetBranch == 'main' ? '' : `-${targetBranch}`}`,
        commit_message: `${analysis.releaseChangelog}\n${analysis.internalChangelog}`
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

