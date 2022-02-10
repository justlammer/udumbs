const { msgRefference } = require("./index");

function getContentFile() {
  return `Commits: ${new Date().toISOString()} - ${msgRefference}`;
}
exports.getContentFile = getContentFile;
