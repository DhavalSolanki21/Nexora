## Pull Request Description

Provide a clear description of the modifications made, their purpose, and how they solve the problem.

## Related Issue

Link any corresponding issues that are resolved or addressed by this Pull Request (e.g. "Closes #12").

## Type of Change

Select all options that apply:
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Code refactoring (non-breaking improvement to file structures)
- [ ] Documentation update (only modifications to markdown files)
- [ ] Test addition (adding new unit tests or improving coverage)

## Verification and Testing

### Automated Tests
Describe tests run to verify the changes (e.g., test suite commands):

```bash
# Verify backend unit tests
pytest -v

# Verify frontend TypeScript compilation and builds
npm run build
```

### Manual Verification
Describe any manual steps taken to verify the changes:
- Uploaded sample dataset 'customer_churn.csv' and verified the profile outputs.
- Tested the newly added API endpoint with direct curl calls.

## Pull Request Checklist

Before submitting this Pull Request, please confirm the following:
- [ ] My code follows the code style guidelines of this project.
- [ ] I have executed the formatting and linting checks locally (`make lint` / `make format`).
- [ ] I have added appropriate unit tests for my changes.
- [ ] All new and existing tests pass successfully.
- [ ] I have updated the documentation (including docstrings and README.md if needed).
- [ ] My commits use the Conventional Commit message specification.
