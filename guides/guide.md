# Version Label Guide

> In order to get the automated systems to know what changed 
> you need to use the labels below in the list of changes. 

```
one change per line and always follow the following template:
[<label>]-> <message>
```
| Section Title  | Tags                                   | Version Increase | Triggers Release |
| -------------- | -------------------------------------- | ---------------- | ---------------- |
| New Features   | bug, bugfix, fix                       | minor            | yes              |
| Bug Fixes      | feat, feature, new-feat, new-feature   | patch            | yes              |
| Changes        | change, refactor, changes              | minor            | yes              |
| Languages      | lang, language, new-lang, new-language | minor            | yes              |
| Language Fixes | lang-fix, lang(fix), langfix, fix-lang | patch            | yes              |
| Metadata       | meta, metadata                         | patch            | yes              |
| Documentation  | docs, doc                              | -                | -                |
| Build System   | ci, build-system, build                | -                | -                |
| Tests          | test, testing                          | -                | -                |
| Miscellaneous  | misc, chore                            | -                | -                |
