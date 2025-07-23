
# NIT-FORUM

## Project Overview

NIT-FORUM is a platform designed to facilitate seamless communication between students and professors. It provides an intuitive UI/UX for account management and class interactions. Students and professors can register, login, and engage in classroom discussions, share resources, and build a strong academic community.

## Features

* **User Authentication:** Students and professors can register with OTP (One-Time Password) email verification and login using JWT-based authentication.
* **Role-Based Profiles:** Each user has a profile page. Professors have options to create and manage classrooms, while students can view and join classes.
* **Classroom Management:**

  * **Create Classrooms:** Professors can create new classrooms by providing a name and description.
  * **Search Classrooms:** Users can search for classrooms by name using a live search feature.
  * **Request to Join:** Students can request to join a classroom. An OTP is sent to the class owner (professor) for approval, ensuring secure access.
* **Discussion Posts:** Within each classroom, members (owner or joined students) can create posts with a title and description. These posts appear in a class news-feed style layout for discussion and updates.
* **Resource Sharing:** Professors can upload files (e.g., notes, PDFs, DOCX, XLSX) associated with a classroom. Each upload includes a note title. Students and professors can download shared files.
* **Session Management:** Users can maintain sessions securely with HTTP-only cookies. Features include checking login status and logging out (clearing cookies).

## Tech Stack

* **Frontend:** React.js (with React Router v7 for client-side routing and React Toastify for user notifications)
* **Backend:** Node.js with Express.js framework for the API server
* **Database:** MongoDB (using Mongoose for ORM)
* **Authentication & Security:** JSON Web Tokens (JWT) for auth sessions; bcrypt for password hashing; HTTP-only, secure cookies for tokens
* **Email Service:** Nodemailer for sending OTP verification emails
* **Testing & Tools:** Postman (for API testing), and other utilities like CORS, body-parser

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/NIT-FORUM.git
   ```
2. **Backend Setup:**

   * Navigate to the backend folder:

     ```bash
     cd NIT-FORUM/backend
     ```
   * Install backend dependencies:

     ```bash
     npm install
     ```
   * Create a `.env` file in the `backend` directory with the following variables (use your own values):

     ```
     MONGO_URL=<Your MongoDB connection URI>
     DB_NAME=<Your database name>
     PORT=5000
     FRONTEND_URL=http://localhost:3000
     JWT_SECRET_KEY=<Your JWT secret>
     JWT_REFRESH_SECRET_KEY=<Your JWT refresh secret>
     COMPANY_EMAIL=<Your email for sending OTP>
     GMAIL_APP_PASSWORD=<Your Gmail App Password>
     ```
   * Start the backend server:

     ```bash
     node index.js
     ```
3. **Frontend Setup:**

   * Open a new terminal and navigate to the frontend folder:

     ```bash
     cd NIT-FORUM/classroom
     ```
   * Install frontend dependencies:

     ```bash
     npm install
     ```
   * Create a `.env` file in the `classroom` directory with the API base URL:

     ```
     REACT_APP_API_BASE_URL=http://localhost:5000
     ```
   * Start the frontend development server:

     ```bash
     npm start
     ```

## Usage Instructions

* **Registration:** New users (students or professors) should click on the **Signup** page. Enter Name, Email, select Role (Student or Professor), and set a Password. Before submitting, click **Send OTP** to receive a one-time code via email. Enter the received OTP and complete registration.
* **Login:** Registered users can log in on the **Login** page. Upon successful login, users are redirected to the home page.
* **Home Page:** Displays a welcome message and information. The navigation bar allows searching for classrooms and accessing the profile or logout.
* **Search Classrooms:** Click the search icon in the navbar and type a class name to search. Click a result to view that classroom’s details.
* **Profile Page:**

  * **User Info:** Shows the user’s name, email, and role.
  * **Create Classroom (Professors):** If logged in as a professor, click **Create Classroom** to open a popup. Enter the classroom name and description to create a new class.
  * **My Classrooms:** Professors see a table of classrooms they created. Students see a table of classrooms they have joined. Click on a class to view details.
* **Classroom Details Page:**

  * **Class Info:** Displays the class name and description at the top.
  * **Join Class (Students):** If you are a student and not already in the class, click **Join Class** to send a join request. Enter the OTP that the professor sends you (after they receive the request). Upon verification, you join the class.
  * **Add Post:** If you are the class owner (professor), click **Add Post** to create a new discussion post by entering a title and description.
  * **Upload Notes (Professors):** Professors see an upload section to share files. Enter a note title, choose a file (PDF/DOCX/XLSX), and click **Upload** to share it with the class.
  * **View Posts and Files:** All class members (owner or joined students) will see a list of posts and uploaded files. Posts show title and description. Files show the note title and have a download link.

## Author

Developed independently by a sole developer.
