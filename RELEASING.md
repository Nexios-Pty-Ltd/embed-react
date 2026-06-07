# Releasing @Nexios-Pty-Ltd/embed-react

The package source lives in this monorepo. Releases are published as
git-installable artifacts to the standalone
[`Nexios-Pty-Ltd/embed-react`](https://github.com/Nexios-Pty-Ltd/embed-react)
GitHub repo. There is no npm registry release.

## One-time setup

1. **Create the standalone repo** on GitHub:
   - Owner: `scheduleme` (or whichever org/user)
   - Name: `embed-react`
   - Visibility: **Public** (so consumers can install without a token)
   - Don't initialise with README/license/.gitignore — the release
     script pushes a complete tree on first run

2. **(Optional) Use a different remote.** Set `EMBED_REACT_REMOTE` in
   your shell to override the default
   `https://github.com/Nexios-Pty-Ltd/embed-react.git`:

   ```bash
   export EMBED_REACT_REMOTE=git@github.com:your-org/embed-react.git
   ```

   SSH is recommended for human-run releases; HTTPS-with-PAT for CI.

## Cutting a release

```bash
cd packages/embed-react

# 1. Bump the version
npm version patch    # or minor / major

# 2. Commit the bump in the monorepo
git add package.json
git commit -m "Release embed-react v$(node -p 'require(\"./package.json\").version')"

# 3. Push to the monorepo so the bump is recorded
git push

# 4. Build + publish to the standalone repo
npm run release:github
```

The script:

1. Runs `npm run build` (cleans `dist/` then `tsc`).
2. `rsync`s the publishable tree (excluding `node_modules`, `scripts/`,
   tsbuildinfo, `.DS_Store`) into a fresh temp dir.
3. Initialises a brand-new git repo there and force-pushes `main` to
   the standalone repo.
4. Tags `vX.Y.Z` and pushes the tag.

`main` is force-pushed every release because consumers should not see
partial history — tags are the durable record they install from.

## Consumers install with

```bash
npm install github:Nexios-Pty-Ltd/embed-react#v0.1.0
```

The tag is the version pin. Once pushed, a tag is immutable, so
existing installs keep working forever — only `main` rewrites.

## Pre-flight check before each release

- `npm run build` passes locally.
- `package.json` `version` matches the changelog (if you keep one).
- README is current — install instructions, API table, event payload
  shapes.
- LICENSE year is current.

## Failure modes

- **Tag already exists.** `git push origin vX.Y.Z` refuses. Bump the
  version and try again — never overwrite a published tag.
- **rsync not installed.** macOS + Linux both ship it by default;
  install via Homebrew or apt if missing.
- **Auth failure.** Check `EMBED_REACT_REMOTE` — SSH needs a working
  agent + the deploy key registered on the standalone repo; HTTPS
  needs a PAT with `repo` scope. CI uses
  `https://x-access-token:$PAT@github.com/...`.

## CI release (optional)

To release automatically from CI when a tag is pushed in the monorepo,
see the example workflow in `EMBED.md` — Step 7 of the GitHub
distribution guide. You'd:

1. Create a fine-scoped PAT (write access to the standalone repo only).
2. Store it as `EMBED_REACT_DEPLOY_PAT` in the monorepo's secrets.
3. Tag the monorepo as `embed-react-v0.1.0` to trigger the workflow.
