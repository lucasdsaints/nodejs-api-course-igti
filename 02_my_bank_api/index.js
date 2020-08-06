import express from 'express';
import { promises as fs } from 'fs';
import cors from 'cors';

import accountsRouter from './routes/accounts.js';
import logger from './loggerConfig.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/accounts', accountsRouter);

app.listen(3000, initApp);

async function initApp() {
  const createAccountsJson = async () => {
    const initialJson = {
      nextId: 1,
      accounts: []
    };

    try {
      await fs.writeFile('data/accounts.json', JSON.stringify(initialJson, null, 2));
      logger.info('Account data file created!');
    } catch(err) {
      logger.error(err.message);
      return;
    }
  }

  try {
    await fs.readFile('data/accounts.json');
  } catch (err) {
    await createAccountsJson();
  }

  logger.info('API Running on port 3000');
}