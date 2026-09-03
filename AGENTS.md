# Instructions for coding agents

- Never create a Git commit unless the operator explicitly asks for a commit in the current conversation. Completing a task, editing files, or asking to “save” changes is not permission to commit.
- When explicitly asked to commit, always create the commit as:
  - Name: `PolarNickBot`
  - Email: `polarnick@proton.me`
- Set both the commit author and committer to this identity. Prefer command-scoped configuration so the repository or global Git configuration is not modified:

  ```sh
  GIT_AUTHOR_NAME='PolarNickBot' \
  GIT_AUTHOR_EMAIL='polarnick@proton.me' \
  GIT_COMMITTER_NAME='PolarNickBot' \
  GIT_COMMITTER_EMAIL='polarnick@proton.me' \
  git commit ...
  ```
