import * as core from '@actions/core'
import * as github from '@actions/github'
import { appStoreChangelog, changelist, internalChangelog, log, previewComment, sections } from './changelog'
import { ReleaseContext, ReleaseTarget } from './context'
import { increaseOrder, nextVersion, VersionIncrease } from './versions'

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

      if (toAdd.length > 0) await context.connection?.issues.addLabels({ ...github.context.repo, issue_number: context.pullNumber, labels: toAdd })
      for (const label of toRemove) {
        await context.connection?.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: label })
      }

    }
    if (context.options.preview || context.options.changelog) previewComment(context)
    if (context.options.release) {

      if (context.currentVersion == undefined) return core.setFailed('could not determine current version')
      if (context.status.canMerge == false) {
        await context.connection?.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: 'create-release' })
        return core.setFailed('this pull request is not ready to merge yet')
      }

      const changes = changelist(log(context))
      var bump = VersionIncrease.none
      for (const change of changes) {
        if (increaseOrder.indexOf(change.section.increases) < increaseOrder.indexOf(bump)) bump = change.section.increases
      }

      const version = nextVersion(context.currentVersion!, bump)
      const sha = (await context.connection?.pulls.merge({
        ...github.context.repo,
        pull_number: context.pullNumber,
        merge_method: 'squash',
        commit_title: `merging v${version.display} into ${context.releaseTarget}`,
        commit_message: log(context)
      }))?.data.sha

      if (sha != undefined && context.status.canRelease) {

        const changelog = log(context)
        const changes = changelist(changelog)
        const tags = changes.map(change => change.section.tags[0])

        const appstore = appStoreChangelog(context, tags, changes).trim()
        const internal = internalChangelog(tags, changes).trim()

        const release_id = (await context.connection?.repos.createRelease({
          ...github.context.repo,
          tag_name: version.display,
          target_commitish: sha,
          name: version.display,
          body: `${appstore}\n\n${internal}`.trim(),
          draft: true,
          prerelease: context.releaseTarget != ReleaseTarget.appstore
        }))?.data.id

        if (release_id) {
          await context.connection?.repos.uploadReleaseAsset({ ...github.context.repo, release_id, name: 'release.json', data: JSON.stringify({
            prev_version: context.currentVersion,
            version, changes,
            appstore_changelog: appstore,
            internal_changelog: internal,
            sha, pull_number: context.pullNumber
          })})
          await context.connection?.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: 'create-release' })
          await context.connection?.issues.addLabels({ ...github.context.repo, issue_number: context.pullNumber, labels: ['released'] })
        }

      }

    }

  })
} catch (err) {
  core.setFailed(err)
}