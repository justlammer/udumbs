// const { appendFile } = require('fs').promises
const fs = require('fs')
const autoParse = require('auto-parse')
const dotenv = require('dotenv-extended')
const getRandomInt = require('./random')
// const path = require('path') 
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

// const deleteFiles = async tools => {
//   await tools.exec('rm', [localPath + '/COMMITSLOG.md'])
// }

const getCommitMessage = () => `${env.GITHUB_COMMIT_MESSAGE} - ${new Date().toISOString()}`
const commitFile = async (tools, message) => {
  await tools.exec('git', ['-C', localPath, 'add', 'COMMITSLOG.md'])
  await tools.exec('git', ['-C', localPath, 'commit', '-m', message])
}

const commitsToMake = getRandomInt(MIN_COMMITS, MAX_COMMITS);

const getContentFile = () => `Commits: ${new Date().toISOString()}`
// const appendCOMMITSLOG = async content => {
//   await appendFile(localPath, 'README.md', content)
// }

const filePath = ('./clone/COMMITSLOG.md')

const deleteExistingFiles = async () => {

  await fs.promises.access(filePath, (error) => {
    //  if any error
    if (error) {
      console.log(error)
      return
    }

    console.log("File Exists!")
  });

  // fs.access(filePath, fs.F_OK) => {
  //   if (F_OK) {
  //     console.log('File exists.');
  //     // return
  //   } else {
  //     console.log('File not found.');
  //   }

  // await path.existsSync(filePath, function(exists) { 
  //   if (exists) { 
  //     // do something
  //       console.log('File exists.');
  //   } else {
  //       console.log('File not found.');
  //   }
  // }); 
  
  // if (fs.accessSync(localPath + '/COMMITSLOG.md')) {
  //   // path exists
  //   console.log("exists:", path);
  // } else {
  //   console.log("DOES NOT exist:", path);
  // } 
  // if (fs.accessSync(filePath)) {
  //   // path exists
  //   console.log("FILE EXISTS:", path);
  //   // await fs.promises.unlink(data);
  // } else {
  //   console.log("FILE DOES NOT EXISTS:", path);
  // } 

  // await fs.promises.stat(localPath + '/COMMITSLOG.md', async (exists) => {

  //   if(exists) {
  //       console.log('File exists.');
  //       // await fs.unlink(data);
  //       //await tools.exec('rm', (data))
  //       // await fs.promises.unlink(data);
  //   } else {
  //       console.log('File not found.');
  //   }

  // });
}

// const deleteFiles = async () => {
//   await deleteExistingFiles(localPath + '/COMMITSLOG.md')
// }

const appendDataToFile = async (path, data) => {
  await fs.promises.appendFile(path, data)
  // const buff = await fs.promises.readFile(path)

  // const content = buff.toString()
  // console.log(`Content : ${content}`)
}

// const filePath = path.join(__dirname, '/pictures');
const appendCOMMITSLOG = async content => {
  content += '\n<br>\n';
  await appendDataToFile(localPath + '/COMMITSLOG.md', content)
}

// appendDataToFile('./clone/test.txt', 
//     'Please add me to the test file..!!')
//     .catch(err => {
//         console.log(err)
// })

const gitClone = async tools => {
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
      await gitClone(tools)
      await setGitUser(tools)
      await deleteExistingFiles(tools)

      for (let i = 0; i < commitsToMake; i += 1) {
        await appendCOMMITSLOG(content)
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
