import * as core from '@actions/core'
import * as github from '@actions/github'
import { changelist, log, previewComment, sections } from './changelog'
import { ReleaseContext } from './context'

try {
  const context = new ReleaseContext()

  if (context.options.token == '' || context.options.token == undefined) {
    throw Error('No token supplied, please provide a working access token.')
  }

  context.load(async () => { 

    if (context.options.labels) {

      const labels = changelist(log(context)).map(change => change.section.tags[0])
      var toAdd : string[] = []
      var toRemove : string[] = []
      for (const label of sections.map(section => section.tags[0])) {
        if (labels.includes(label) && !context.labels.includes(label)) toAdd.push(label)
        if (!labels.includes(label) && context.labels.includes(label)) toRemove.push(label)
      }

      await context.connection?.issues.addLabels({ ...github.context.repo, issue_number: context.pullNumber, labels: toAdd })
      for (const label of toRemove) {
        await context.connection?.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: label })
      }

    }
    if (context.options.preview || context.options.changelog) previewComment(context)
    if (context.options.release) {
      // create release
    }

  })
} catch (err) {
  core.setFailed(err)
}