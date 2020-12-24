import * as core from '@actions/core'
import * as github from '@actions/github'
import { connect } from 'http2'
import { release } from 'os'
import { isMatch } from 'picomatch'
import { appStoreChangelog, changelist, internalChangelog, log, previewComment, releaseChangelog, sections } from './changelog'
import { ReleaseContext, ReleaseTarget } from './context'
import { increaseOrder, nextVersion, VersionIncrease } from './versions'

try {
  const context = new ReleaseContext()

  if (context.options.token == '' || context.options.token == undefined) {
    throw Error('No token supplied, please provide a working access token.')
  }

  context.load(async () => { 

    if (context.options.tests) {

      const files = (await context.connection?.paginate(context.connection?.pulls.listFiles, { ...github.context.repo, pull_number: context.pullNumber })) ?? []
      var hasChanges = false
      for (const file of files) {
        if (isMatch(file.filename,[
          // includes
          'fastlane/**',
          'Gemfile*',
          '**.yml',
          '**.swift',
          '**.js',
          '**.plist',
          '**.json',
          '**.entitlements',
          '**.xcscheme',
          '**.pbxproj',
          '**.xcassets/**',
          // excludes
          '!**.md',
          '!**/FUNDING.yml'
        ])) hasChanges = true
      }

      core.setOutput('testable-changes', hasChanges)

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

      if (context.currentVersion == undefined) return core.setFailed('could not determine current version')
      if (context.status.canMerge == false) {
        await context.connection?.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: 'create-release' })
        return core.setFailed('this pull request is not ready to merge yet')
      }

      const changes = changelist(log(context))
      const appstore_changelog = appStoreChangelog(context, changes).trim()
      const internal_changelog = internalChangelog(changes).trim()
      const release_changelog = releaseChangelog(changes).trim()
      var bump = VersionIncrease.none
      for (const change of changes) {
        if (increaseOrder.indexOf(change.section.increases) < increaseOrder.indexOf(bump)) bump = change.section.increases
      }

      const version = nextVersion(context.currentVersion!, bump)
      const sha = (await context.connection?.pulls.merge({
        ...github.context.repo,
        pull_number: context.pullNumber,
        merge_method: 'squash',
        commit_title: context.status.canRelease ? `merging v${version.display} into ${context.releaseTarget}` : `merging pull #${context.pullNumber} into ${context.releaseTarget}`,
        commit_message: log(context)
      }))?.data.sha

      if (sha != undefined && context.status.canRelease) {

        const release_id = (await context.connection?.repos.createRelease({
          ...github.context.repo,
          tag_name: version.display,
          target_commitish: sha,
          name: version.display,
          body: release_changelog,
          draft: false,
          prerelease: context.releaseTarget != ReleaseTarget.appstore
        }))?.data.id

        if (release_id) {
          await context.connection?.repos.uploadReleaseAsset({ ...github.context.repo, release_id, name: 'release.json', data: JSON.stringify({
            prev_version: context.currentVersion,
            version, changes, release_changelog,
            appstore_changelog, internal_changelog,
            sha, pull_number: context.pullNumber
          })})
          await context.connection?.repos.uploadReleaseAsset({ ...github.context.repo, release_id, name: 'appstore_changelog', data: appstore_changelog })
          await context.connection?.issues.removeLabel({ ...github.context.repo, issue_number: context.pullNumber, name: 'create-release' })
          await context.connection?.issues.addLabels({ ...github.context.repo, issue_number: context.pullNumber, labels: ['released'] })
        }

      }

    }

  })
} catch (err) {
  core.setFailed(err)
}