import { resolve } from 'path'
import { expect } from 'chai'
import { Comment, Commit, ReleaseContext } from './context'

describe('Context', () => {
  it('should read values correctly from files' , () => {
    const context = new ReleaseContext()
    expect(context.majorVersion).to.equal(1)
    expect(context.updateMessage).to.equal('This is a message that is displayed at the top of the Release Notes.')
    expect(context.updateFooter).to.equal('This is a message that is displayed')
  })
  it('should have proper commit reading', () => {
    const commit = new Commit({ commit: { message: `
      [test]-> this is a test
      [feature]-> something new
      [lang(fix)]-> minor fix
    `.split('\n').map(line => line.trim()).join('\n') } })
    console.log(commit.changes)
  })
})