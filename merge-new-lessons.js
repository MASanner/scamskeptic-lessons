#!/usr/bin/env node
/**
 * Merges lessons and quiz questions from new-lessons.json into scamskeptic-lessons.json.
 * - Existing lessons and quiz questions are never modified.
 * - New lessons get the next available numeric IDs (max existing + 1, + 2, ...).
 * - New quiz questions get lesson_id set to their new lesson's ID and id set to "{lesson_id}-1", "{lesson_id}-2", etc.
 *
 * Usage: node merge-new-lessons.js
 * Requires: new-lessons.json in the same directory as this script.
 */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const EXISTING_PATH = path.join(DIR, 'scamskeptic-lessons.json');
const NEW_PATH = path.join(DIR, 'new-lessons.json');

function main() {
  if (!fs.existsSync(NEW_PATH)) {
    console.error('Error: new-lessons.json not found. Create it with "lessons" and "quizQuestions" arrays.');
    process.exit(1);
  }

  let existing, newData;
  try {
    existing = JSON.parse(fs.readFileSync(EXISTING_PATH, 'utf8'));
  } catch (e) {
    console.error('Error reading scamskeptic-lessons.json:', e.message);
    process.exit(1);
  }
  try {
    newData = JSON.parse(fs.readFileSync(NEW_PATH, 'utf8'));
  } catch (e) {
    console.error('Error reading new-lessons.json:', e.message);
    process.exit(1);
  }

  const newLessons = Array.isArray(newData.lessons) ? newData.lessons : [];
  const newQuizzes = Array.isArray(newData.quizQuestions) ? newData.quizQuestions : [];

  if (newLessons.length === 0 && newQuizzes.length === 0) {
    console.log('new-lessons.json has no lessons or quizQuestions. Nothing to merge.');
    process.exit(0);
  }

  if (!existing.lessons) existing.lessons = [];
  if (!existing.quizQuestions) existing.quizQuestions = [];

  // Next lesson ID = max(existing numeric lesson ids) + 1
  const existingNumericIds = existing.lessons
    .map((l) => parseInt(l.id, 10))
    .filter((n) => !isNaN(n));
  let nextLessonId = existingNumericIds.length ? Math.max(...existingNumericIds) + 1 : 1;

  // Map: new file's lesson id (e.g. "1", "2") -> new id string (e.g. "43", "44")
  const lessonIdMap = {};
  newLessons.forEach((lesson, index) => {
    const newId = String(nextLessonId + index);
    lessonIdMap[String(lesson.id)] = newId;
  });

  // Add new lessons with updated ids (clone so we don't mutate the read object)
  const addedLessonIds = [];
  newLessons.forEach((lesson, index) => {
    const newId = String(nextLessonId + index);
    const clone = { ...lesson, id: newId };
    existing.lessons.push(clone);
    addedLessonIds.push(newId);
  });

  // Per-lesson quiz count for assigning id "lesson_id-1", "lesson_id-2", ...
  const quizCountByLesson = {};

  newQuizzes.forEach((quiz) => {
    const mappedLessonId = lessonIdMap[String(quiz.lesson_id)];
    if (mappedLessonId == null) {
      console.warn(
        `Warning: Quiz "${quiz.id}" has lesson_id "${quiz.lesson_id}" which is not in new-lessons.lessons. Skipping this quiz.`
      );
      return;
    }
    const n = (quizCountByLesson[mappedLessonId] = (quizCountByLesson[mappedLessonId] || 0) + 1);
    const newQuizId = `${mappedLessonId}-${n}`;
    const clone = {
      ...quiz,
      lesson_id: mappedLessonId,
      id: newQuizId,
    };
    existing.quizQuestions.push(clone);
  });

  try {
    fs.writeFileSync(EXISTING_PATH, JSON.stringify(existing, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing scamskeptic-lessons.json:', e.message);
    process.exit(1);
  }

  console.log(`Merged ${newLessons.length} lesson(s) and ${newQuizzes.length} quiz question(s).`);
  if (newLessons.length) {
    console.log(`New lesson IDs: ${addedLessonIds.join(', ')}`);
  }
}

main();
