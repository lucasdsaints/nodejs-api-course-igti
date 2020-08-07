import { promises as fs } from 'fs';

async function getFromFile(filePath) {
  try {
    const data = await fs.readFile(filePath);
    return JSON.parse(data);
  } catch(err) {
    logger.error(`Trying to read file ${filePath} - ${err.message}`);
    return null;
  }
}

async function putOnFile(filePath, data) {
  let success = false;
  try {
    const parsedData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, parsedData);
    success = true;
  } catch(err) {
    logger.error(`Trying to write file ${filePath} - ${err.message}`);
  }
  return success;
}

export { getFromFile, putOnFile };