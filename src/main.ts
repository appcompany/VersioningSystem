import * as core from '@actions/core'
import { previewComment } from './changelog'
import { ReleaseContext } from './context'

try {
  const context = new ReleaseContext()

  if (context.options.token == '' || context.options.token == undefined) {
    throw Error('No token supplied, please provide a working access token.')
  }

  context.load(() => { 

    if (context.options.labels) {
      // set labels
    }
    if (context.options.preview || context.options.changelog) previewComment(context)
    if (context.options.release) {
      // create release
    }

  })
} catch (err) {
  core.setFailed(err)
}