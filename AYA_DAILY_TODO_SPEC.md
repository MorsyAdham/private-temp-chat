# Aya Daily Todo Popup

## Goal
Add a popup checklist for Aya that Adham controls. Adham creates the list items, Aya can only check or uncheck them, and the same list resets every 24 hours so it becomes a fresh daily routine.

## How It Should Work
1. Adham defines the master list of daily tasks.
2. When Aya logs in, a popup opens with today’s checklist.
3. Aya can mark items as done, but she cannot rename, add, or delete tasks.
4. Every check triggers an encouragement message.
5. At the end of the day, the app calculates progress, score, and reward tier.
6. After 24 hours, the checklist resets back to unchecked using the same master items.

## Roles
- Adham: can create, edit, reorder, add, or remove master tasks.
- Aya: can only toggle `done` on today’s copy of the tasks.

## Recommended UI
- Add a new modal similar to the existing popup pattern in `index.html`.
- Open it from a header button like `todo-btn`.
- Show:
  - title: `Aya's Daily List`
  - current progress: `3 / 7 done`
  - checklist items with checkboxes
  - score and reward preview at the bottom

## Data Shape
Use 2 layers: a master template and a daily progress record.

```json
{
  "template": {
    "id": "aya-daily-default",
    "owner": "adhammorsy2311@gmail.com",
    "targetUser": "ayaessam487@gmail.com",
    "title": "Aya's Daily List",
    "items": [
      { "id": "drink-water", "text": "Drink enough water", "order": 1, "active": true },
      { "id": "take-vitamins", "text": "Take vitamins", "order": 2, "active": true },
      { "id": "study", "text": "Study for 30 minutes", "order": 3, "active": true }
    ]
  }
}
```

```json
{
  "dailyRecord": {
    "dateKey": "2026-03-29",
    "targetUser": "ayaessam487@gmail.com",
    "items": [
      { "itemId": "drink-water", "done": true, "completedAt": "2026-03-29T10:15:00Z" },
      { "itemId": "take-vitamins", "done": false, "completedAt": null },
      { "itemId": "study", "done": true, "completedAt": "2026-03-29T18:30:00Z" }
    ],
    "score": 20,
    "completedCount": 2,
    "totalCount": 3,
    "rewardTier": "good"
  }
}
```

## Reset Logic
- Use a `dateKey` such as `YYYY-MM-DD`.
- When the app opens, compare today’s `dateKey` to the saved record.
- If there is no record for today, create a new one from the template with all items unchecked.
- Do not delete the old day; keep it for history if you want streaks later.

## Encouragement Messages
Send one message every time Aya checks an item. Example messages:

- `Nice job habibti, one more thing done.`
- `Proud of you, keep going.`
- `You are doing well today.`

Best fit for this codebase:
- send a Telegram notice using the existing notification flow
- optionally insert a small system message into chat later

## Score and Reward Rules
- each completed item = `10` points
- full completion bonus = `20` points
- `0-30`: gentle reminder
- `40-60`: nice reward
- `70+`: best reward

Example:
- `2 / 5 done = 20 points`
- `5 / 5 done = 70 points` because of the full bonus

## Suggested Implementation Steps
1. Add the modal markup in `index.html`.
2. Add popup styles in `style.css`.
3. Add `todoTemplate` and `todoToday` state in `app.js`.
4. Store template and daily records in Supabase.
5. Restrict template editing to Adham’s email only.
6. Restrict daily checkbox toggling to Aya’s email only.
7. Trigger encouragement on every new check.
8. Run the summary logic when the day changes or when Aya logs out after midnight.

## Supabase Shape
Recommended tables:

- `daily_todo_templates`
  - `id`
  - `owner_email`
  - `target_email`
  - `title`
  - `items_json`
  - `updated_at`

- `daily_todo_records`
  - `id`
  - `template_id`
  - `target_email`
  - `date_key`
  - `items_json`
  - `score`
  - `completed_count`
  - `total_count`
  - `reward_tier`
  - `created_at`
  - `updated_at`

## Important Rule
Aya must never be able to edit the task text itself from the browser. Only the completion state for today should be writable by her account.
