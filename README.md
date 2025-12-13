# Sweet Shop Management System - Incubyte Assessment

A full-stack Sweet Shop Management System built for the Incubyte Software Craftsperson Internship assessment.

## Overview

This application allows users to register, log in, browse available sweets, search by name, and purchase items (with proper out-of-stock handling). Admin users have additional capabilities to add, edit, delete, and restock sweets.

- **Backend**: FastAPI (Python) with MongoDB for persistent storage
- **Frontend**: React with Material UI for a modern, responsive single-page application
- **Authentication**: JWT-based with role-based access control
- **Key Features**:
  - User registration and login forms
  - Dashboard displaying all sweets with real-time search/filter
  - Purchase button (disabled and labeled "Out of Stock" when quantity = 0)
  - Admin panel for adding, updating, deleting, and restocking sweets
  - Clean, responsive design with great user experience

The project demonstrates Test-Driven Development (visible in backend commit history), clean and maintainable code, and responsible use of modern tools.

## How to Run Locally

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB (local or MongoDB Atlas)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Backend runs on http://127.0.0.1:8000

**### Frontend**
cd frontend
npm install
npm start

Frontend runs on http://localhost:3000
Admin Access: Register as admin, and the admin key is "admin123".

**Screenshots**

- Login / Register:
<img width="1917" height="871" alt="Login Page - Sweet Shop" src="https://github.com/user-attachments/assets/c5f8e88a-4778-4e3e-87e7-d5eff808bd51" />

- Home Dashboard - Sweet Grid:
<img width="1887" height="857" alt="Home Page - User + Admin" src="https://github.com/user-attachments/assets/5c9a37ff-ad8d-4e99-a855-1d2cbf744414" />

- Purchase & Out of Stock Button:
<img width="516" height="572" alt="Purchase Buttons - Enabled   Disabled" src="https://github.com/user-attachments/assets/3766426c-7a62-4c23-864a-2f498c041f56" />

- Admin Panel 1,2 & 3:
<img width="1901" height="872" alt="Admin Panel - 1" src="https://github.com/user-attachments/assets/b86ca7a4-2a8a-4806-b946-32cfdfb30db1" />
<img width="1890" height="862" alt="Admin Panel - 2" src="https://github.com/user-attachments/assets/95bca111-dc9f-4cc0-9354-eeb948e7c657" />
<img width="1606" height="835" alt="Admin Panel - 3" src="https://github.com/user-attachments/assets/c9616407-8b87-430e-97a2-80b5e1201537" />

**Test Report**
Backend tests cover authentication, CRUD operations, search, purchase logic (including out-of-stock), and admin-only protections.
<img width="948" height="415" alt="Test Report Image" src="https://github.com/user-attachments/assets/d51b997a-a2af-4661-aea1-ffa76281532e" />

## My AI Usage

I used AI tools thoughtfully throughout the project to support my development process, while maintaining full ownership of all code, logic, and design decisions.

- **ChatGPT**: My main assistant. It helped me:
  - Plan the overall project structure and folder organization
  - Guide the Test-Driven Development flow 
  - Recall correct syntax for FastAPI routes, Motor async MongoDB operations, JWT encoding/decoding, and MUI component patterns
  - Debug small issues (e.g., CORS, token attachment, async test errors)

- **GitHub Copilot**: Used occasionally for:
  - Autocompleting repetitive boilerplate (e.g., MUI props, Axios interceptors, basic useState/useEffect patterns)
  - Suggesting test case ideas during TDD

In every case, I carefully reviewed, modified, tested, and fully understood the suggestions before accepting them. I never copied code blindly. AI acted as a helpful pair programmer — speeding up syntax recall and setup so I could spend more time on:
- Writing meaningful, comprehensive tests first (true TDD)
- Keeping code clean, readable, and maintainable
- Designing a responsive and visually appealing user interface
- Ensuring all required functionality worked correctly

This responsible use of AI allowed me to deliver a higher-quality, well-structured application within the deadline while staying true to software craftsmanship principles.

**Acknowledgments**
Thank you to the Incubyte team for this meaningful assessment that truly reflects software craftsmanship values.
