# API Design (Future)

## Endpoint: Book Appointment
POST /api/appointments

Request:
{
  name,
  email,
  phone,
  date,
  time,
  service
}

Response:
{
  status: "success",
  message: "Appointment booked"
}

## Endpoint: Get Help Topics
GET /api/help

Response:
[
  { title: "Booking Guide", content: "..." }
]