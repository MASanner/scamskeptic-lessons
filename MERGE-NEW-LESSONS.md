# Merging New Lessons from new-lessons.json

This process adds lessons and quiz questions from **new-lessons.json** into **scamskeptic-lessons.json** without changing any existing content.

## Usage

1. Create **new-lessons.json** in this directory (copy from **new-lessons.example.json** if you like) and add your new lessons and quiz questions (see format below).
2. Run:
   ```bash
   node merge-new-lessons.js
   ```
3. The script will:
   - Assign new lesson IDs as the next available numbers (e.g. if the existing max is 42, new lessons get 43, 44, …).
   - Rewrite quiz `lesson_id` and `id` so they match the new lesson IDs (e.g. `43-1`, `43-2`, `44-1`).
   - Append everything to scamskeptic-lessons.json and save.

**Existing lessons and quiz questions are never modified.**

## new-lessons.json format

Same structure as the main file, but only the keys you need:

```json
{
  "lessons": [
    {
      "id": "1",
      "title": "Your Lesson Title",
      "summary": "Short summary",
      "body": "Full description.",
      "category": "phone",
      "icon": "📄",
      "scammer_says": "...",
      "the_trick": "...",
      "consequences": "...",
      "danger_signs": ["Sign 1", "Sign 2"],
      "safe_action": "..."
    }
  ],
  "quizQuestions": [
    {
      "id": "1-1",
      "lesson_id": "1",
      "question_type": "indicator",
      "question": "Question text?",
      "correct_answer": "option_id_from_below",
      "options": [
        { "id": "option_a", "text": "Option A", "icon": "🚫" },
        { "id": "option_b", "text": "Option B", "icon": "✅" }
      ],
      "explanation": "Why the correct answer is right."
    }
  ]
}
```

- **lessons[].id** and **quizQuestions[].lesson_id** in new-lessons.json can be simple (e.g. `"1"`, `"2"`). The script maps them to the new IDs when merging.
- **quizQuestions[].id** in new-lessons.json is ignored; the script assigns `{newLessonId}-1`, `{newLessonId}-2`, etc.

## Example: one new lesson with two quizzes

- new-lessons.json has 1 lesson with `"id": "1"` and 2 quiz questions with `"lesson_id": "1"`.
- Existing file has max lesson id 42.
- After merge: one new lesson with id **43**; two new quiz questions with ids **43-1** and **43-2** and `lesson_id` **43**.
