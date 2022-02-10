const { appendDataToFile } = require("../appendfiles");
const { commitedLogFile } = require("../index");
const { localPath, logFile } = require("../index");
const { env } = require("../index");
const { env, gitRepo, localPath } = require("../index");
const { localPath } = require("../index");
const { GITHUB_EMAIL, GITHUB_NAME } = require("../index");


async function setGitUser(tools) {
  await tools.exec('git', ['config', '--global', 'user.email', GITHUB_EMAIL]);
  await tools.exec('git', ['config', '--global', 'user.name', GITHUB_NAME]);
}
exports.setGitUser = setGitUser;

async function push(tools) {
  await tools.exec('git', ['-C', localPath, 'push']);
}
exports.push = push;

async function gitClone(tools) {
  await tools.exec('git', [
    'clone',
    '--single-branch',
    '-b',
    env.GIT_BRANCH,
    gitRepo,
    localPath,
  ]);
}
exports.gitClone = gitClone;

function getCommitMessage() {
  return `${env.GITHUB_COMMIT_MESSAGE} - ${new Date().toISOString()}`;
}
exports.getCommitMessage = getCommitMessage;

async function commitFile(tools, message) {
  await tools.exec('git', ['-C', localPath, 'add', logFile]);
  await tools.exec('git', ['-C', localPath, 'commit', '-m', message]);
}
exports.commitFile = commitFile;

async function appendLogs(content) {
  content += '\n<br>\n';
  await appendDataToFile(commitedLogFile, content);
}
exports.appendLogs = appendLogs;
