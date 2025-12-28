/**
 * BookMyCinema - Database Setup Script
 * 
 * Run this script to create all database tables and seed initial data
 * Usage: npm run setup-db
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Movie data to seed (matches your frontend movies.js)
const moviesData = [
  {
    title: "Inception",
    genre: "Sci-Fi, Action, Thriller",
    duration: "2h 28min",
    rating: 8.8,
    poster_url: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    language: "English",
    release_date: "2010-07-16",
    director: "Christopher Nolan",
    cast_members: "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page, Tom Hardy"
  },
  {
    title: "The Dark Knight",
    genre: "Action, Crime, Drama",
    duration: "2h 32min",
    rating: 9.0,
    poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    language: "English",
    release_date: "2008-07-18",
    director: "Christopher Nolan",
    cast_members: "Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine"
  },
  {
    title: "Interstellar",
    genre: "Sci-Fi, Adventure, Drama",
    duration: "2h 49min",
    rating: 8.6,
    poster_url: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    language: "English",
    release_date: "2014-11-07",
    director: "Christopher Nolan",
    cast_members: "Matthew McConaughey, Anne Hathaway, Jessica Chastain"
  },
  {
    title: "Avengers: Endgame",
    genre: "Action, Adventure, Sci-Fi",
    duration: "3h 1min",
    rating: 8.4,
    poster_url: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    description: "After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
    language: "English",
    release_date: "2019-04-26",
    director: "Anthony Russo, Joe Russo",
    cast_members: "Robert Downey Jr., Chris Evans, Mark Ruffalo, Scarlett Johansson"
  },
  {
    title: "Spider-Man: No Way Home",
    genre: "Action, Adventure, Fantasy",
    duration: "2h 28min",
    rating: 8.3,
    poster_url: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    description: "Peter Parker's identity is revealed, and he seeks help from Doctor Strange. The spell goes wrong, opening the multiverse.",
    language: "English",
    release_date: "2021-12-17",
    director: "Jon Watts",
    cast_members: "Tom Holland, Zendaya, Benedict Cumberbatch"
  },
  {
    title: "Dune",
    genre: "Sci-Fi, Adventure, Drama",
    duration: "2h 35min",
    rating: 8.0,
    poster_url: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    description: "Paul Atreides leads nomadic tribes in a battle to control the desert planet Arrakis and its valuable spice.",
    language: "English",
    release_date: "2021-10-22",
    director: "Denis Villeneuve",
    cast_members: "Timothée Chalamet, Rebecca Ferguson, Oscar Isaac"
  },
  {
    title: "The Matrix",
    genre: "Action, Sci-Fi",
    duration: "2h 16min",
    rating: 8.7,
    poster_url: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    description: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
    language: "English",
    release_date: "1999-03-31",
    director: "The Wachowskis",
    cast_members: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss"
  },
  {
    title: "Joker",
    genre: "Crime, Drama, Thriller",
    duration: "2h 2min",
    rating: 8.4,
    poster_url: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    description: "A mentally troubled comedian embarks on a downward spiral that leads to the creation of an iconic villain.",
    language: "English",
    release_date: "2019-10-04",
    director: "Todd Phillips",
    cast_members: "Joaquin Phoenix, Robert De Niro, Zazie Beetz"
  },
  {
    title: "Oppenheimer",
    genre: "Biography, Drama, History",
    duration: "3h",
    rating: 8.9,
    poster_url: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    description: "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    language: "English",
    release_date: "2023-07-21",
    director: "Christopher Nolan",
    cast_members: "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr."
  },
  {
    title: "Barbie",
    genre: "Adventure, Comedy, Fantasy",
    duration: "1h 54min",
    rating: 7.0,
    poster_url: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    description: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
    language: "English",
    release_date: "2023-07-21",
    director: "Greta Gerwig",
    cast_members: "Margot Robbie, Ryan Gosling, America Ferrera"
  },
  {
    title: "Avatar: The Way of Water",
    genre: "Action, Adventure, Fantasy",
    duration: "3h 12min",
    rating: 7.6,
    poster_url: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.",
    language: "English",
    release_date: "2022-12-16",
    director: "James Cameron",
    cast_members: "Sam Worthington, Zoe Saldana, Sigourney Weaver"
  },
  {
    title: "Top Gun: Maverick",
    genre: "Action, Drama",
    duration: "2h 10min",
    rating: 8.3,
    poster_url: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator.",
    language: "English",
    release_date: "2022-05-27",
    director: "Joseph Kosinski",
    cast_members: "Tom Cruise, Jennifer Connelly, Miles Teller"
  }
];

// Theater data
const theatersData = [
  { name: "IMAX Cineplex", location: "Downtown Mall, 5th Avenue" },
  { name: "Starlight Multiplex", location: "Central Plaza, Main Street" },
  { name: "Galaxy Cinema", location: "Sunset Boulevard, West End" },
  { name: "Metro Movies", location: "City Center, Block C" }
];

// Showtimes for each combination
const showtimes = ["09:30 AM", "12:45 PM", "04:00 PM", "07:15 PM", "10:30 PM"];

async function setupDatabase() {
  let connection;
  
  try {
    // First connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('🔌 Connected to MySQL server');

    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'bookmycinema_db'}`);
    console.log('📁 Database created/verified');

    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'bookmycinema_db'}`);

    // ============================================
    // CREATE TABLES
    // ============================================

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Movies table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS movies (
        movie_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(255),
        duration VARCHAR(50),
        rating DECIMAL(3,1),
        poster_url TEXT,
        description TEXT,
        language VARCHAR(50),
        release_date DATE,
        director VARCHAR(255),
        cast_members TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Movies table created');

    // Theaters table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS theaters (
        theater_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        amenities VARCHAR(255) DEFAULT 'Parking, Food Court',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Theaters table created');

    // Shows table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shows (
        show_id INT AUTO_INCREMENT PRIMARY KEY,
        movie_id INT NOT NULL,
        theater_id INT NOT NULL,
        show_date DATE NOT NULL,
        show_time VARCHAR(20) NOT NULL,
        price DECIMAL(10,2) DEFAULT 200.00,
        available_seats INT DEFAULT 160,
        FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
        FOREIGN KEY (theater_id) REFERENCES theaters(theater_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Shows table created');

    // Seats table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS seats (
        seat_id INT AUTO_INCREMENT PRIMARY KEY,
        show_id INT NOT NULL,
        seat_number VARCHAR(10) NOT NULL,
        seat_type ENUM('regular', 'vip', 'premium') DEFAULT 'regular',
        price DECIMAL(10,2) DEFAULT 200.00,
        status ENUM('available', 'booked', 'locked') DEFAULT 'available',
        locked_until TIMESTAMP NULL,
        FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE,
        UNIQUE KEY unique_seat (show_id, seat_number)
      )
    `);
    console.log('✅ Seats table created');

    // Bookings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        booking_id VARCHAR(20) PRIMARY KEY,
        user_id INT NOT NULL,
        show_id INT NOT NULL,
        seats TEXT NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Bookings table created');

    // ============================================
    // SEED DATA
    // ============================================

    // Check if data already exists
    const [existingMovies] = await connection.execute('SELECT COUNT(*) as count FROM movies');
    
    if (existingMovies[0].count === 0) {
      console.log('\n📊 Seeding database with initial data...');

      // Insert movies
      for (const movie of moviesData) {
        await connection.execute(
          `INSERT INTO movies (title, genre, duration, rating, poster_url, description, language, release_date, director, cast_members)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [movie.title, movie.genre, movie.duration, movie.rating, movie.poster_url, 
           movie.description, movie.language, movie.release_date, movie.director, movie.cast_members]
        );
      }
      console.log(`✅ Inserted ${moviesData.length} movies`);

      // Insert theaters
      for (const theater of theatersData) {
        await connection.execute(
          'INSERT INTO theaters (name, location) VALUES (?, ?)',
          [theater.name, theater.location]
        );
      }
      console.log(`✅ Inserted ${theatersData.length} theaters`);

      // Create shows for next 7 days
      const [movies] = await connection.execute('SELECT movie_id FROM movies');
      const [theaters] = await connection.execute('SELECT theater_id FROM theaters');

      let showCount = 0;
      for (const movie of movies) {
        for (const theater of theaters) {
          // Create shows for next 7 days
          for (let day = 0; day < 7; day++) {
            const showDate = new Date();
            showDate.setDate(showDate.getDate() + day);
            const dateStr = showDate.toISOString().split('T')[0];

            for (const time of showtimes) {
              // Random price between 200-450
              const price = [200, 250, 300, 350, 400, 450][Math.floor(Math.random() * 6)];
              
              await connection.execute(
                'INSERT INTO shows (movie_id, theater_id, show_date, show_time, price) VALUES (?, ?, ?, ?, ?)',
                [movie.movie_id, theater.theater_id, dateStr, time, price]
              );
              showCount++;
            }
          }
        }
      }
      console.log(`✅ Created ${showCount} shows`);

      // Create seats for each show
      const [shows] = await connection.execute('SELECT show_id FROM shows');
      let seatCount = 0;
      
      for (const show of shows) {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seatsPerRow = 16;

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          const row = rows[rowIndex];
          let seatType = 'regular';
          let price = 200;
          
          if (rowIndex < 2) {
            seatType = 'premium';
            price = 450;
          } else if (rowIndex < 5) {
            seatType = 'vip';
            price = 350;
          }

          for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
            const seatNumber = `${row}${seatNum}`;
            // Random 20% seats already booked
            const status = Math.random() < 0.2 ? 'booked' : 'available';
            
            await connection.execute(
              'INSERT INTO seats (show_id, seat_number, seat_type, price, status) VALUES (?, ?, ?, ?, ?)',
              [show.show_id, seatNumber, seatType, price, status]
            );
            seatCount++;
          }
        }
      }
      console.log(`✅ Created ${seatCount} seats`);

      // Create demo user
      const hashedPassword = await bcrypt.hash('demo123', 10);
      await connection.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        ['Demo User', 'demo@bookmycinema.com', hashedPassword]
      );
      console.log('✅ Created demo user (email: demo@bookmycinema.com, password: demo123)');

    } else {
      console.log('ℹ️  Database already has data, skipping seed');
    }

    console.log('\n🎉 Database setup completed successfully!\n');

  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
