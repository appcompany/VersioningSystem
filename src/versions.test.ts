import { expect } from 'chai'
import { VersionIncrease, increaseOrder } from './versions'
import * as lib from './versions'

const versionMatrix = ['0.0.0','v0.0.1','0.1.0','v1.2.3_alpha','17.0.23','1.0.0']
const increasedVersionMatrix = [
  ['1.0.0','1.0.0','1.0.0','2.0.0','18.0.0','2.0.0'], // major
  ['0.1.0','0.1.0','0.2.0','1.3.0','17.1.0','1.1.0'], // minor
  ['0.0.1','0.0.2','0.1.1','1.2.4','17.0.24','1.0.1'], // patch
  ['0.0.0','0.0.1','0.1.0','1.2.3','17.0.23','1.0.0'] // none
]

describe('Versions', () => {
  it('should have correct current version', () => {
    expect(lib.currentVersion(['v0.0.1','v0.1.0','v0.1.1']).display).to.equal('0.1.1')
    expect(lib.currentVersion(['v0.0.1','v2.0.1','v0.1.0','v0.1.1']).display).to.equal('2.0.1')
    expect(lib.currentVersion(['v0.0.1','v2.0.1','v0.1.0','v0.1.1','v3.0.0-alpha']).display).to.equal('2.0.1')
  })
  it('should convert string to version correctly', () => {
    expect(JSON.stringify(new lib.Version('1.2.3'))).to.equal('{"major":1,"minor":2,"patch":3}')
    expect(JSON.stringify(new lib.Version('v1.2.3'))).to.equal('{"major":1,"minor":2,"patch":3}')
    expect(JSON.stringify(new lib.Version('v1.2.3-beta'))).to.equal('{"major":1,"minor":2,"patch":3}')
  })
  it('should convert version to string correctly', () => {
    expect(new lib.Version('1.2.3'))
  })
  for (const increase of increaseOrder) {
    describe(`version should increase [${increase}] correctly`, () => {
      for (const version of versionMatrix) {
        const correctResult = increasedVersionMatrix[increaseOrder.indexOf(increase)][versionMatrix.indexOf(version)]
        it(`${version} -> ${correctResult}`, () => {
          const input = new lib.Version(version)
          expect(lib.nextVersion(input,increase).display).to.equal(correctResult)
        })
      }
    })  
  }
})