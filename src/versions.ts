import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator"

export enum VersionIncrease {
  major = 'major',
  minor = 'minor',
  patch = 'patch',
  none = 'none'
}

export const increaseOrder : VersionIncrease[] = [
  VersionIncrease.major,VersionIncrease.minor,VersionIncrease.patch,VersionIncrease.none
]

export class Version {
  major: number
  minor: number 
  patch: number

  get display(): string {
    return `${this.major}.${this.minor}.${this.patch}`
  }

  constructor(text: string) {
    const split = text.replace(/[^0-9.]/g,'').split('.')
    this.major = Number(split[0] ?? '0') ?? 0
    this.minor = Number(split[1] ?? '0') ?? 0
    this.patch = Number(split[2] ?? '0') ?? 0
  }

}

export function currentVersion(releases: string[]) : Version {
  return releases.filter(release => !release.includes('-')).map(release => new Version(release)).sort((lhs,rhs) => {
    if (lhs.major == rhs.major) {
      if (lhs.minor == rhs.minor) {
        if (lhs.patch == rhs.patch) return 0
        if (lhs.patch < rhs.patch) return 1
        if (lhs.patch > rhs.patch) return -1
      } 
      else if (lhs.minor < rhs.minor) return 1
      else if (lhs.minor > rhs.minor) return -1
    }
    else if (lhs.major < rhs.major) return 1
    else if (lhs.major > rhs.major) return -1
    return 0
  })[0] ?? new Version('0.0.1')
}

export function nextVersion(current: Version, increase: VersionIncrease) : Version {
  const nextVersion = new Version(current.display)
  if (increase == VersionIncrease.patch) { nextVersion.patch += 1 }
  if (increase == VersionIncrease.minor) { 
    nextVersion.patch = 0
    nextVersion.minor += 1
  }
  if (increase == VersionIncrease.major) {
    nextVersion.patch = 0
    nextVersion.minor = 0 
    nextVersion.major += 1
  }
  return nextVersion
}

export function versionName(used: string[]) : string {
  const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
  if (used.includes(randomName)) return versionName(used)
  else return randomName
}