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
  releaseChangelog: string
  internalChangelog: string
  labels: string[]
}

export function analyze(list: string) : Analysis {
  const changes : AnalyzeChange[] = list.split('\n')
    .map(line => {
      const section = sections.find(section => section.tags.includes(line.match(/([^[]+(?=]->))/g)?.join('') ?? ''))
      const content = line.split(']->')[1].trim().replace(/\.+$/,'')
      return { section, content }
    })
  const current = currentVersion()
  const increase = changes.map(change => change.section?.increases).sort()[0] ?? VersionIncrease.none
  var labels : string[] = []
  for (const change of changes) {
    if (!labels.includes(change.section?.tags[0] ?? '')) {
      labels.push(change.section?.tags[0] ?? '')
    }
  }
  labels = labels.filter(tag => tag != '')
  if (increase != VersionIncrease.none) labels.push('can-release')
  return {
    versionBump: increase,
    changes, labels,
    currentVersion: current,
    nextVersion: nextVersion(current,increase),
    releaseChangelog: changelog(changes, SectionType.release),
    internalChangelog: changelog(changes, SectionType.internal)
  }
}