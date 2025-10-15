# Contributing to Meeting Summarizer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### 1. Fork the Repository
Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/meeting-summarizer.git
cd meeting-summarizer
```

### 3. Set Up Development Environment
Follow the instructions in [QUICKSTART.md](QUICKSTART.md)

### 4. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📝 Development Guidelines

### Code Style

#### Python (Backend)
- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings to functions and classes
- Use meaningful variable names

**Format code with Black:**
```bash
cd backend
black .
```

#### TypeScript/React (Frontend)
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused

**Lint code:**
```bash
cd frontend
npm run lint
```

### Commit Messages

Follow the conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(frontend): add export to Excel feature
fix(backend): handle empty transcription response
docs(readme): update installation instructions
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python test_json_parsing.py
```

### Frontend Tests
```bash
cd frontend
npm run test  # if tests exist
```

## 📦 Pull Request Process

### 1. Update Your Branch
```bash
git fetch origin
git rebase origin/main
```

### 2. Test Your Changes
- Ensure all existing features work
- Test your new feature/fix thoroughly
- Check for console errors

### 3. Push Your Changes
```bash
git push origin feature/your-feature-name
```

### 4. Create Pull Request
- Go to the original repository
- Click "New Pull Request"
- Select your branch
- Fill in the PR template

### 5. PR Requirements
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tested on local environment

## 🐛 Reporting Bugs

### Before Submitting
1. Check existing issues
2. Try latest version
3. Check troubleshooting guide

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Python version: [e.g., 3.9]
- Node version: [e.g., 18.0]

**Additional context**
Any other relevant information.
```

## 💡 Suggesting Features

### Feature Request Template
```markdown
**Is your feature related to a problem?**
A clear description of the problem.

**Describe the solution**
What you want to happen.

**Describe alternatives**
Other solutions you've considered.

**Additional context**
Any other relevant information, mockups, etc.
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Add unit tests for backend
- [ ] Add integration tests
- [ ] Improve error messages
- [ ] Add loading indicators
- [ ] Performance optimizations

### Features
- [ ] Real-time transcription
- [ ] Multiple language support
- [ ] Speaker identification
- [ ] Meeting templates
- [ ] Calendar integration
- [ ] Email summaries

### Documentation
- [ ] API documentation
- [ ] Code comments
- [ ] Tutorial videos
- [ ] Use case examples

### Bug Fixes
Check the [Issues](https://github.com/YOUR_USERNAME/meeting-summarizer/issues) page for known bugs.

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [AssemblyAI API](https://www.assemblyai.com/docs/)
- [Google Gemini API](https://ai.google.dev/docs)

## ❓ Questions?

- Open a [Discussion](https://github.com/YOUR_USERNAME/meeting-summarizer/discussions)
- Check existing [Issues](https://github.com/YOUR_USERNAME/meeting-summarizer/issues)
- Review [Documentation](README.md)

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

## 🙏 Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute! 🎉
