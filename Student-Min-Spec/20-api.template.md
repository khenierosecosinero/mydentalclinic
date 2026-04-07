# API Design

## Base URL
/api/v1

## Endpoints

### Authentication
POST /login  
POST /logout  

### Users
GET /users/profile  
PUT /users/profile  

### Appointments
GET /appointments  
POST /appointments  
PUT /appointments/{id}  
DELETE /appointments/{id}  

### FAQ
GET /faq  

### Help
GET /help  

## Example Request

POST /appointments
{
  "name": "John Doe",
  "email": "john@email.com",
  "phone": "123456789",
  "date": "2026-04-10",
  "time": "10:00",
  "service": "Cleaning",
  "notes": "Tooth sensitivity"
}

## Example Response
{
  "status": "Pending",
  "message": "Appointment created successfully"
}