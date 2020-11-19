import * as core from '@actions/core'
import * as github from '@actions/github' 
import { analyze, extractList } from './analyze'
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

    const token = core.getInput('githubToken')
    const octokit = github.getOctokit(token)

    const analysis = analyze(extractList(pullRequestBody))
    const comment = `
      ${(() => {
        if (analysis.versionBump == VersionIncrease.none) {
          return 'This pull request will currently not cause a release to be created, but can still be merged.'
        } else {
          return 'Thils pull request contains releasable changes. You can release it with `/release`.'
        }
      })()}
      
      ## Release Changes
      ${analysis.releaseChangelog.length > 0 ? analysis.releaseChangelog : 'no changes'}

      ## Internal Changes
      ${analysis.internalChangelog.length > 0 ? analysis.internalChangelog : 'no changes'}
    `.split('\n').map(line => line.trim()).join('\n').trim()
    core.info(`making comment:\n${comment}`)
    octokit.issues.createComment({
      ...context.repo,
      issue_number: pull_number,
      body: comment
    })

  } catch (error) {
    core.setFailed(error.message)
  }
}

if (!process.env.TESTING) run();

