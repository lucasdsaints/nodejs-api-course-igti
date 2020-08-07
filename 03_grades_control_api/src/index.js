import express from 'express';

import gradesRouter from './routes/grades.js';
import './loggerConfig.js';

const app = express();
app.use(express.json());

app.use('/grades', gradesRouter);

app.listen(3000, () => {
  logger.info('api running on port 3000');
});