import express from 'express';

import { getFromFile, putOnFile } from '../helpers/fileHandler.js';
import extractFromBody from '../helpers/validations.js';

const router = express.Router();
const filePath = './database/grades.json';

router.post('/', async (req, res, next) => {
  logger.info(`POST ${req.originalUrl} - Request received`);

  const student = extractFromBody(req.body, 'student', 'string');
  const subject = extractFromBody(req.body, 'subject', 'string');
  const type = extractFromBody(req.body, 'type', 'string');
  const value = extractFromBody(req.body, 'value', 'number');

  if (student === null || subject === null || type === null || value === null) {
    res.status(400);
    next(new Error('Invalid payload'));
    return;
  }

  const gradesData = await getFromFile(filePath);
  if (!gradesData) {
    res.status(500);
    next(new Error('An error occurred while trying to access the resource'));
    return;
  }
  
  const newGrade = {
    id: gradesData.nextId++,
    student,
    subject,
    type,
    value,
    timestamp: new Date()
  };

  gradesData.grades.push(newGrade);

  const success = putOnFile(filePath, gradesData);
  if (!success) {
    res.status(500);
    next(new Error('An error occurred while trying to access the resource'));
    return;
  }

  logger.info(`POST ${req.originalUrl} - Success`);
  res.send(newGrade);
});

router.post('/top3', async (req, res, next) => {
  logger.info(`POST ${req.originalUrl} - Request received`);

  const subject = extractFromBody(req.body, 'subject', 'string');
  const type = extractFromBody(req.body, 'type', 'string');

  if (subject === null || type === null) {
    res.status(400);
    next(new Error('Invalid payload'));
    return;
  }

  const gradesData = await getFromFile(filePath);
  if (!gradesData) {
    res.status(500);
    next(new Error('An error occurred while trying to access the resource'));
    return;
  }

  const subjectGrades = gradesData.grades.filter(grade => grade.subject === subject);
  const subjectGradesOfType = subjectGrades.filter(grade => grade.type === type);

  const orderedGrades = subjectGradesOfType.sort((a, b) => b.value - a.value);
  const top3Grades = orderedGrades.slice(0, 3);

  logger.info(`POST ${req.originalUrl} - Success`);
  res.send({
    "top-3-grades": top3Grades
  });
});

router.post('/average', async (req, res, next) => {
  logger.info(`POST ${req.originalUrl} - Request received`);

  const subject = extractFromBody(req.body, 'subject', 'string');
  const type = extractFromBody(req.body, 'type', 'string');

  if (subject === null || type === null) {
    res.status(400);
    next(new Error('Invalid payload'));
    return;
  }

  const gradesData = await getFromFile(filePath);
  if (!gradesData) {
    res.status(500);
    next(new Error('An error occurred while trying to access the resource'));
    return;
  }

  const subjectGrades = gradesData.grades.filter(grade => grade.subject === subject);
  const subjectGradesOfType = subjectGrades.filter(grade => grade.type === type);

  if (subjectGradesOfType.length === 0) {
    res.status(404);
    next(new Error('There are no grades for this parameters'));
    return;
  }

  const sumGrades = subjectGradesOfType.reduce((total, grade) => total + grade.value, 0);
  const averageGrade = sumGrades / subjectGradesOfType.length;

  logger.info(`POST ${req.originalUrl} - Success`);
  res.send({
    "average-grade": averageGrade
  });
});

router.post('/student', async (req, res, next) => {
  logger.info(`POST ${req.originalUrl} - Request received`);

  const student = extractFromBody(req.body, 'student', 'string');
  const subject = extractFromBody(req.body, 'subject', 'string');

  if (student === null || subject === null) {
    res.status(400);
    next(new Error('Invalid payload'));
    return;
  }

  const gradesData = await getFromFile(filePath);
  if (!gradesData) {
    res.status(500);
    next(new Error('An error occurred while trying to access the resource'));
    return;
  }

  const studentGrades = gradesData.grades.filter(grade => grade.student === student);
  const sbjStudentGrades = studentGrades.filter(grade => grade.subject === subject);

  const sumGrades = sbjStudentGrades.reduce((total, grade) => total + grade.value, 0);

  logger.info(`POST ${req.originalUrl} - Success`);
  res.send({
    "total-grade": sumGrades
  });
});

router.put('/:id', async (req, res, next) => {
  logger.info(`PUT ${req.originalUrl} - Request received`);
  const gradeId = Number(req.params.id);
  if (!gradeId) {
    res.status(400);
    next(new Error('Invalid id'));
    return;
  }

  const student = extractFromBody(req.body, 'student', 'string');
  const subject = extractFromBody(req.body, 'subject', 'string');
  const type = extractFromBody(req.body, 'type', 'string');
  const value = extractFromBody(req.body, 'value', 'number');

  if (student === null || subject === null || type === null || value === null) {
    res.status(400);
    next(new Error('Invalid payload'));
    return;
  }

  const gradesData = await getFromFile(filePath);
  if (!gradesData) {
    res.status(500);
    next(new Error('An error occurred while trying to access the resource'));
    return;
  }

  const resourceIndex = gradesData.grades.findIndex(grade => grade.id === gradeId);
  if (resourceIndex === -1) {
    res.status(404);
    next(new Error(`The resource of id ${gradeId} does not exist`));
    return;
  }

  const newGrade = {
    id: gradeId,
    student,
    subject,
    type,
    value,
    timestamp: new Date()
  };

  gradesData.grades[resourceIndex] = newGrade;

  const success = putOnFile(filePath, gradesData);
  if (!success) {
    res.status(500);
    next(new Error('An error occurred while trying to access the resource'));
    return;
  }

  logger.info(`PUT ${req.originalUrl} - Success`);
  res.send(newGrade);
});

router.delete('/:id', async (req, res, next) => {
  logger.info(`DELETE ${req.originalUrl} - Request received`);

  const gradeId = Number(req.params.id);
  if (!gradeId) {
    res.status(400);
    next(new Error('Invalid id'));
    return;
  }

  const gradesData = await getFromFile(filePath);
  if (!gradesData) {
    res.status(500);
    next(new Error('An error occurred while trying to access the resource'));
    return;
  }

  const previousLength = gradesData.grades.length;
  gradesData.grades = gradesData.grades.filter(grade => grade.id !== gradeId);
  if (gradesData.grades.length === previousLength) {
    res.status(404);
    next(new Error(`The resource of id ${gradeId} does not exist`));
    return;
  }

  const success = putOnFile(filePath, gradesData);
  if (!success) {
    res.status(500);
    next(new Error('An error occurred while trying to access the resource'));
    return;
  }

  logger.info(`DELETE ${req.originalUrl} - Success`);
  res.send({
    message: 'Grade deleted successfully'
  });
});

router.get('/:id', async (req, res, next) => {
  logger.info(`GET ${req.originalUrl} - Request received`);

  const gradeId = Number(req.params.id);
  if (!gradeId) {
    res.status(400);
    next(new Error('Invalid id'));
    return;
  }

  const gradesData = await getFromFile(filePath);
  if (!gradesData) {
    res.status(500);
    next(new Error('An error occurred while trying to access the resource'));
    return;
  }

  const resourceIndex = gradesData.grades.findIndex(grade => grade.id === gradeId);
  if (resourceIndex === -1) {
    res.status(404);
    next(new Error(`The resource of id ${gradeId} does not exist`));
    return;
  }

  logger.info(`GET ${req.originalUrl} - Success`);
  res.send(gradesData.grades[resourceIndex]);
});

// log handler
router.use((error, req, res, _next) => {
  const message = `${req.method} ${req.originalUrl} - ${error.message}`;
  if (res.statusCode === 500) {
    logger.error(message);
  } else {
    logger.info(message);
  }

  res.send({
    message: error.message
  });
});

export default router;