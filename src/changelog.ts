import { Change, Release, ReleaseContext, ReleaseTarget } from './context'
import { increaseOrder, nextVersion, Version, VersionIncrease } from './versions'
import * as github from '@actions/github'

export enum SectionType {
  release = 'release',
  internal = 'internal'
}

export class ChangelogSection {
  
  label: string
  tags: string[]
  displayName: string
  type: SectionType
  increases: VersionIncrease
  hide: boolean

  constructor(name: string, label: string, tags: string[], type: SectionType, increases: VersionIncrease = VersionIncrease.none, hide: boolean = false) {
    this.tags = tags
    this.displayName = name
    this.type = type
    this.increases = increases
    this.hide = hide
    this.label = label
  }

}

// ordered list of changelog sections
export const sections : ChangelogSection[] = [
  new ChangelogSection('New Features',    'feature',        ['feature','feat','new-feat','new-feature'],                    SectionType.release, VersionIncrease.minor),
  new ChangelogSection('Changes',         'change',         ['change','refactor','changes'],                                SectionType.release, VersionIncrease.minor),
  new ChangelogSection('Bug Fixes',       'bug',            ['bug','bugfix','fix'],                                         SectionType.release, VersionIncrease.patch),
  new ChangelogSection('Languages',       'language',       ['language','lang','new-lang','new-language'],                  SectionType.release, VersionIncrease.minor),
  new ChangelogSection('Language Fixes',  'language-fix',   ['language-fix','lang-fix','lang(fix)','langfix','fix-lang'],   SectionType.release, VersionIncrease.patch),
  new ChangelogSection('Metadata',        'metadata',       ['metadata','meta'],                                            SectionType.release, VersionIncrease.patch, true),
  new ChangelogSection('Documentation',   'documentation',  ['documentation','docs','doc'],                                 SectionType.internal),
  new ChangelogSection('Build System',    'ci',             ['ci','build-system','build'],                                  SectionType.internal),
  new ChangelogSection('Tests',           'tests',          ['tests','test','testing'],                                     SectionType.internal),
  new ChangelogSection('Miscellaneous',   'misc',           ['misc','chore'],                                               SectionType.internal)
]

export const log = (context: ReleaseContext) => {
  if (context.options.changelog) {
    var changelog = ''
    for (const commit of context.commits.filter(commit => !commit.alreadyInBase)) {
      for (const change of commit.changes) {
        changelog += `[${change.section.tags[0]}]-> ${change.message}\n`
      }
    }
    return changelog
  } else {
    var open = false
    var changelog = ''
    for (const line of (context.comments.find(comment => comment.id == context.status.changelogCommentID)?.content ?? '').split('\n')) {
      if (line.includes('<!-- begin-changelog-list -->')) open = true
      else if (open && line.includes('<!-- end-changelog-list -->')) open = false
      else if (open) changelog += `${line.replace(/[\`]/g,'').trim()}\n`
    }
    return changelog
  }
}

export const changelist = (changelog: string) => {

  return changelog.split('\n').flatMap(line => {
    const regex = new RegExp(/\[(?<tag>.*?)\]\-\>/g)
    const tag = regex.exec(line)?.groups?.tag ?? ''
    const section = sections.find(section => section.tags.includes(tag))
    const message = line.replace(regex, '').trim()
    return section != undefined ? { section, message } : []
  })

}

export const appStoreChangelog = (context: ReleaseContext, tags: string[], changes: Change[]) => {

  var appstoreChangelog = ''
  for (const section of sections.filter(section => section.type == SectionType.release)) {
    if (tags.includes(section.tags[0])) {
      appstoreChangelog += `\n${section.displayName}:\n`
      for (const change of changes.filter(change => change.section.tags[0] == section.tags[0])) {
        appstoreChangelog += `- ${change.message}\n`
      }
    }
  }

  return `
    ${context.updateMessage}\n
    ${appstoreChangelog.length == 0 ? 'No releaseable changes.' : appstoreChangelog.trim()}
    \n${context.updateFooter}
  `.split('\n').map(line => line.trim()).join('\n')

}

export const internalChangelog = (tags: string[], changes: Change[]) => {
  
  var internalChangelog = ''
  for (const section of sections.filter(section => section.type == SectionType.internal)) {
    if (tags.includes(section.tags[0])) {
      internalChangelog += `\n${section.displayName}:\n`
      for (const change of changes.filter(change => change.section.tags[0] == section.tags[0])) {
        internalChangelog += `- ${change.message}\n`
      }
    }
  }

  return internalChangelog

}

export const previewComment = (context: ReleaseContext) => {

  const changelog = log(context)
  const changes = changelist(changelog)
  const tags = changes.map(change => change.section.tags[0])

  const appstore = appStoreChangelog(context, tags, changes).trim()
  const internal = internalChangelog(tags, changes).trim()

  var bump = VersionIncrease.none
  for (const change of changes) {
    if (increaseOrder.indexOf(change.section.increases) < increaseOrder.indexOf(bump)) bump = change.section.increases
  }

  const comment = `
    # Versions.
    > creates release: ${ context.canRelease ? 'yes' : 'no' }
    >*current: ${ context.currentVersion?.display ?? '-' }*
    > \`next: ${ context.canRelease ? `${nextVersion(context.currentVersion ?? new Version('0.0.1'), bump).display}${ context.releaseTarget != ReleaseTarget.appstore ? `-${context.releaseTarget}` : '' }` : '-' }\`

    # Changelogs.
    > please make any needed changes and wait for the preview to generate in this comment.
    <!-- begin-changelog-list -->
    \`\`\`
    ${changelog.length == 0 ? '-' : changelog.trim()}
    \`\`\`
    <!-- end-changelog-list -->
    ### App Store Preview
    \`\`\`
    ${appstore.length == 0 || !context.canRelease ? 'No releaseable changes.' : appstore}
    \`\`\`
    ##### Internal Preview
    \`\`\`
    ${internal.length == 0 ? 'No internal changes.' : internal}
    \`\`\`
    > add the \`create-release\` tag to this pull request to create this release.
    <!-- version-bot-comment: changelog -->
  `.split('\n').map(line => line.trim()).join('\n')
  if (context.status.changelogCommentID != undefined) {
    context.connection?.issues.updateComment({ ...github.context.repo, comment_id: context.status.changelogCommentID, body: comment })
  } else {
    context.connection?.issues.createComment({ ...github.context.repo, issue_number: context.pullNumber, body: comment })
  }

}