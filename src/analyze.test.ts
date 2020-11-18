import { readFileSync } from 'fs'
import { resolve } from 'path'
import { expect } from 'chai'

import * as lib from './analyze';

const testBodyOne = readFileSync(resolve(__dirname + '/../tests/test-body-1.md')).toString()

describe('Analyzing', () => {
  it('should extract list correctly', () => {
    const result = lib.extractList(testBodyOne)
    const expected = `
      [fix]->         the login button now works
      [feat]->        addded a new button to logout
      [lang]->        added the Dutch language.
      [lang(fix)]->   Fixed a typo in the German translation
    `
    expect(result).to.equal(expected.split('\n').map(line => line.trim()).join('\n').trim())
  })
  it('should analyze list correctly', () => {
    const result = lib.analyze(lib.extractList(testBodyOne))
    console.log(result)
  })
})