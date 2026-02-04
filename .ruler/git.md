# Git Commit Conventions

## Conventional Commits (MANDATORY)

**You MUST use Conventional Commits format.** This is not optional.

### Format

```
<type>: <subject>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring (no behavior change)
- `chore:` - Build/tooling changes
- `docs:` - Documentation only
- `test:` - Adding or fixing tests
- `style:` - Code formatting (no logic change)

### Examples

```bash
feat: add user profile page
fix: resolve authentication redirect loop
refactor: simplify user validation logic
chore: update dependencies
docs: add API documentation
test: add tests for auth flow
```

---

## Atomic Commits

Each commit must represent **ONE logical change**. Do not mix unrelated changes.

```bash
# ✅ Correct
git commit -m "feat: add user registration form"
git commit -m "feat: add user registration API endpoint"
git commit -m "test: add tests for user registration"

# ❌ Incorrect
git commit -m "add registration, fix header bug, update deps"
```

---

## Clear, Descriptive Messages

Explain what changed and why:

```bash
feat: add email verification for new users

- Send verification email on signup
- Add email verification route
- Update user schema with emailVerified field
```
