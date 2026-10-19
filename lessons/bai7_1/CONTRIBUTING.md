# Contributing

Use Node 24 and npm 11, then run `npm ci`.
Changes should work when this directory is copied into a standalone repository.

1. Add focused tests for changed contract or deployment behavior.
2. Run `npm run format`, `npm run check` and `npm run smoke`.
3. For contract changes, also run `npm run test:gas` and `npm run coverage`.
4. Keep English and Vietnamese documentation consistent.
5. Submit a pull request describing the behavior, motivation and validation.

Do not include private keys, .env files, generated artifacts or local deployment journals.
Preserve public deployment journals when updating existing deployed systems.
Keep dependency versions exact and update package-lock.json with package.json.
Review contract/compiler changes rather than automatically merging dependency updates.
Contributions are licensed under the project's MIT License.
