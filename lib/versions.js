"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextVersion = exports.currentVersion = exports.Version = exports.increaseOrder = exports.VersionIncrease = void 0;
const context_1 = require("./context");
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
        var _a, _b, _c, _d, _e, _f;
        if (text.includes('alpha'))
            this.target = context_1.ReleaseTarget.alpha;
        if (text.includes('beta'))
            this.target = context_1.ReleaseTarget.beta;
        else
            this.target = context_1.ReleaseTarget.appstore;
        const split = text.replace(/[^0-9.]/g, '').split('.');
        this.major = (_b = Number((_a = split[0]) !== null && _a !== void 0 ? _a : '0')) !== null && _b !== void 0 ? _b : 0;
        this.minor = (_d = Number((_c = split[1]) !== null && _c !== void 0 ? _c : '0')) !== null && _d !== void 0 ? _d : 0;
        this.patch = (_f = Number((_e = split[2]) !== null && _e !== void 0 ? _e : '0')) !== null && _f !== void 0 ? _f : 0;
    }
    get display() {
        return `${this.major}.${this.minor}.${this.patch}`;
    }
}
exports.Version = Version;
function currentVersion(releases) {
    var _a;
    return (_a = releases.filter(release => release.version.target == context_1.ReleaseTarget.appstore).map(release => release.version).sort((lhs, rhs) => {
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
    })[0]) !== null && _a !== void 0 ? _a : new Version('0.0.1');
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
