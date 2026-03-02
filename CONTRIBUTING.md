# Contributing to NeuroLearn

Thank you for your interest in contributing to NeuroLearn! We welcome contributions from everyone and are committed to building an inclusive, accessible, and neurodiversity-affirming project.

---

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

1. **Be respectful** — Treat all contributors with kindness and respect.
2. **Be inclusive** — Welcome people of all backgrounds, identities, and abilities.
3. **Be constructive** — Offer helpful feedback and focus on the work, not the person.
4. **Be patient** — People contribute at different paces; please be understanding.

Harassment, discrimination, or exclusionary language of any kind is not tolerated.

---

## Neurodiversity and Accessibility Guidelines

NeuroLearn is built *for* neurodivergent learners. All contributions must:

- ✅ Follow **WCAG 2.1 AA** accessibility standards
- ✅ Include proper **ARIA labels** and semantic HTML
- ✅ Ensure **keyboard navigability** for all interactive elements
- ✅ Support **high-contrast** and **reduced-motion** media preferences
- ✅ Use plain, clear language in UI copy — avoid jargon
- ✅ Never use flashing/strobing effects without a warning

When in doubt, test with a screen reader (e.g., NVDA, VoiceOver) and keyboard-only navigation.

---

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/SAHearn1/neurolearn/issues) to avoid duplicates
2. Open a new issue with the **Bug Report** template
3. Include clear reproduction steps and expected vs. actual behaviour

### Suggesting Features

1. Open a new issue with the **Feature Request** template
2. Describe the problem it solves and who benefits
3. Note any accessibility considerations

### Submitting Code

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following the code conventions in [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

3. **Write or update tests** for your changes

4. **Lint and test** before committing:
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   ```

5. **Commit** with a meaningful message:
   ```
   feat: add audio lesson playback controls
   fix: correct focus ring colour in dark mode
   docs: update setup guide with Supabase CLI steps
   ```

6. **Open a Pull Request** against the `main` branch with a clear description

---

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|--------|------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructure, no feature/fix |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, config, dependencies |
| `a11y:` | Accessibility improvement |

---

## Pull Request Checklist

Before marking your PR ready for review, confirm:

- [ ] Code follows project conventions
- [ ] New components have accessible markup (ARIA, semantic HTML)
- [ ] Tests cover the new or changed functionality
- [ ] `npm run lint` passes with no errors
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run test` passes
- [ ] Documentation updated if needed

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
