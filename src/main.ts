import * as core from '@actions/core'
import * as github from '@actions/github' 
// import { analyze, extractList, generateComment } from './analyze'
// import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'
import { changelog, sections, SectionType } from './changelog'
import { Change, ReleaseContext } from './context'

try {
  const context = new ReleaseContext()

  if (context.options.token == '' || context.options.token == undefined) {
    throw Error('No token supplied, please provide a working access token.')
  }

  context.load(() => { 

    if (context.options.labels) {
      // set labels
    }
    if (context.options.preview || context.options.changelog) changelog(context)
    if (context.options.release) {
      // create release
    }

  })
} catch (err) {
  core.setFailed(err)
}