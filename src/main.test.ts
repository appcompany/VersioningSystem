import { expect } from 'chai'
import { isMatch } from 'picomatch'
import { fileMatch } from './main'

describe('Testable Changes', () => {
  describe('paths should match correctly', () => {
    for (const path of [
      ['test', false],
      ['.github/ISSUE_TEMPLATE/bug_report.md', false],
      ['.github/CODEOWNERS', false],
      ['FUNDING.yml', false],
      ['.github/FUNDING.yml', false],
      ['Source/something', false],
      ['Source/code.swift', true],
      ['.github/workflows/tests.yml', true],
      ['README.md', false],
      ['Source/README.md', false],
      ['fastlane/README.md', false],
      ['Gemfile.lock', true],
      ['Gemfile', true],
      ['Source/App/default.xcassets/image/image.jpg', true],
      ['Source/App/default.xcassets/image/image.json', true],
      ['Localization/Strings/Base.lproj/Localizable.strings', false]
    ]) {
      it(`${path[0]} -> ${path[1]}`, () => {
        expect(fileMatch(path[0].toString())).to.equal(path[1])
      })
    }
    // expect(isMatch('test', paths)).to.equal(false)
    // expect(isMatch('FUNDING.yml', paths)).to.equal(false)
    // expect(isMatch('.github/FUNDING.yml', paths)).to.equal(false)
    // expect(isMatch('Source/something', paths)).to.equal(false)
    // expect(isMatch('Source/code.swift', paths)).to.equal(true)
  })
})