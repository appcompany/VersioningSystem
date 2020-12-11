// import { readFileSync } from 'fs'
// import { resolve } from 'path'
// import { expect } from 'chai'

// import * as lib from './analyze';
// import { sections } from './changelog';

// const testBodyOne = readFileSync(resolve(__dirname + '/../tests/test-body-1.md')).toString()
// const testTags = readFileSync(resolve(__dirname + '/../tests/tags-test.md')).toString()

// describe('Analyzing', () => {
//   it('should extract list correctly', () => {
//     const result = lib.extractList(testBodyOne)
//     const expected = `
//       [fix]->         the login button now works
//       [feat]->        added a new button to logout
//       [lang]->        added the Dutch language.
//       [lang(fix)]->   Fixed a typo in the German translation
//     `
//     expect(result).to.equal(expected.split('\n').map(line => line.trim()).join('\n').trim())
//   })
//   it('should analyze list correctly', () => {
//     const result = lib.analyze(['v0.0.1','v0.1.0'], 'appstore', lib.extractList(testBodyOne))
//     expect(result.currentVersion.display).to.equal('0.1.0')
//     expect(result.nextVersion.display).to.equal('0.2.0')
//     expect(result.changes.length).to.equal(4)
//     expect(result.releaseChangelog).to.equal(`
//       New Features
//       - the login button now works

//       Bug Fixes
//       - added a new button to logout

//       Languages
//       - added the Dutch language

//       Language Fixes
//       - fixed a typo in the German translation
//     `.split('\n').map(line => line.trim()).join('\n').trim() + '\n')
//     expect(result.internalChangelog).to.equal('')
//     expect(result.labels).to.contain('language')
//     expect(result.labels).to.contain('bug')
//     expect(result.labels).to.contain('feature')
//     expect(result.labels).to.contain('language-fix')
//     expect(result.labels).to.contain('releasable')
//   })

//   const tagsResult = lib.analyze(['v0.0.1'], 'appstore', lib.extractList(testTags))
//   for (const section of sections) {
//     it(`should detect all ${section.displayName} tags`, () => {
//       expect(tagsResult.changes.filter(change => change.section == section).length).to.equal(section.tags.length)
//     })
//   }

// })