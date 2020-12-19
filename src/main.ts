import * as core from '@actions/core'
import * as github from '@actions/github'
import { release } from 'os'
import { appStoreChangelog, changelist, internalChangelog, log, previewComment, sections } from './changelog'
import { ReleaseContext, ReleaseTarget } from './context'

try {
  const context = new ReleaseContext()

  if (context.options.token == '' || context.options.token == undefined) {
    throw Error('No token supplied, please provide a working access token.')
  }

  context.load(async () => { 

    if (context.options.label_for_release) {
      if (!context.labels.includes('released')) {
        await context.connection?.issues.addLabels({ ...github.context.repo, issue_number: context.pullNumber, labels: ['released'] })
      }
    }
    if (context.options.labels) {

      const labels = changelist(log(context)).map(change => change.section.tags[0])
      var toAdd : string[] = []
      var toRemove : string[] = []
      for (const label of sections.map(section => section.tags[0])) {
        if (labels.includes(label) && !context.labels.includes(label)) toAdd.push(label)
        if (!labels.includes(label) && context.labels.includes(label)) toRemove.push(label)
      }

      if (toAdd.length > 0) await context.connection?.issues.addLabels({ ...github.context.repo, issue_number: context.pullNumber, labels: toAdd })
      for (const label of toRemove) {
        await context.connection?.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: label })
      }

    }
    if (context.options.preview || context.options.changelog) previewComment(context)
    if (context.options.release) {

      if (context.canRelease && !context.hasMerged && !context.isClosed && context.nextVersion?.display != undefined) {

        const sha = (await context.connection?.pulls.merge({
          ...github.context.repo,
          pull_number: context.pullNumber,
          merge_method: 'squash',
          commit_title: `merging v${context.nextVersion!.display} into ${context.releaseTarget}`,
          commit_message: log(context)
        }))?.data.sha

        if (sha != undefined) {

          const changelog = log(context)
          const changes = changelist(changelog)
          const tags = changes.map(change => change.section.tags[0])

          const appstore = appStoreChangelog(context, tags, changes).trim()
          const internal = internalChangelog(tags, changes).trim()

          const release_id = (await context.connection?.repos.createRelease({
            ...github.context.repo,
            tag_name: context.nextVersion!.display,
            target_commitish: sha,
            name: context.nextVersion!.display,
            body: `${appstore}\n\n${internal}`.trim(),
            draft: true,
            prerelease: context.releaseTarget != ReleaseTarget.appstore
          }))?.data.id

          if (release_id) {
            context.connection?.repos.uploadReleaseAsset({ ...github.context.repo, release_id, name: 'release.json', data: JSON.stringify({
              prev_version: context.currentVersion,
              version: context.nextVersion,
              changes: changelist(log(context)),
              appstore_changelog: appstore,
              internal_changelog: internal,
              sha, pull_number: context.pullNumber
            })})
          }

        }

      }

    }

  })
} catch (err) {
  core.setFailed(err)
}