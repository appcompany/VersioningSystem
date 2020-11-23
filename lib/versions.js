"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextVersion = exports.currentVersion = exports.Version = exports.increaseOrder = exports.VersionIncrease = void 0;
var VersionIncrease;
(function (VersionIncrease) {
    VersionIncrease["major"] = "major";
    VersionIncrease["minor"] = "minor";
    VersionIncrease["patch"] = "patch";
    VersionIncrease["none"] = "none";
})(VersionIncrease = exports.VersionIncrease || (exports.VersionIncrease = {}));
exports.increaseOrder = [
    VersionIncrease.major, VersionIncrease.minor, VersionIncrease.patch, VersionIncrease.none
];
class Version {
    constructor(text) {
        var _a, _b, _c;
        const split = text.replace(/[^0-9.]/g, '').split('.');
        this.major = (_a = Number(split[0])) !== null && _a !== void 0 ? _a : 0;
        this.minor = (_b = Number(split[1])) !== null && _b !== void 0 ? _b : 0;
        this.patch = (_c = Number(split[2])) !== null && _c !== void 0 ? _c : 1;
    }
    get display() {
        return `${this.major}.${this.minor}.${this.patch}`;
    }
}
exports.Version = Version;
function currentVersion(releases) {
    return releases.filter(release => !release.includes('-')).map(release => new Version(release)).sort((lhs, rhs) => {
        if (lhs.major == rhs.major) {
            if (lhs.minor == rhs.minor) {
                if (lhs.patch == rhs.patch)
                    return 0;
                if (lhs.patch < rhs.patch)
                    return 1;
                if (lhs.patch > rhs.patch)
                    return -1;
            }
            else if (lhs.minor < rhs.minor)
                return 1;
            else if (lhs.minor > rhs.minor)
                return -1;
        }
        else if (lhs.major < rhs.major)
            return 1;
        else if (lhs.major > rhs.major)
            return -1;
        return 0;
    })[0];
}
exports.currentVersion = currentVersion;
function nextVersion(current, increase) {
    const nextVersion = new Version(current.display);
    if (increase == VersionIncrease.patch) {
        nextVersion.patch += 1;
    }
    if (increase == VersionIncrease.minor) {
        nextVersion.patch = 0;
        nextVersion.minor += 1;
    }
    if (increase == VersionIncrease.major) {
        nextVersion.patch = 0;
        nextVersion.minor = 0;
        nextVersion.major += 1;
    }
    return nextVersion;
}
exports.nextVersion = nextVersion;
