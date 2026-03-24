Dental Clinic Appointment System – Testing Assignment



Step 0 — Identify your app and features

App Name:
Dental Clinic Appointment System

Features:

FAQ Section — Frontend-only
Help Center — Frontend-only
Appointment Booking — Frontend-only (backend can be added later)


Part 1 — Testing 101
1. What is a software test?
-A software test is the process of checking if an application works correctly according to its expected behavior. It helps identify bugs and ensures the system is reliable before users interact with it.

2. Why do teams write tests in real projects?
-Teams write tests to ensure that features work correctly and meet requirements. Tests also help prevent breaking existing functionality when new updates are added.

3. Definitions
Unit Test:
-A unit test checks a small part of the system, like a function or UI component, independently.

Integration/API Test:
-An integration test verifies that different parts of the system work together, such as frontend interacting with backend APIs.

E2E Test:
-An end-to-end test checks the complete user flow from start to finish, simulating real user behavior.

Part 2 — Apply testing to your features

✅ Feature 1: FAQ Section

A) Expected Behavior
When the user clicks a question, the answer is displayed.
When the user clicks another question, the previous answer collapses.
The FAQ page loads correctly when accessed from the sidebar.
B) Test Cases

Test Case 1

Test Name: Open FAQ Page
Type: E2E
Steps/Input: Click FAQ from sidebar
Expected Result: FAQ page is displayed

Test Case 2

Test Name: Expand FAQ Question
Type: Unit
Steps/Input: Click a FAQ question
Expected Result: Answer is shown

Test Case 3

Test Name: Switch FAQ Items
Type: Integration
Steps/Input: Click Question 1, then Question 2
Expected Result: Question 1 collapses, Question 2 expands


✅ Feature 2: Help Center

A) Expected Behavior
The Help Center page displays clinic contact information.
Help topics are visible to guide users.
The page loads properly when accessed from the sidebar.
B) Test Cases

Test Case 1

Test Name: Open Help Center
Type: E2E
Steps/Input: Click Help Center from sidebar
Expected Result: Help Center page is displayed

Test Case 2

Test Name: Display Contact Info
Type: Unit
Steps/Input: Open Help Center page
Expected Result: Phone, email, address, and hours are visible

Test Case 3

Test Name: Load Help Topics
Type: Integration
Steps/Input: Open Help Center page
Expected Result: Help topics are displayed correctly


Coverage Rule (Satisfied)

✔ Unit Tests
-Expand FAQ
-Display contact info

✔ Integration/API Tests
-FAQ switching behavior
-Help topics loading

✔ E2E Tests
-Navigate to FAQ
-Navigate to Help Center

Part 3 — Tools
![alt text](<Part 3-Tool.png>)


Part 4 — AI + Testing
1. Two ways AI can help write tests faster:
-AI can generate test cases based on features.
-AI can suggest edge cases that developers might miss.
2. Two risks of AI-generated tests:
-AI may generate incorrect or unrealistic test cases.
-AI might not fully understand the actual system behavior.
3. Personal rule:
-“I will not use AI-generated tests unless I review and understand them before using.”

Part 5 — Minimal test plan for next week
1. Which ONE feature will you test first?
-FAQ Section

2. What is the first test you would write?
-Unit test for expanding and collapsing FAQ questions

3. How will you run it locally?
Bash: npm run test or npx jest