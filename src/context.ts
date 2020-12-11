import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import { getOctokit } from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { ChangelogSection, sections } from './changelog'

const majorPath = resolve(`${process.cwd()}/.versioning/major_version`)
const messagePath = resolve(`${process.cwd()}/.versioning/update_message`)
const footerPath = resolve(`${process.cwd()}/.versioning/update_footer`)

export class ReleaseStatus {

  changelogCommentID: number | undefined
  previewCommentID: number | undefined
  shouldRelease = false
  didMerge: boolean | undefined

}

export class SystemOptions {

  token: string
  release: boolean
  labels: boolean
  changelog: boolean
  preview: boolean

  constructor() {
    this.token = core.getInput('token')
    this.release = ['yes','true'].includes(core.getInput('release').toLowerCase())
    this.labels = ['yes','true'].includes(core.getInput('labels').toLowerCase())
    this.changelog = ['yes','true'].includes(core.getInput('changelog').toLowerCase())
    this.preview = ['yes','true'].includes(core.getInput('preview').toLowerCase())
  }

}

export class Comment {

  id: number
  content: string

  constructor(input: { id: number, body: string }) {
    this.id = input.id
    this.content = input.body
  }

}

export class Release {

  id: number
  name: string
  tag: string
  body: string
  prerelease: boolean
  commitish: string
  asset: number | undefined

  constructor(input: { id: number, body: string, name: string, target_commitish: string, tag_name: string, prerelease: boolean, assets: { id: number, name: string }[]}) {
    this.id = input.id
    this.asset = input.assets.find(asset => asset.name.toLowerCase().includes('release.json'))?.id
    this.commitish = input.target_commitish
    this.tag = input.tag_name
    this.name = input.name
    this.prerelease = input.prerelease
    this.body = input.body
  }

}

export interface Change { message: string, section: ChangelogSection }
export class Commit {

  changes: Change[]

  constructor(input: { commit: { message: string }}) {
    this.changes = input.commit.message.split('\n').flatMap(line => {
      const regex = new RegExp(/\[(?<tag>.*?)\]\-\>/g)
      const tag = regex.exec(line)?.groups?.tag ?? ''
      const section = sections.find(section => section.tags.includes(tag))
      const message = line.replace(regex, '').trim()
      return section != undefined ? { section, message } : []
    })
  }

}

export enum ReleaseTarget {
  invalid = 'invalid', appstore = 'appstore', beta = 'beta', alpha = 'alpha'
}

export class ReleaseContext {

  connection: InstanceType<typeof GitHub> | undefined
  options: SystemOptions = new SystemOptions()
  status = new ReleaseStatus()
  requestBody : string | undefined

  pullNumber: number = github.context.payload.pull_request?.number ?? 0

  labels: string[] = []
  releases: Release[] = []
  comments: Comment[] = []
  commits: Commit[] = []

  releaseTarget: ReleaseTarget = ReleaseTarget.invalid

  updateFooter: string | undefined
  updateMessage: string | undefined
  majorVersion: number

  load = async (callback: () => void) => {

    const data = (await this.connection?.pulls.get({ ...github.context.repo, pull_number: this.pullNumber }))?.data
    this.labels = data?.labels.map(label => label.name) ?? []
    this.requestBody = data?.body
    this.status.didMerge = data?.merged

    this.commits = (await this.connection?.paginate(
      this.connection.pulls.listCommits, { ...github.context.repo, pull_number: this.pullNumber }
    ))?.map(commit => new Commit({ ...commit })) ?? []

    switch (data?.base.ref) {
      case 'appstore':
        this.releaseTarget = ReleaseTarget.appstore
      case 'alpha':
        this.releaseTarget = ReleaseTarget.alpha
      case 'beta':
        this.releaseTarget = ReleaseTarget.beta
      default:
        this.releaseTarget = ReleaseTarget.invalid
    }

    this.comments = (await this.connection?.paginate(
      this.connection?.issues.listComments, { ...github.context.repo, issue_number: this.pullNumber }
    ))?.map(comment => new Comment({ ...comment })) ?? []
    this.status.changelogCommentID = this.comments.find(comment => comment.content.includes('<!-- version-bot-comment: changelog -->'))?.id
    this.status.previewCommentID = this.comments.find(comment => comment.content.includes('<!-- version-bot-comment: preview -->'))?.id

    this.releases = (await this.connection?.paginate(
      this.connection?.repos.listReleases, { ...github.context.repo }
    ))?.map(release => new Release({ ...release })) ?? []

    callback()

  }

  constructor(options: SystemOptions = new SystemOptions()) {

    if (github.context.payload.pull_request == null && process.env.TESTING !== 'true') {
      throw Error('Unable to find pull request, make sure to run this action with pull requests only.')
    }

    if (process.env.TESTING !== 'true') {
      this.options = options
      this.connection = getOctokit(options.token)
    }

    this.updateFooter = existsSync(footerPath) ? readFileSync(footerPath).toString().trim() : undefined
    this.updateMessage = existsSync(messagePath) ? readFileSync(messagePath).toString().trim() : undefined
    this.majorVersion = existsSync(majorPath) ? Number(readFileSync(majorPath).toString().trim()) : 0

  }

}