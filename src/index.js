const fs = require('fs');
const autoParse = require('auto-parse');
const dotenv = require('dotenv-extended');
const getRandomInt = require('./random');
const { Toolkit } = require('actions-toolkit');
const { setGitUser } = require("./git");
const { getCommitMessage } = require("./git");
const { appendLogs } = require("./git");
const { commitFile } = require("./git");
const { push } = require("./git");
const { gitClone } = require("./git");

const env = autoParse({
  GIT_BRANCH:
    process.env.GIT_BRANCH ||
    process.env.GITHUB_REF.replace(/^refs\/heads\//, ''),
  ...dotenv.load({
    defaults: '.env.defaults',
    schema: '.env.schema',
    errorOnMissing: true,
    includeProcessEnv: true,
  }),
});

exports.GITHUB_NAME = GITHUB_NAME;
exports.GITHUB_EMAIL = GITHUB_EMAIL;
exports.gitRepo = gitRepo;
exports.msgRefference = msgRefference;

const GITHUB_NAME = env.GITHUB_NAME;
const GITHUB_EMAIL = env.GITHUB_EMAIL;
const MIN_COMMITS = env.MIN_COMMITS;
const MAX_COMMITS = env.MAX_COMMITS;
const commitsToMake = getRandomInt(MIN_COMMITS, MAX_COMMITS);

const localPath = './clone';
const logFile = 'COMMITSLOG.md';
const commitedLogFile = `${localPath}/${logFile}`;
const gitRepo = `https://${env.GITHUB_ACTOR}:${env.GITHUB_TOKEN}@${env.GITHUB_HOST}/${env.GITHUB_REPOSITORY}`;
const msgRefference = 'Generated via https://github.com/marketplace/actions/artificial-grass';
const getContentFile = () => `Commits: ${new Date().toISOString()} - ${msgRefference}`

Toolkit.run(
  async (tools) => {
    const content = getContentFile();
    const message = getCommitMessage();

    try {
      await gitClone(tools);
      await setGitUser(tools);

      if (fs.existsSync(commitedLogFile)) {
        console.log(`File exists: ${commitedLogFile}`);
        await tools.exec('rm', [commitedLogFile]);
      } else {
        console.log(`${commitedLogFile} does not exists`);
      }

      for (let i = 0; i < commitsToMake; i += 1) {
        await appendLogs(content);
        await commitFile(tools, message);
      }

      await push(tools);
    } catch (err) {
      tools.log.error('Oops! Something went wrong');
      return tools.exit.failure(err);
    }
    tools.exit.success('Successfully pushed to remote repository.');
  },
  {
    event: ['schedule', 'workflow_dispatch'],
    secrets: ['GITHUB_TOKEN'],
  }
);
