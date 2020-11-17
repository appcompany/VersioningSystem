import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
  try {
    const context = github.context
    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.')
      return
    }
    
    const pull_request_number = context.payload.pull_request.number
    const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN') ?? process.env.GITHUB_TOKEN)

    octokit.issues.createComment({
      ...context.repo,
      issue_number: pull_request_number,
      body: 'this is a test message.'
    })
    
  } catch (error) {
    core.setFailed(error.message)
  }
}

run();
