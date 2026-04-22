Dental Clinic Appointment System
System Specification Document
1. System Description

The Dental Clinic Appointment System is a web-based application designed to help patients conveniently schedule and manage dental appointments online. The system allows users to book appointments, view upcoming schedules, reschedule or cancel appointments, and manage their personal information.

The platform also provides support features such as FAQ, Help Center, and user profile management, ensuring that patients can easily access information and assistance when needed.

This system improves clinic efficiency by reducing manual booking processes, minimizing scheduling conflicts, and allowing patients to manage their appointments anytime through an online interface.

2. System Objectives

The main objectives of the Dental Clinic Appointment System are:

Simplify appointment scheduling for dental patients.

Provide easy access for patients to manage their appointments.

Improve clinic efficiency by reducing manual booking.

Allow patients to update their personal information and contact details.

Provide support resources through FAQ and Help Center features.

Enhance user experience with an organized dashboard and simple navigation.

3. Functional Requirements

These describe the system functions that must be implemented.

3.1 User Dashboard

The system shall display a dashboard overview when the user logs in.

The system shall show upcoming appointments.

The system shall display appointment status (Pending, Approved, Cancelled).

3.2 Appointment Booking

The system shall allow patients to book an appointment.

The system shall require users to input:

Full name

Email address

Phone number

Appointment date

Appointment time

Type of service

Additional notes (optional)

The system shall store the appointment with Pending status.

3.3 Appointment Management

The system shall allow users to view all appointments.

The system shall allow users to cancel an appointment.

The system shall allow users to reschedule an appointment.

3.4 Profile Management

The system shall display the user’s personal profile details.

The system shall allow users to view appointment statistics.

The system shall show emergency contact information.

3.5 Settings Management

The system shall allow users to edit personal information.

The system shall allow users to update contact details.

The system shall allow users to change their password.

3.6 FAQ Feature

The system shall provide a Frequently Asked Questions section.

The system shall allow users to expand questions to view answers.

3.7 Help Center

The system shall provide contact information for the dental clinic.

The system shall provide guides and help topics for users.

3.8 Logout

The system shall allow users to securely log out of their account.

4. Non-Functional Requirements

These requirements define the quality attributes of the system.

4.1 Usability

The system must have a user-friendly interface.

Navigation must be simple and accessible from the sidebar menu.

4.2 Performance

Pages should load within 3 seconds or less.

The system should handle multiple users simultaneously without performance issues.

4.3 Security

User login sessions must be securely managed.

Personal information must be protected from unauthorized access.

4.4 Reliability

The system should maintain consistent operation without crashes.

Appointment data must be accurately stored and retrieved.

4.5 Availability

The system should be accessible online 24/7 for patients.

5. Hardware Requirements

Minimum hardware required to run the system:

Client Side

Computer / Laptop / Smartphone

Processor: Dual Core or higher

RAM: Minimum 4 GB

Storage: 500 MB free space

Internet connection

Server Side

Processor: Intel i3 or higher

RAM: Minimum 8 GB

Storage: 50 GB or more

Stable internet connection

6. Software Requirements
Operating System

Windows 10 / Windows 11

macOS

Linux

Development Tools

HTML5

CSS3

JavaScript

Node.js (if backend is used)

Database (MySQL / MongoDB / PostgreSQL)

Web Browser

Google Chrome

Mozilla Firefox

Microsoft Edge

Safari

7. Expected Output

The expected outputs of the system include:

Dashboard Interface

Displays upcoming appointments and appointment status.

Appointment Booking Confirmation

Displays confirmation when a patient successfully books an appointment.

Appointment List

Displays all scheduled appointments with details.

User Profile Information

Shows patient personal information and statistics.

Updated Settings

Displays updated user profile after saving changes.

Help and FAQ Responses

Provides assistance and answers to common questions.

Logout Confirmation

Redirects the user to the login page after logging out.

8. Admin Module Specification (Shared Login Updated)

8.1 System Description

The Admin Module allows the administrator to manage appointments and users within the system.

The system uses a shared login page for both regular users and admin accounts.

After successful authentication, the system redirects users based on role:

Admin users are redirected to the Admin Dashboard.

Regular users are redirected to the User Dashboard.

8.2 Admin Login Access (Shared Login Page)

The system shall use a single login page for both users and admin.

Default admin credentials:

Email: admin@gmail.com

Password: admin123

8.3 Authentication Behavior

The system shall allow login using:

Email

Password

The system shall validate credentials and redirect based on account type:

If credentials are admin@gmail.com and admin123, redirect to Admin Dashboard.

If credentials belong to a regular user account, redirect to User Dashboard.

If credentials are invalid, display an authentication error message.

8.4 Role-Based Access

The system shall identify user roles and enforce access control:

Admin: Full system control.

User: Limited to personal features.

8.5 Admin Functional Requirements

8.5.1 Admin Dashboard

The system shall display the following in the Admin Dashboard:

Total appointments

Pending, Approved, and Cancelled appointment counts

Recent bookings

8.5.2 Sidebar Navigation (Admin)

The admin interface sidebar shall include:

Dashboard

Appointments

Users

Reports (optional)

Settings

Logout

The sidebar must be visible on all admin pages.

The active menu item must be highlighted.

8.5.3 Appointment Management

The system shall allow admin to view all appointments submitted by users.

The system shall display appointment details, including:

Name

Email

Phone

Date and time

Service

Status

The system shall allow admin actions:

Approve appointment

Cancel appointment

Update appointment status

Any status change made by admin must be reflected on the user side.

8.5.4 User Management

The system shall allow admin to view all users.

The system shall allow admin to view user appointment history.

8.5.5 Settings

The system shall allow admin to change admin email.

The system shall allow admin to change password.

8.5.6 Logout

The system shall support secure admin logout.

After logout, the system shall redirect to the shared login page.

8.6 System Flow (Shared Login)

User/Admin opens Login Page and enters credentials.

If role is Admin, redirect to Admin Dashboard.

If role is User, redirect to User Dashboard.

If login is invalid, display an error message.

8.7 Non-Functional Requirements (Admin Module)

Secure login session handling.

Fast authentication response (less than 3 seconds).

Strict role-based access control.

Data privacy enforcement.

8.8 Expected Output (Admin Module)

Admin is redirected to Admin Dashboard after successful login.

Users are redirected to User Dashboard after successful login.

Role-based sidebar is displayed in admin pages.

Appointment status updates are reflected in real time for both admin and users.