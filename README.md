# Smart Healthcare Appointment System

A full-stack healthcare appointment booking system built with microservices architecture and event-driven design.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                    (Next.js - Port 3000)                    │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Auth Service   │  │ Appointment     │  │ Notification    │
│  (Port 4001)    │  │ Service         │  │ Service         │
│                 │  │ (Port 4002)     │  │ (Port 4003)     │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         │           ┌────────┴────────┐           │
         │           │   RabbitMQ      │◄──────────┘
         │           │  (Event Bus)    │
         │           │  (Port 5672)    │
         │           └─────────────────┘
         │                    │
         └─────────┬──────────┘
                   ▼
         ┌─────────────────┐
         │    MongoDB      │
         │  (Port 27017)   │
         └─────────────────┘
```

## 🚀 Features

### Patient Features
- ✅ User registration and authentication
- ✅ Browse and search doctors by specialization
- ✅ Book appointments with preferred time slots
- ✅ View appointment history and status
- ✅ Cancel pending/approved appointments
- ✅ Receive notifications for appointment updates
- ✅ View prescriptions after consultation

### Doctor Features
- ✅ Doctor registration with credentials
- ✅ View incoming appointment requests
- ✅ Approve or reject appointments
- ✅ Complete appointments with prescriptions
- ✅ Manage availability and profile
- ✅ Real-time notifications for new bookings

### Technical Features
- ✅ Microservices Architecture (3 services)
- ✅ Event-Driven Architecture with RabbitMQ
- ✅ HttpOnly Cookies for authentication (secure)
- ✅ Protected routes with middleware
- ✅ MongoDB for data persistence
- ✅ Docker support for easy deployment

## 📁 Project Structure

```
healthcare-system/
├── backend/
│   ├── auth-service/           # Authentication & User Management
│   │   ├── src/
│   │   │   ├── config/         # Database & RabbitMQ config
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── middleware/     # Auth middleware
│   │   │   ├── models/         # Mongoose models
│   │   │   ├── routes/         # API routes
│   │   │   └── index.js        # Entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── appointment-service/    # Appointment Management
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── index.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── notification-service/   # Event-Driven Notifications
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── services/       # Event handlers & Email
│       │   └── index.js
│       ├── Dockerfile
│       └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── auth/          # Login & Register
│   │   │   ├── patient/       # Patient dashboard
│   │   │   ├── doctor/        # Doctor dashboard
│   │   │   └── page.js        # Landing page
│   │   ├── components/        # Reusable components
│   │   └── context/           # Auth context
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Message Queue | RabbitMQ |
| Authentication | JWT, HttpOnly Cookies |
| Containerization | Docker, Docker Compose |

## 📡 API Endpoints

### Auth Service (Port 4001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/auth/doctors` | List all doctors |
| GET | `/api/auth/doctors/:id` | Get doctor details |

### Appointment Service (Port 4002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments` | Create appointment |
| GET | `/api/appointments/patient` | Get patient's appointments |
| GET | `/api/appointments/doctor` | Get doctor's appointments |
| GET | `/api/appointments/:id` | Get single appointment |
| PUT | `/api/appointments/:id/approve` | Approve appointment |
| PUT | `/api/appointments/:id/reject` | Reject appointment |
| PUT | `/api/appointments/:id/complete` | Complete appointment |
| PUT | `/api/appointments/:id/cancel` | Cancel appointment |
| GET | `/api/appointments/slots/:doctorId` | Get booked slots |

### Notification Service (Port 4003)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

## 🔔 Event-Driven Architecture

### Events Published

| Event | Publisher | Description |
|-------|-----------|-------------|
| `user.registered` | Auth Service | New user registration |
| `appointment.created` | Appointment Service | New appointment booked |
| `appointment.approved` | Appointment Service | Appointment approved by doctor |
| `appointment.rejected` | Appointment Service | Appointment rejected by doctor |
| `appointment.completed` | Appointment Service | Appointment completed |
| `appointment.cancelled` | Appointment Service | Appointment cancelled |

### Event Flow Example

```
1. Patient books appointment
   └─► Appointment Service publishes "appointment.created"
       └─► Notification Service receives event
           ├─► Creates notification for doctor
           ├─► Creates notification for patient
           └─► Sends email notifications

2. Doctor approves appointment
   └─► Appointment Service publishes "appointment.approved"
       └─► Notification Service receives event
           ├─► Creates notification for patient
           └─► Sends email to patient
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- RabbitMQ (local or cloud)
- Docker & Docker Compose (optional)

### Option 1: Run with Docker (Recommended)

```bash
# Clone the repository
cd healthcare-system

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Services will be available at:
- Frontend: http://localhost:3000
- Auth Service: http://localhost:4001
- Appointment Service: http://localhost:4002
- Notification Service: http://localhost:4003
- RabbitMQ Management: http://localhost:15672 (guest/guest)

### Option 2: Run Locally

#### 1. Start MongoDB & RabbitMQ

```bash
# Start MongoDB
mongod

# Start RabbitMQ
rabbitmq-server
```

#### 2. Setup Environment Variables

Create `.env` files in each service directory:

**backend/auth-service/.env**
```env
PORT=4001
MONGODB_URI=mongodb://localhost:27017/healthcare-auth
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
RABBITMQ_URL=amqp://localhost:5672
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**backend/appointment-service/.env**
```env
PORT=4002
MONGODB_URI=mongodb://localhost:27017/healthcare-appointments
JWT_SECRET=your-super-secret-jwt-key-change-in-production
RABBITMQ_URL=amqp://localhost:5672
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**backend/notification-service/.env**
```env
PORT=4003
MONGODB_URI=mongodb://localhost:27017/healthcare-notifications
RABBITMQ_URL=amqp://localhost:5672
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### 3. Install Dependencies & Start Services

```bash
# Terminal 1 - Auth Service
cd backend/auth-service
npm install
npm run dev

# Terminal 2 - Appointment Service
cd backend/appointment-service
npm install
npm run dev

# Terminal 3 - Notification Service
cd backend/notification-service
npm install
npm run dev

# Terminal 4 - Frontend
cd frontend
npm install
npm run dev
```

## 🔒 Security Features

1. **HttpOnly Cookies**: JWT tokens stored in HttpOnly cookies (not accessible via JavaScript)
2. **Protected Routes**: Middleware-based route protection on both frontend and backend
3. **Role-Based Access**: Separate dashboards and permissions for doctors and patients
4. **No Secrets on Frontend**: All sensitive data handled server-side
5. **Password Hashing**: bcrypt with salt rounds
6. **CORS Configuration**: Restricted to frontend origin

## 🧪 Testing the Application

### 1. Register Users

1. Open http://localhost:3000
2. Register a patient account
3. Register a doctor account (select "Doctor" tab)

### 2. Book Appointment (as Patient)

1. Login as patient
2. Go to "Find Doctors"
3. Select a doctor and book appointment
4. Check "My Appointments" for status

### 3. Manage Appointment (as Doctor)

1. Login as doctor
2. See pending appointments on dashboard
3. Approve or reject appointments
4. Complete appointments with prescription

### 4. View Notifications

Both patient and doctor will receive in-app notifications for:
- New appointment requests
- Appointment approvals/rejections
- Appointment completions
- Cancellations

## 📝 Sample Data

You can use these credentials after registration:

**Patient:**
- Email: patient@test.com
- Password: password123

**Doctor:**
- Email: doctor@test.com
- Password: password123

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running on port 27017
   - Check connection string in .env

2. **RabbitMQ Connection Error**
   - Ensure RabbitMQ is running on port 5672
   - Services will retry connection automatically

3. **Cookie Not Set**
   - Ensure frontend and backend are on same domain for local dev
   - Check CORS credentials configuration

4. **Docker Issues**
   - Run `docker-compose down -v` and restart
   - Check Docker logs: `docker-compose logs [service-name]`

## 📄 License

This project is for educational purposes - Advanced Web Technologies Final Project.

## 👥 Contributors

- Student Name - Roll Number - University

---

**Made with ❤️ for Healthcare**
