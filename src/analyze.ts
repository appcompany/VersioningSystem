import { sections, ChangelogSection, changelog, SectionType } from './changelog'
import { currentVersion, nextVersion, Version, VersionIncrease } from './versions';

export function extractList(body: string) : string {
  var inList = false
  return body.split('\n').map(line => line.trim()).filter(line => {
    if (!inList && line.indexOf('changes-begin') > -1) { inList = true; return false }
    if (inList && line.indexOf('changes-end') > -1) { inList = false; return false }
    if (inList && line != '```') return true
    return false
  }).join('\n')
}

export interface AnalyzeChange {
  section: ChangelogSection | undefined
  content: string
}

export interface Analysis {
  versionBump: VersionIncrease
  changes: AnalyzeChange[]
  currentVersion: Version
  nextVersion: Version
  nextTag: string
  releaseChangelog: string
  internalChangelog: string
  labels: string[]
}

export function analyze(releases: string[], targetBranch: string, list: string) : Analysis {
  const changes : AnalyzeChange[] = list.split('\n')
    .map(line => {
      const section = sections.find(section => section.tags.includes(line.match(/([^[]+(?=]->))/g)?.join('') ?? ''))
      const content = line.split(']->')[1].trim().replace(/\.+$/,'')
      return { section, content }
    })
  const current = currentVersion(releases)
  const increase = changes.map(change => change.section?.increases).sort()[0] ?? VersionIncrease.none
  var labels : string[] = []
  for (const change of changes) {
    if (!labels.includes(change.section?.tags[0] ?? '')) {
      labels.push(change.section?.tags[0] ?? '')
    }
  }
  labels = labels.filter(tag => tag != '')
  if (increase != VersionIncrease.none) labels.push('releasable')
  const next = nextVersion(current,increase)
  return {
    versionBump: increase,
    changes, labels,
    currentVersion: current,
    nextVersion: next,
    nextTag: `v${next.display}${targetBranch == 'appstore' ? '' : `-${targetBranch}`}`,
    releaseChangelog: changelog(changes, SectionType.release),
    internalChangelog: changelog(changes, SectionType.internal)
  }
}

export function generateComment(targetBranch: string, analysis: Analysis) : string {
  return `
      ${(() => {
        if (analysis.versionBump == VersionIncrease.none) {
          return 'This pull request will currently not cause a release to be created, but can still be merged.'
        } else {
          return 'This pull request contains releasable changes.\nYou can release a new version with the `ready` label.'
        }
      })()}
      #### Version Details
      Release Stream: ${targetBranch}
      *${analysis.currentVersion.display}* -> **${analysis.nextVersion.display}**

      ### App Store Preview
      \`\`\`
      ${analysis.releaseChangelog.trim().length > 0 ? analysis.releaseChangelog.trim() : 'no changes'}
      \`\`\`
      ### Internal Changes
      \`\`\`
      ${analysis.internalChangelog.trim().length > 0 ? analysis.internalChangelog.trim() : 'no changes'}
      \`\`\`
      <!-- version-bot-comment: release-notes -->
    `.split('\n').map(line => line.trim()).join('\n').trim()
}