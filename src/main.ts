import * as core from '@actions/core'
import * as github from '@actions/github' 
import { analyze, extractList, generateComment } from './analyze'
import { VersionIncrease } from './versions'

async function run() {
  try {
    const context = github.context
    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.')
      return
    }
    
    const pull_number = context.payload.pull_request.number
    const pullRequestBody = context.payload.pull_request.body ?? ''

    const token = core.getInput('token')
    const octokit = github.getOctokit(token)

    const analysis = analyze(extractList(pullRequestBody))
    const commentBody = generateComment(analysis)

    octokit.paginate(octokit.issues.listComments, { ...context.repo, issue_number: pull_number })
    .then(comments => {
      const comment = comments.find(comment => comment.body.includes('<!-- version-bot-comment: release-notes -->'))?.id
      if (comment == undefined) {
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
          comment_id: comment,
          body: commentBody
        })
        .then(() => {
          core.info('updated comment on pull request.')
        })
        .catch(err => {
          core.setFailed(`unable to update comment on pull request. reason: ${err}`)
        })
      }
    })
    
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

