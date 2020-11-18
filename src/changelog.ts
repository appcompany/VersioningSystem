import { SectionType, VersionIncrease } from './main'

export class ChangelogSection {
  tags: string[]
  displayName: string
  type: SectionType
  increases: VersionIncrease | undefined
  hide: boolean

  constructor(name: string, tags: string[], type: SectionType, increases: VersionIncrease | undefined = undefined, hide: boolean = false) {
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
  new ChangelogSection('Languages', ['lang','language','new-lang','new-languages'], SectionType.release, VersionIncrease.minor),
  new ChangelogSection('Language Fixes', ['lang(fix)','lang-fix','langfix','fix-lang'], SectionType.release, VersionIncrease.patch),
  new ChangelogSection('Metadata', ['meta','metadata'], SectionType.release, VersionIncrease.patch, true),
  new ChangelogSection('Documentation', ['docs','doc'], SectionType.internal),
  new ChangelogSection('Build System', ['ci','build-system','build'], SectionType.internal),
  new ChangelogSection('Tests', ['test','testing'], SectionType.internal),
  new ChangelogSection('Miscellaneous', ['misc','chore'], SectionType.internal)
]

