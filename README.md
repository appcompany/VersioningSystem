# Version Bot

In order to help maintain the a correct changelog and version history for the apps at App Company.io this Github Actions based version-bot was created. It analyzes commits, generates changelogs and also merge pull request and create new releases with the correct changelog attached and the correct versioning number.

Feature list:
- Analyze commits in a Pull Request
- Generate Changelogs (both internal and App Store)
- Bump version numbers based on changelogs
- Label Pull Requests automatically based on changelog
- Wait for human approval of changelog
- Automatically merges pull requests when possible
- Create releases when needed
