// const { appendFile } = require('fs').promises
const fs = require('fs')
const autoParse = require('auto-parse')
const dotenv = require('dotenv-extended')
const getRandomInt = require('./random')
const { Toolkit } = require('actions-toolkit')

const env = autoParse({
  GIT_BRANCH: process.env.GIT_BRANCH || process.env.GITHUB_REF.replace(/^refs\/heads\//, ''),
  ...dotenv.load({ 
    defaults: '.env.defaults',
    schema: '.env.schema',
    errorOnMissing: true,
    includeProcessEnv: true
  }),
});

const localPath = './clone';
const gitRepo = `https://${env.GITHUB_ACTOR}:${env.GITHUB_TOKEN}@${env.GITHUB_HOST}/${env.GITHUB_REPOSITORY}`;

const GITHUB_NAME = env.GITHUB_NAME
const GITHUB_EMAIL = env.GITHUB_EMAIL
const MIN_COMMITS = env.MIN_COMMITS
const MAX_COMMITS = env.MAX_COMMITS

const setGitUser = async tools => {
  await tools.exec('git', ['config', '--global', 'user.email', GITHUB_EMAIL])
  await tools.exec('git', ['config', '--global', 'user.name', GITHUB_NAME])
}

const getCommitMessage = () => `${env.GITHUB_COMMIT_MESSAGE} - ${new Date().toISOString()}`
const commitFile = async (tools, message) => {
  await tools.exec('git', ['-C', localPath, 'add', 'COMMITSLOG.md'])
  await tools.exec('git', ['-C', localPath, 'commit', '-m', message])
}

const commitsToMake = getRandomInt(MIN_COMMITS, MAX_COMMITS);

const getContentFile = () => `Commits: ${new Date().toISOString()}`
// const appendREADME = async content => {
//   await appendFile(localPath, 'README.md', content)
// }

const appendDataToFile = async (path, data) => {
  await fs.promises.appendFile(path, data)
  const buff = await fs.promises.readFile(path)

  const content = buff.toString()
  console.log(`Content : ${content}`)
}

const appendREADME = async content => {
  content += '\n<br>\n';
  await appendDataToFile('./clone/COMMITSLOG.md', content)
}

// appendDataToFile('./clone/test.txt', 
//     'Please add me to the test file..!!')
//     .catch(err => {
//         console.log(err)
// })

const clone = async tools => {
  await tools.exec('git', ['clone', '--single-branch', '-b', env.GIT_BRANCH, gitRepo, localPath])
}

const push = async tools => {
  // await tools.exec('git', ['push', localPath, gitRepo, env.GIT_BRANCH,])
  await tools.exec('git', [ '-C', localPath, 'push'])
}

Toolkit.run(async (tools) => {
  
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
      tools.log.error('Something went wrong')
      return tools.exit.failure(err)    
    }
    tools.exit.success('Pushed to remote repository')
  },
  {
    event: ['schedule', 'workflow_dispatch'], secrets: ['GITHUB_TOKEN']
  }
)
