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
    "award":       "2nd place, Competition Name",
    "github":      "https://github.com/you/repo",
    "live":        "https://your-live-url.com"
  }
]
```

## What appears on the site

Only the projects listed in `projects.json` are shown, in the order they appear in the file.
GitHub repositories are no longer pulled in automatically; to feature one, add it here with its `github` link.
