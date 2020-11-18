import { sections, ChangelogSection } from './changelog'
import { VersionIncrease } from './main'

export function extractList(body: string) : string {
  var inList = false
  return body.split('\n').map(line => line.trim()).filter(line => {
    if (!inList && line.indexOf('changes-begin') > -1) { inList = true; return false }
    if (inList && line.indexOf('changes-end') > -1) { inList = false; return false }
    if (inList && line != '```') return true
    return false
  }).join('\n')
}

interface AnalyzeResult {
  section: ChangelogSection | undefined
  content: string
}

export function analyze(list: string) {
  var versionIncrease : VersionIncrease | undefined
  const changes : AnalyzeResult[] = list.split('\n')
    .map(line => {
      const section = sections.find(section => section.tags.includes(line.match(/([^[]+(?=]->))/g)?.join('') ?? ''))
      const content = line.split(']->')[1].trim().replace(/\.+$/,'')
      return { section, content }
    })
  const changeIncreases = changes.map(change => change.section?.increases).sort()
  console.log(changeIncreases)
}