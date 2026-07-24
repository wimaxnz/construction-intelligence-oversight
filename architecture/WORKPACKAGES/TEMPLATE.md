# Work package template

Copy into `NEXT_WORKPACKAGE.md` (active) or `WORKPACKAGES/<id>.md` (completed).

```markdown
# <PACKAGE_ID> — <Title>

**Status:** approved | in_progress | completed
**Governing reference:** architecture/CCC_ARCHITECTURE.md

## Objective
## Business value
## Scope
## Architecture
## Database
## API
## UI
## Knowledge Graph integration
## Digital Brain integration
## Security
## Dependencies
## Risks
## Acceptance criteria
## Validation
## Evidence required
```

Required machine fields in `ARCHITECTURE_STATE.json`:

- `nextWorkPackage.id`
- `nextWorkPackage.title`
- `nextWorkPackage.status`
- `nextWorkPackage.conflictsWithActiveEngineering` (must be boolean; publish blocked if `true` while `activeWork.engineeringAutonomousQueue` is not accommodating)
