# Adding Custom Projects

Drop your non-GitHub projects here by editing `projects.json`.

Each project is an object in the JSON array. All fields except `title`, `description`, and `category` are optional.

```json
[
  {
    "title":       "Project display name",
    "description": "What it does, what problem it solves.",
    "category":    "ai | devops | web | custom",
    "tags":        ["Tag1", "Tag2", "Tag3"],
    "award":       "🏆 2nd Place — Competition Name",
    "github":      "https://github.com/you/repo",
    "live":        "https://your-live-url.com"
  }
]
```

## Hiding a GitHub repo

Open `app.js` and add the repo name to `HIDDEN_REPOS`:

```js
const HIDDEN_REPOS = [
  'MohamedYassineAbid',          // always hidden
  'some-private-experiment',     // ← add any repo name here
];
```

The repo stays on GitHub — it just won't appear on the portfolio page.
