# Sweet Shop Management System

This is my project submission for the Incubyte Software Craftsperson Internship assessment. I built a full-stack web application where users can browse and buy sweets, and admins can manage the inventory.

## What I Built

This is a sweet shop app where:
- Anyone can register and log in
- Users can see all available sweets and search for specific ones
- Users can purchase sweets (but can't buy if it's out of stock)
- Admins can add new sweets, update existing ones, delete them, and restock items

**Tech Stack:**
- Backend: FastAPI (Python) with MongoDB
- Frontend: React with Material UI
- Auth: JWT tokens with role-based access

I tried to follow Test-Driven Development practices, which you can see in my backend commit history. I also focused on keeping the code clean and easy to understand.

## Running the Project

### What You Need
- Python 3.9 or higher
- Node.js 16 or higher  
- MongoDB (you can use a local installation or MongoDB Atlas)

### Setting Up the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will start at http://127.0.0.1:8000

### Setting Up the Frontend
```bash
cd frontend
npm install
npm start
```

The frontend will open at http://localhost:3000

**Note:** To access admin features, register as an admin using the admin key: `admin123`

## Database Setup Note

The `.env` file is gitignored for security. Create one in `/backend` with:
MONGODB_URL=mongodb://localhost:27017  # or your Atlas string
JWT_SECRET=your-secret-key-here

Alternatively, run MongoDB locally (default port 27017) — no .env needed for basic testing.

## Screenshots

Here's what the app looks like:

**Login/Register Page:**
<img width="1917" height="871" alt="Login Page - Sweet Shop" src="https://github.com/user-attachments/assets/c5f8e88a-4778-4e3e-87e7-d5eff808bd51" />

**Home Dashboard:**
<img width="1887" height="857" alt="Home Page - User + Admin" src="https://github.com/user-attachments/assets/5c9a37ff-ad8d-4e99-a855-1d2cbf744414" />

**Purchase Buttons (showing both available and out of stock):**
<img width="516" height="572" alt="Purchase Buttons - Enabled & Disabled" src="https://github.com/user-attachments/assets/3766426c-7a62-4c23-864a-2f498c041f56" />

**Admin Panel Views:**
<img width="1901" height="872" alt="Admin Panel - 1" src="https://github.com/user-attachments/assets/b86ca7a4-2a8a-4806-b946-32cfdfb30db1" />
<img width="1890" height="862" alt="Admin Panel - 2" src="https://github.com/user-attachments/assets/95bca111-dc9f-4cc0-9354-eeb948e7c657" />
<img width="1606" height="835" alt="Admin Panel - 3" src="https://github.com/user-attachments/assets/c9616407-8b87-430e-97a2-80b5e1201537" />

## Testing

I wrote tests for the backend covering authentication, all CRUD operations, search functionality, purchase logic (including the out-of-stock scenarios), and admin-only access protections.

<img width="948" height="415" alt="Test Report Image" src="https://github.com/user-attachments/assets/d51b997a-a2af-4661-aea1-ffa76281532e" />

## My AI Usage

I want to be transparent about using AI during this project. I used it as a learning and productivity tool, but all the code and decisions are mine.

**ChatGPT** - I used this a lot for:
- Figuring out how to structure my project folders
- Understanding how to do TDD properly
- Getting help with JWT tokens and Material UI components
- Debugging issues like CORS errors and problems with async tests

**GitHub Copilot** - I used this occasionally for:
- Autocomplete suggestions for repetitive code
- Getting ideas for test cases

I never just copied and pasted code without understanding it. I always reviewed what the AI suggested, made changes to fit my needs, and tested everything thoroughly. Using AI helped me focus more on writing good tests, keeping my code clean, and making the UI look nice instead of spending hours searching for syntax or debugging small issues.

I think using AI responsibly helped me deliver better quality work faster while still learning everything properly.

## Acknowledgments

Thanks to the Incubyte team for creating this assessment! I learned a lot while working on it and really enjoyed the process.
