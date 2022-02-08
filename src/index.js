const { Toolkit } = require("actions-toolkit")
const { appendFile } = require("fs").promises
const getRandomInt = require('./random')

const localPath = `./clone`;
const gitRepo = `https://${env.GITHUB_ACTOR}:${env.GITHUB_TOKEN}@${env.GIT_HOST}/${env.GITHUB_REPOSITORY}`;

const GITHUB_NAME = process.env.GITHUB_NAME
const GITHUB_EMAIL = process.env.GITHUB_EMAIL
const MIN_COMMITS = process.env.MIN_COMMITS
const MAX_COMMITS = process.env.MAX_COMMITS

const setGitUser = async tools => {
  await tools.exec("git", ["config", "--global", "user.email", GITHUB_EMAIL])
  await tools.exec("git", ["config", "--global", "user.name", GITHUB_NAME])
}

const getCommitMessage = () => process.env.GIT_COMMIT_MESSAGE
const commitFile = async (tools, message) => {
  await tools.exec("git", ["add", "README.md"])
  await tools.exec("git", ["commit", "-m", message, content])
}

const commitsToMake = getRandomInt(MIN_COMMITS, MAX_COMMITS);

const getContentFile = () => `Contribution ${new Date().toISOString()}`
const appendREADME = async content => {
  await appendFile("./README.md", content)
}

const clone = async tools => {
  await tools.exec("git", ["clone", '--single-branch', '-b', process.env.GIT_BRANCH, gitRepo, localPath])
}

const push = async tools => {
  await tools.exec("git", ["push", localPath, gitRepo, process.env.GIT_BRANCH,])
}

Toolkit.run(
  async (tools) => {
    const content = getContentFile()
    const message = getCommitMessage()
    try {
      await clone(tools)
      await setGitUser(tools)
      for (let i = 0; i < commitsToMake; i += 1) {
        await appendREADME(content)
        await commitFile(tools, message)
      }
      await push(tools)
    } catch (err) {
      tools.log.error("Something went wrong")
      return tools.exit.failure(err)
    }
    tools.exit.success("Pushed to remote repository")
  },
  {
    event: ["schedule", "workflow_dispatch"],
    secrets: ["GITHUB_TOKEN"],
  }
)
