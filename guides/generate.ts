import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { sections, SectionType } from '../src/changelog'
import { VersionIncrease } from '../src/versions'

const guidePath = resolve(__dirname + '/guide.md')

var table : string[][] = [['Section Title','Tags','Version Increase','Triggers Release']]

for (const section of sections) {
  var row : string[] = []
  row.push(section.displayName)
  row.push(section.tags.join(', '))
  row.push(section.increases == VersionIncrease.none ? '-' : section.increases)
  row.push(section.type == SectionType.release ? 'yes' : '-')
  table.push(row)
}

const columnSize = table[0].map(label => {
  const column = table[0].indexOf(label)
  const sizes = table.map(row => row[column].length)
  return Math.max(...sizes)
})

for (const row in table) {
  for (const column in table[row]) {
    table[row][column] = table[row][column].padEnd(columnSize[column],' ')
  }
}

table.splice(1,0,columnSize.map(size => ''.padEnd(size,'-')))

writeFileSync(guidePath,`# Version Label Guide

> In order to get the automated systems to know what changed 
> you need to use the labels below in the list of changes. 

\`\`\`
one change per line and always follow the following template:
[<label>]-> <message>
\`\`\`
${table.map(row => '| ' + row.join(' | ') + ' |').join('\n')}
`)

