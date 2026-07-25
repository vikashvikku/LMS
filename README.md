# 🎓 Learning Management System

LMS is a modern, role-based university and campus management platform designed to bring academic and administrative activities into a unified digital environment.

The platform provides dedicated interfaces for students and faculty members, allowing them to manage courses, assignments, attendance, grades, fees, library activities, announcements, and other academic operations through a responsive web application.

LMS is built using Next.js and Supabase with role-based access control, Row Level Security (RLS), and a centralized PostgreSQL database.

---

## ✨ Overview

University systems often distribute academic information across multiple portals and services. LMS aims to provide a centralized platform where students and faculty can access the information and functionality relevant to their roles.

The application currently includes dedicated Student and Faculty experiences with real data retrieved from Supabase.

### Student Portal

Students can access:

- Academic dashboard
- Enrolled courses
- Timetable
- Attendance
- Assignments
- Grades and results
- Fee information
- Library records
- Announcements
- Notifications
- Global search

### Faculty Portal

Faculty members can access:

- Teaching dashboard
- Assigned course sections
- Student information
- Attendance management
- Assignment management
- Assignment creation
- Grades and academic evaluation
- Announcements
- Global search

---

# 🚀 Core Features

## 🔐 Authentication & Authorization

LMS provides secure authentication using Supabase Auth.

The application supports role-based access for:

- Students
- Faculty

After authentication, users are directed to the appropriate portal according to their assigned role.

Authorization is enforced through application logic and Supabase Row Level Security policies.

---

## 📊 Role-Based Dashboards

### Student Dashboard

The student dashboard provides a quick overview of academic activity, including:

- Number of enrolled courses
- Pending assignments
- Attendance percentage
- Average academic score
- Upcoming assignments
- Recent announcements

### Faculty Dashboard

The faculty dashboard provides teaching-related information such as:

- Assigned sections
- Total students
- Active assignments
- Pending submissions
- Today's classes
- Upcoming deadlines
- Recent announcements

Dashboard information is dynamically retrieved from the database.

---

## 📚 Course Management

LMS provides role-specific course views.

Students can view courses and sections in which they are enrolled.

Faculty members can view the course sections assigned to them.

Course information is connected with the academic structure stored in Supabase.

---

## 📝 Assignment Management

The assignment module allows academic assignments to be managed within LMS.

Current functionality includes:

- Faculty assignment listing
- Assignment creation
- Section-based assignment association
- Assignment descriptions and instructions
- Due date and time
- Maximum marks
- Assignment publishing status
- Student assignment visibility
- Assignment-related academic information

Further end-to-end submission and grading workflow integration is under development.

---

## 📅 Attendance Management

LMS provides attendance functionality for both students and faculty.

Students can view their attendance information, while faculty members can manage attendance for their assigned academic sections.

Attendance data is stored centrally and retrieved according to the authenticated user's permissions.

---

## 🎓 Grades & Results

Students can view their academic performance through the Grades & Results module.

The interface supports:

- Assignment scores
- Maximum marks
- Percentage calculation
- Academic performance visualization
- Course-related grade information

Faculty grading workflows are being progressively integrated with the assignment system.

---

## 💳 Fee Management

The fee module provides students with access to financial information related to their academic program.

The underlying system includes support for:

- Fee structures
- Student fee records
- Payments
- Payment transactions
- Academic-year-based fee information

Currency values throughout LMS are intended to use the Indian Rupee (₹).

---

## 📖 Library Management

LMS includes an integrated library module.

The system supports:

- Books
- Book copies
- Library loans
- Borrowing records
- Due dates
- Returned books
- Library fines

Students can view their relevant library activity directly from the portal.

---

## 📢 Announcements

LMS provides centralized academic announcements.

Announcements can be displayed across dashboards and dedicated announcement interfaces to keep users informed about:

- Examination schedules
- University updates
- Workshops
- Library notices
- Academic events
- Other institutional information

---

## 🔔 Notifications

The application includes notification functionality for surfacing relevant academic and system information to users.

The notification interface follows the same role-aware architecture used throughout LMS.

---

## 🔎 Global Search

LMS includes a global search interface designed to help users quickly navigate through the platform.

Search can be used to discover relevant:

- Pages
- Courses
- Assignments
- Academic content

Search results respect the user's role so that students and faculty receive relevant navigation and information.

---

# 🎨 User Interface

LMS uses a custom responsive design system developed specifically for an academic management environment.

The application supports both light and dark themes.

## ☀️ Light Theme — Campus Sand

The light interface uses a warm academic palette rather than a conventional pure-white dashboard.

The visual system uses:

- Warm ivory
- Sand
- Cream
- Camel accents
- Espresso typography and contrast

The objective is to provide a calm, professional, and comfortable interface for extended academic use.

## 🌙 Dark Theme — Campus Noir

The dark interface uses:

- Charcoal
- Graphite
- Dusty mauve accents
- Soft neutral typography
- Layered dark surfaces

The dark theme avoids pure-black surfaces and instead uses multiple levels of graphite to maintain depth and visual hierarchy.

---

# 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack React framework |
| React | User interface development |
| JavaScript | Application logic |
| Supabase | Backend platform |
| PostgreSQL | Relational database |
| Supabase Auth | Authentication |
| Supabase RLS | Database-level authorization |
| CSS | Application styling |
| Lucide Icons | Interface icons |

---

# 🏗️ Architecture

LMS follows a role-based application architecture.

```text
                    LMS
                        │
                Authentication
                        │
                 Supabase Auth
                        │
              ┌─────────┴─────────┐
              │                   │
           Student              Faculty
              │                   │
              └─────────┬─────────┘
                        │
                  Application
                     Logic
                        │
                     Supabase
                        │
                  PostgreSQL DB
                        │
              Row Level Security
