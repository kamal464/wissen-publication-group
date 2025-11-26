- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [ ] Clarify Project Requirements
- [ ] Scaffold the Project
- [ ] Customize the Project
- [ ] Install Required Extensions
- [ ] Compile the Project
- [ ] Create and Run Task
- [ ] Launch the Project
- [ ] Ensure Documentation is Complete

---

# Universal Publishers Full Stack App

This project contains:
- `frontend`: Next.js app
- `backend`: NestJS app with PostgreSQL

## End-to-End Dummy Flow
- Frontend: Simple form to submit a message
- Backend: Receives message, stores in PostgreSQL, returns confirmation

## Setup
1. Start PostgreSQL and update backend config.
2. Run backend: `cd backend && npm run start:dev`
3. Run frontend: `cd frontend && npm run dev`

## Dummy Flow
- User submits message in frontend
- Frontend sends POST to backend `/messages`
- Backend saves message and responds

---
Replace dummy logic with your actual business logic as needed.
