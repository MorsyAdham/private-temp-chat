# Aya Daily Todo Popup

## Goal
Add a popup checklist for Aya that Adham controls. Adham creates the list items, Aya can only check or uncheck them, and the same list resets every 24 hours so it becomes a fresh daily routine.

## Daily Checklist Content
Use this exact default list for Aya's daily popup:

1. Put your medicine in your bag
2. Eat a good breakfast
3. Take your morning medicine
4. Enjoy your coffee
5. Have lunch
6. Finish your work
7. Head home safely
8. Order your food
9. Get a big bottle of water
10. Go into your room
11. Lock the door securely
12. Drink some water
13. Eat your meal
14. Take your evening medicine
15. Double-check the door is locked
16. Get some rest and go to sleep

Popup heading:
- `🌸 Daily Checklist`

Encouragement message after each completed task:
- `Good job baby 💕 Im so proud of you, keep going youre doing amazing 💕`

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
- Place a new header button beside Search and Reload, for example `todo-btn`, using the same circular icon-button style.
- Show:
  - title: `💕 Aya's Daily List 💕`
  - current progress: `3 / 7 done`
  - checklist items with checkboxes
  - score and reward preview at the bottom
  - a soft empty-state or celebration note when everything is done

## Popup Look
The popup should feel cute, warm, and romantic rather than corporate.

- Use the same dark app base so it fits the current chat UI.
- Add a soft pink-green accent mix so it still belongs to the WhatsApp-like palette.
- Put `💕` in the title and in small decorative accents, but do not overcrowd the popup.
- Use rounded corners, soft shadows, and pill-shaped progress badges.
- Make checked items feel rewarding with a glow, subtle scale animation, or heart accent.
- Show the score inside a cute badge such as `💕 40 points`.
- Show the reward tier in a friendly card, for example `Today's reward: Sweet treat 💕`.

Suggested text layout:

```text
💕 Aya's Daily List 💕
3 / 7 done today
[ ] Drink enough water
[x] Take vitamins
[ ] Study for 30 minutes

💕 Score: 20
Reward: Cozy praise message
```

Suggested visual details:

- title row with a heart icon and soft gradient underline
- checklist cards instead of plain rows
- completed items tinted with a sweeter accent color
- footer area with score, reward, and a short motivational line

## Data Shape
Use 2 layers: a master template and a daily progress record.

```json
{
  "template": {
    "id": "aya-daily-default",
    "owner": "adhammorsy2311@gmail.com",
    "targetUser": "ayaessam487@gmail.com",
    "title": "🌸 Daily Checklist",
    "items": [
      { "id": "put-medicine-in-bag", "text": "Put your medicine in your bag", "order": 1, "active": true },
      { "id": "eat-breakfast", "text": "Eat a good breakfast", "order": 2, "active": true },
      { "id": "take-morning-medicine", "text": "Take your morning medicine", "order": 3, "active": true },
      { "id": "enjoy-coffee", "text": "Enjoy your coffee", "order": 4, "active": true },
      { "id": "have-lunch", "text": "Have lunch", "order": 5, "active": true },
      { "id": "finish-work", "text": "Finish your work", "order": 6, "active": true },
      { "id": "head-home-safely", "text": "Head home safely", "order": 7, "active": true },
      { "id": "order-food", "text": "Order your food", "order": 8, "active": true },
      { "id": "get-big-bottle-of-water", "text": "Get a big bottle of water", "order": 9, "active": true },
      { "id": "go-into-room", "text": "Go into your room", "order": 10, "active": true },
      { "id": "lock-door-securely", "text": "Lock the door securely", "order": 11, "active": true },
      { "id": "drink-some-water", "text": "Drink some water", "order": 12, "active": true },
      { "id": "eat-meal", "text": "Eat your meal", "order": 13, "active": true },
      { "id": "take-evening-medicine", "text": "Take your evening medicine", "order": 14, "active": true },
      { "id": "double-check-door-locked", "text": "Double-check the door is locked", "order": 15, "active": true },
      { "id": "rest-and-sleep", "text": "Get some rest and go to sleep", "order": 16, "active": true }
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

## Current Implementation
The current app version stores Aya's daily progress in browser `localStorage` under a single daily record key. That means:

- the checklist resets by local browser date
- Aya can only toggle items through the UI
- task text is fixed in `app.js`
- progress is device/browser-specific for now

If you want progress to sync across devices later, move the daily record into Supabase.

## Encouragement Messages
Send this exact message every time Aya checks an item:

- `Good job baby 💕 Im so proud of you, keep going youre doing amazing 💕`

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

## End-of-Day Messages
Use a sweeter summary message based on completion level.

- `0% to 25%`: `💕 It's okay habibti, tomorrow is a fresh new day.`
- `26% to 50%`: `💕 Nice start my love, let's do even better tomorrow.`
- `51% to 75%`: `💕 You did really well today and I'm proud of you.`
- `76% to 99%`: `💕 Almost perfect, superstar. That was such a lovely effort.`
- `100%`: `💕 Full score! My smart girl earned the best reward today.`

## Suggested Implementation Steps
1. Add the modal markup in `index.html`.
2. Add popup styles in `style.css`.
3. Add `todoTemplate` and `todoToday` state in `app.js`.
4. Store template and daily records in Supabase.
5. Restrict template editing to Adham’s email only.
6. Restrict daily checkbox toggling to Aya’s email only.
7. Trigger encouragement on every new check.
8. Run the summary logic when the day changes or when Aya logs out after midnight.

## Supabase Upgrade Path
If you want to upgrade the current local version to a synced backend version later, use tables like:

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
