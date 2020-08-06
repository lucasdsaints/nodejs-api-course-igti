import express from 'express';
import { promises as fs } from 'fs';

import logger from './../loggerConfig.js';

const router = express.Router();
const filePath = './data/accounts.json';

router.post('/', async (req, res, next) => {
  try {
    let account = req.body;

    if (!account.name || account.balance === undefined) {
      throw new Error('Os items `name` e `balance` são obrigatórios');
    }

    const data = JSON.parse(await fs.readFile(filePath));

    const newAccount = { 
      id: data.nextId++,
      name: account.name,
      balance: account.balance
    };
    data.accounts.push(newAccount);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    res.send(newAccount);
    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const data = JSON.parse(await fs.readFile(filePath));
    delete data.nextId;
    res.send(data);
    logger.info(`GET /account`);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async(req, res, next) => {
  try {
    const accountId = Number(req.params.id);
    const data = JSON.parse(await fs.readFile(filePath));
    const account = data.accounts.find(acc => acc.id === accountId);
    res.send(account);
    logger.info(`GET /account/${accountId}`);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async(req, res, next) => {
  try {
    const accountId = Number(req.params.id);
    const data = JSON.parse(await fs.readFile(filePath));
    data.accounts = data.accounts.filter(acc => acc.id !== accountId);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    res.end();

    logger.info(`DELETE /account/${accountId}`);
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const account = req.body;

    if (!account.name || account.balance === undefined) {
      throw new Error('Os items `name` e `balance` são obrigatórios');
    }

    const data = JSON.parse(await fs.readFile(filePath));
    const index = data.accounts.findIndex(a => a.id === account.id);

    if (index === -1) {
      throw new Error('Registro não encontrado');
    } 

    data.accounts[index].name = account.name;
    data.accounts[index].balance = account.balance;

    await fs.writeFile(filePath, JSON.stringify(data));

    res.send(data.accounts[index]);

    logger.info(`PUT /account - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

router.patch('/updateBalance', async (req, res, next) => {
  try {
    const account = req.body;

    if (account.id === undefined || account.balance === undefined) {
      throw new Error('Os items `id` e `balance` são obrigatórios');
    }

    const data = JSON.parse(await fs.readFile(filePath));
    const index = data.accounts.findIndex(a => a.id === account.id);

    if (index === -1) {
      throw new Error('Registro não encontrado');
    } 

    data.accounts[index].balance = account.balance;

    await fs.writeFile(filePath, JSON.stringify(data));

    res.send(data.accounts[index]);

    logger.info(`PATCH /updateBalance - ${JSON.stringify(data.accounts[index])}`);

  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(500);
  res.send({
    message: err.message
  });
});

export default router;