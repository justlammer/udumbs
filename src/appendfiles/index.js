const fs = require('fs');

async function appendDataToFile(path, data) {
  await fs.promises.appendFile(path, data);
  const buff = await fs.promises.readFile(path);

  const content = buff.toString();
  console.log(`Content : ${content}`);
}

exports.appendDataToFile = appendDataToFile;
