import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import { getOctokit } from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { ChangelogSection, sections } from './changelog'
import { currentVersion, Version } from './versions'

const majorPath = resolve(`${process.env.GITHUB_WORKSPACE ?? process.cwd()}/.versioning/major_version`)
const messagePath = resolve(`${process.env.GITHUB_WORKSPACE ?? process.cwd()}/.versioning/update_message`)
const footerPath = resolve(`${process.env.GITHUB_WORKSPACE ?? process.cwd()}/.versioning/update_footer`)

export class ReleaseStatus {

  changelogCommentID: number | undefined
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

  constructor(input: ({ id: number; body?: string | undefined } | undefined)) {
    this.id = input?.id ?? 0
    this.content = input?.body ?? ''
  }

}

export class Release {

  id: number
  name: string
  tag: string
  version: Version
  body: string
  prerelease: boolean
  commitish: string
  asset: number | undefined

  constructor(input: ({ id: number, body?: string | null | undefined, name: string | null, target_commitish: string, tag_name: string, prerelease: boolean, assets: { id: number, name: string }[]}) | undefined) {
    this.id = input?.id ?? 0
    this.asset = input?.assets.find(asset => asset.name.toLowerCase().includes('release.json'))?.id
    this.commitish = input?.target_commitish ?? ''
    this.tag = input?.tag_name ?? ''
    this.version = new Version(this.tag)
    this.name = input?.name ?? ''
    this.prerelease = input?.prerelease ?? true
    this.body = input?.body ?? ''
  }

}

export interface Change { message: string, section: ChangelogSection }
export class Commit {

  sha: string | null
  alreadyInBase = false
  changes: Change[]

  constructor(input: { sha: string | null, commit: { message: string }}) {
    this.sha = input.sha
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

  pullNumber : number = Number(core.getInput('pullRequest') ?? '0')

  labels: string[] = []
  releases: Release[] = []
  comments: Comment[] = []
  commits: Commit[] = []

  releaseTarget: ReleaseTarget = ReleaseTarget.invalid

  currentVersion: Version | undefined
  nextVersion: Version | undefined

  updateFooter: string | undefined
  updateMessage: string | undefined
  majorVersion: number

  load = async (callback: () => void) => {

    const data = (await this.connection?.pulls.get({ ...github.context.repo, pull_number: this.pullNumber }))?.data
    this.labels = (data?.labels ?? []).map(label => label?.name ?? '').filter(label => label != undefined)
    this.requestBody = data?.body ?? ''
    this.status.didMerge = data?.merged

    this.commits = (await this.connection?.paginate(
      this.connection.pulls.listCommits, { ...github.context.repo, pull_number: this.pullNumber }
    ))?.map(commit => new Commit({ ...commit })) ?? []

    for (const commit of this.commits) {
      commit.alreadyInBase = ['identical','behind'].includes((await this.connection?.repos.compareCommits({ ...github.context.repo, base: data?.base.ref ?? '', head: commit.sha ?? '' }))?.data.status ?? '')
    }

    console.log(data?.base.ref)

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

    this.comments = ((await this.connection?.paginate(
      this.connection?.issues.listComments, { ...github.context.repo, issue_number: this.pullNumber }
    )) ?? []).flatMap(comment => comment != undefined ? [new Comment(comment)] : [])

    this.status.changelogCommentID = this.comments.find(comment => comment.content.includes('<!-- version-bot-comment: changelog -->'))?.id

    this.releases = (await this.connection?.paginate(
      this.connection?.repos.listReleases, { ...github.context.repo,  }
    ))?.flatMap(release => release != undefined ? [new Release(release)] : []) ?? []

    this.currentVersion = currentVersion(this.releases)

    callback()

  }

  constructor(options: SystemOptions = new SystemOptions()) {

    if (Number(core.getInput('pullRequest') ?? '') == NaN && process.env.TESTING !== 'true') {
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
