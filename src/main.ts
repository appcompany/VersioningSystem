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
          return 'This pull request contains releasable changes.\nYou can release a new version with `/release`.'
        }
      })()}
      #### Version Details
      *${analysis.currentVersion.display}* -> **${analysis.nextVersion.display}**

      ### Release Changes
      \`\`\`
      ${analysis.releaseChangelog.trim().length > 0 ? analysis.releaseChangelog.trim() : 'no changes'}
      \`\`\`
      ### Internal Changes
      \`\`\`
      ${analysis.internalChangelog.trim().length > 0 ? analysis.internalChangelog.trim() : 'no changes'}
      \`\`\`
    `.split('\n').map(line => line.trim()).join('\n').trim()
    core.info(`making comment:\n${comment}`)
    octokit.issues.createComment({
      ...context.repo,
      issue_number: pull_number,
      body: comment
    })
    octokit.issues.addLabels({
      ...context.repo,
      issue_number: pull_number,
      body: comment,
      labels: analysis.labels
    })
    core.setOutput('change_analysis.json',JSON.stringify(analysis))

  } catch (error) {
    core.setFailed(error.message)
  }
}

if (!process.env.TESTING) run();

