# 🎬 BookMyCinema - Movie Ticket Booking System

A full-stack movie ticket booking application with React frontend and Node.js/Express/MySQL backend.

## 📸 Screenshots

The application features a dark, cinematic theme inspired by modern movie apps with smooth animations, 3D effects, and a mobile-first responsive design.

## ✨ Features

### Design
- 🌙 Clean, professional dark mode UI
- 🎨 Cinematic theme with Netflix-inspired styling
- ✨ 3D animated hero section with React Three Fiber
- 📱 Mobile-first responsive layout (works on all devices)

### Pages
1. **Home Page**
   - Top navigation bar with logo, Movies, Theaters, Bookings, Profile
   - 3D animated hero section with Beams effect
   - Movie cards with poster, title, genre, rating, and "Book Now" button
   - Search bar and filter options by genre
   - Featured movies section

2. **Movie Details Page**
   - Large movie banner/poster
   - Movie description, cast, duration, rating
   - Date selector
   - Available theaters and show timings

3. **Seat Selection Page**
   - Interactive seat layout (available, selected, booked)
   - Screen indicator
   - Seat legend with colors (Premium, VIP, Regular)
   - Real-time seat selection summary
   - Price breakdown

4. **Payment Page**
   - Booking summary with order details
   - Payment countdown timer (10 minutes)
   - Card / UPI / Wallet options
   - Form validation
   - Confirmation modal with booking ID

5. **Authentication Page**
   - Login and Register forms
   - JWT-based authentication
   - Persistent login with localStorage

### Full-Stack Features
- ✅ React with React Router
- ✅ Node.js + Express backend
- ✅ MySQL database with transactions
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ RESTful API design
- ✅ Rate limiting and security headers
- ✅ Fallback to static data when backend unavailable

## 📁 Project Structure

```
MovieBooking/
├── src/                    # React Frontend
│   ├── components/         # Reusable UI components
│   │   ├── Beams.jsx       # 3D animated background
│   │   ├── Navbar.jsx      # Navigation with auth
│   │   ├── Footer.jsx      # Site footer
│   │   ├── MovieCard.jsx   # Movie card component
│   │   └── Modal.jsx       # Reusable modal
│   ├── context/            # React Context
│   │   └── BookingContext.jsx  # Global state with auth
│   ├── data/               # Static fallback data
│   │   └── movies.js       # Movies and theaters
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Home page
│   │   ├── MovieDetails.jsx # Movie details
│   │   ├── SeatSelection.jsx # Seat picker
│   │   ├── Payment.jsx     # Payment form
│   │   └── Auth.jsx        # Login/Register
│   ├── services/           # API service layer
│   │   └── api.js          # Centralized API calls
│   └── styles/             # Global styles
│       └── global.css      # CSS variables
├── backend/                # Node.js Backend
│   ├── config/
│   │   ├── db.js           # MySQL connection pool
│   │   └── setupDatabase.js # Schema & seed script
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js   # Auth endpoints
│   │   ├── movieRoutes.js  # Movie endpoints
│   │   ├── showRoutes.js   # Show endpoints
│   │   ├── seatRoutes.js   # Seat endpoints
│   │   ├── bookingRoutes.js # Booking endpoints
│   │   └── paymentRoutes.js # Payment endpoint
│   ├── server.js           # Express entry point
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables
├── public/                 # Static assets
├── package.json            # Frontend dependencies
└── vite.config.js          # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create MySQL database
mysql -u root -p
> CREATE DATABASE bookmycinema;
> exit

# Configure environment variables
# Edit .env file with your MySQL credentials

# Setup database schema and seed data
npm run setup-db

# Start backend server
npm start

# Or for development with auto-reload
npm run dev
```

Backend runs on `http://localhost:5000`

## ⚙️ Environment Variables

Create/edit the `.env` file in the `/backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bookmycinema

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID

### Shows
- `GET /api/shows/:movieId` - Get shows for a movie

### Seats
- `GET /api/seats/:showId` - Get seats for a show
- `POST /api/seats/book` - Book seats (requires auth)

### Bookings
- `POST /api/bookings` - Create booking (requires auth)
- `GET /api/bookings/user/:userId` - Get user bookings (requires auth)

### Payments
- `POST /api/payment` - Process payment

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 salt rounds)
- Rate limiting (100 requests/15min)
- CORS configuration
- Helmet security headers
- SQL injection prevention with parameterized queries
- Transaction-based seat booking with row-level locking

## 🎨 Tech Stack

### Frontend
- React 18 with Vite
- React Router DOM v6
- React Three Fiber + Drei (3D effects)
- Context API for state management
- CSS with custom properties

### Backend
- Node.js + Express
- MySQL with mysql2/promise
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- Helmet, CORS, express-rate-limit

## 📝 Database Schema

- **users** - User accounts (id, name, email, password, phone)
- **movies** - Movie information (id, title, genre, rating, poster, etc.)
- **theaters** - Theater locations (id, name, location, amenities)
- **shows** - Movie showtimes (id, movie_id, theater_id, show_date, show_time)
- **seats** - Seat availability per show (id, show_id, row, seat_number, type, price, is_booked)
- **bookings** - User bookings (id, user_id, show_id, seats, total_amount, status)

## 🔧 Development Notes

The frontend is designed to work both with and without the backend:
- When the backend is running, data is fetched from the API
- When the backend is unavailable, static data is used as a fallback

This allows for frontend development without requiring the full backend setup.

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Red | `#e50914` | CTAs, highlights |
| Background Dark | `#0a0a0a` | Main background |
| Card Background | `#1a1a1a` | Card surfaces |
| Gold Accent | `#ffd700` | Ratings, selected items |
| Green Accent | `#46d369` | Available seats, success |
| Text Primary | `#ffffff` | Headings, main text |
| Text Muted | `#6d6d6d` | Secondary text |

## 📄 License

MIT License

---

Made with ❤️ for movie lovers | 2025
