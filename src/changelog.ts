import { AnalyzeChange } from './analyze'
import { VersionIncrease } from './versions'

export enum SectionType {
  release = 'release',
  internal = 'internal'
}

export class ChangelogSection {
  tags: string[]
  displayName: string
  type: SectionType
  increases: VersionIncrease
  hide: boolean

  constructor(name: string, tags: string[], type: SectionType, increases: VersionIncrease = VersionIncrease.none, hide: boolean = false) {
    this.tags = tags
    this.displayName = name
    this.type = type
    this.increases = increases
    this.hide = hide
  }

}

// ordered list of changelog sections
export const sections : ChangelogSection[] = [
  new ChangelogSection('New Features', ['bug','bugfix','fix'], SectionType.release, VersionIncrease.minor),
  new ChangelogSection('Bug Fixes', ['feat','feature','new-feat','new-feature'], SectionType.release, VersionIncrease.patch),
  new ChangelogSection('Changes', ['change','refactor','changes'], SectionType.release, VersionIncrease.minor),
  new ChangelogSection('Languages', ['lang','language','new-lang','new-language'], SectionType.release, VersionIncrease.minor),
  new ChangelogSection('Language Fixes', ['lang-fix','lang(fix)','langfix','fix-lang'], SectionType.release, VersionIncrease.patch),
  new ChangelogSection('Metadata', ['meta','metadata'], SectionType.release, VersionIncrease.patch, true),
  new ChangelogSection('Documentation', ['docs','doc'], SectionType.internal),
  new ChangelogSection('Build System', ['ci','build-system','build'], SectionType.internal),
  new ChangelogSection('Tests', ['test','testing'], SectionType.internal),
  new ChangelogSection('Miscellaneous', ['misc','chore'], SectionType.internal)
]

const lowercase = (input: string) => input.charAt(0).toLowerCase() + input.slice(1)

export function changelog(changes: AnalyzeChange[], type: SectionType) {
  var text : string[] = []
  for (const section of sections.filter(section => section.type == type)) {
    if (section.hide) continue
    var foundOne = false
    for (const change of changes) {
      if (change.section == section) {
        if (!foundOne) { text.push(`${section.displayName}`); foundOne = true }
        text.push(`- ${lowercase(change.content)}`)
      }
    }
    if (foundOne) text.push('')
  }
  return text.join('\n')
}