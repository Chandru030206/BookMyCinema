/**
 * BookMyCinema - Movie Data
 * Contains all movie, theater, and showtime information
 */

// Movies Data
export const moviesData = [
  {
    id: 1,
    title: "Inception",
    genre: "Sci-Fi, Action, Thriller",
    rating: 8.8,
    duration: "2h 28min",
    language: "English",
    releaseDate: "2010-07-16",
    certificate: "PG-13",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg",
    banner: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page", "Tom Hardy", "Ken Watanabe"],
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0"
  },
  {
    id: 2,
    title: "The Dark Knight",
    genre: "Action, Crime, Drama",
    rating: 9.0,
    duration: "2h 32min",
    language: "English",
    releaseDate: "2008-07-18",
    certificate: "PG-13",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    banner: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine", "Gary Oldman"],
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY"
  },
  {
    id: 3,
    title: "Interstellar",
    genre: "Sci-Fi, Adventure, Drama",
    rating: 8.6,
    duration: "2h 49min",
    language: "English",
    releaseDate: "2014-11-07",
    certificate: "PG-13",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    banner: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth becomes uninhabitable due to blight and dust storms.",
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine", "Matt Damon"],
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E"
  },
  {
    id: 4,
    title: "Avatar: The Way of Water",
    genre: "Sci-Fi, Action, Adventure",
    rating: 7.6,
    duration: "3h 12min",
    language: "English",
    releaseDate: "2022-12-16",
    certificate: "PG-13",
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    banner: "https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.",
    director: "James Cameron",
    cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver", "Stephen Lang", "Kate Winslet"],
    trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0"
  },
  {
    id: 5,
    title: "Oppenheimer",
    genre: "Biography, Drama, History",
    rating: 8.4,
    duration: "3h 0min",
    language: "English",
    releaseDate: "2023-07-21",
    certificate: "R",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    banner: "https://image.tmdb.org/t/p/original/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr.", "Florence Pugh"],
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg"
  },
  {
    id: 6,
    title: "Dune: Part Two",
    genre: "Sci-Fi, Adventure, Drama",
    rating: 8.8,
    duration: "2h 46min",
    language: "English",
    releaseDate: "2024-03-01",
    certificate: "PG-13",
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    banner: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Josh Brolin", "Austin Butler"],
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w"
  },
  {
    id: 7,
    title: "Spider-Man: Across the Spider-Verse",
    genre: "Animation, Action, Adventure",
    rating: 8.7,
    duration: "2h 20min",
    language: "English",
    releaseDate: "2023-06-02",
    certificate: "PG",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    banner: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    director: "Joaquim Dos Santos",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Brian Tyree Henry", "Luna Lauren Velez", "Oscar Isaac"],
    trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg"
  },
  {
    id: 8,
    title: "John Wick: Chapter 4",
    genre: "Action, Crime, Thriller",
    rating: 7.7,
    duration: "2h 49min",
    language: "English",
    releaseDate: "2023-03-24",
    certificate: "R",
    poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    banner: "https://image.tmdb.org/t/p/original/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    description: "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.",
    director: "Chad Stahelski",
    cast: ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård", "Laurence Fishburne", "Ian McShane"],
    trailerUrl: "https://www.youtube.com/watch?v=qEVUtrk8_B4"
  },
  {
    id: 9,
    title: "The Batman",
    genre: "Action, Crime, Drama",
    rating: 7.8,
    duration: "2h 56min",
    language: "English",
    releaseDate: "2022-03-04",
    certificate: "PG-13",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fvber7lzWWWDc6yt.jpg",
    banner: "https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    director: "Matt Reeves",
    cast: ["Robert Pattinson", "Zoë Kravitz", "Jeffrey Wright", "Colin Farrell", "Paul Dano"],
    trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4"
  },
  {
    id: 10,
    title: "Top Gun: Maverick",
    genre: "Action, Drama",
    rating: 8.3,
    duration: "2h 10min",
    language: "English",
    releaseDate: "2022-05-27",
    certificate: "PG-13",
    poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    banner: "https://image.tmdb.org/t/p/original/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg",
    description: "After more than thirty years of service as one of the Navy's top aviators, Pete 'Maverick' Mitchell is where he belongs, pushing the envelope as a courageous test pilot.",
    director: "Joseph Kosinski",
    cast: ["Tom Cruise", "Miles Teller", "Jennifer Connelly", "Jon Hamm", "Glen Powell"],
    trailerUrl: "https://www.youtube.com/watch?v=qSqVVswa420"
  },
  {
    id: 11,
    title: "Everything Everywhere All at Once",
    genre: "Action, Adventure, Comedy",
    rating: 7.8,
    duration: "2h 19min",
    language: "English",
    releaseDate: "2022-03-25",
    certificate: "R",
    poster: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    banner: "https://image.tmdb.org/t/p/original/fOy2Jurz9k6RnJnMUMRDAgBwru2.jpg",
    description: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.",
    director: "Daniel Kwan, Daniel Scheinert",
    cast: ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan", "Jamie Lee Curtis", "James Hong"],
    trailerUrl: "https://www.youtube.com/watch?v=wxN1T1uxQ2g"
  },
  {
    id: 12,
    title: "Guardians of the Galaxy Vol. 3",
    genre: "Action, Adventure, Comedy",
    rating: 8.0,
    duration: "2h 30min",
    language: "English",
    releaseDate: "2023-05-05",
    certificate: "PG-13",
    poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
    banner: "https://image.tmdb.org/t/p/original/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
    description: "Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe and one of their own - a mission that could mean the end of the Guardians.",
    director: "James Gunn",
    cast: ["Chris Pratt", "Zoe Saldana", "Dave Bautista", "Karen Gillan", "Bradley Cooper"],
    trailerUrl: "https://www.youtube.com/watch?v=u3V5KDHRQvk"
  }
];

// Theaters Data
export const theatersData = [
  {
    id: 1,
    name: "IMAX Cineplex",
    location: "Downtown Mall, 5th Avenue",
    distance: "2.5 km",
    amenities: ["IMAX", "Dolby Atmos", "Recliner", "Parking"],
    showtimes: ["09:30 AM", "12:45 PM", "04:00 PM", "07:15 PM", "10:30 PM"]
  },
  {
    id: 2,
    name: "Starlight Multiplex",
    location: "Central Plaza, Main Street",
    distance: "4.2 km",
    amenities: ["Dolby Atmos", "Food Court", "Parking", "Wheelchair"],
    showtimes: ["10:00 AM", "01:15 PM", "04:30 PM", "07:45 PM", "11:00 PM"]
  },
  {
    id: 3,
    name: "Galaxy Cinema",
    location: "Sunset Boulevard, West End",
    distance: "6.8 km",
    amenities: ["4K", "Recliner", "Parking"],
    showtimes: ["11:00 AM", "02:30 PM", "06:00 PM", "09:30 PM"]
  },
  {
    id: 4,
    name: "Metro Movies",
    location: "City Center, Block C",
    distance: "1.8 km",
    amenities: ["Recliner", "Food Court"],
    showtimes: ["10:30 AM", "01:45 PM", "05:00 PM", "08:15 PM"]
  }
];

// Showtimes Data
export const showtimesData = {
  1: [
    { time: "09:30 AM", price: 250, status: "available" },
    { time: "12:45 PM", price: 300, status: "filling" },
    { time: "04:00 PM", price: 350, status: "available" },
    { time: "07:15 PM", price: 400, status: "filling" },
    { time: "10:30 PM", price: 350, status: "available" }
  ],
  2: [
    { time: "10:00 AM", price: 200, status: "available" },
    { time: "01:15 PM", price: 250, status: "available" },
    { time: "04:30 PM", price: 280, status: "filling" },
    { time: "07:45 PM", price: 320, status: "available" },
    { time: "11:00 PM", price: 280, status: "available" }
  ],
  3: [
    { time: "11:00 AM", price: 220, status: "available" },
    { time: "02:30 PM", price: 260, status: "available" },
    { time: "06:00 PM", price: 300, status: "filling" },
    { time: "09:30 PM", price: 280, status: "available" }
  ],
  4: [
    { time: "10:30 AM", price: 180, status: "available" },
    { time: "01:45 PM", price: 200, status: "available" },
    { time: "05:00 PM", price: 220, status: "available" },
    { time: "08:15 PM", price: 250, status: "filling" }
  ]
};

// Seat Layout Configuration
export const seatConfig = {
  premium: {
    name: "Premium",
    price: 350,
    rows: ["A", "B"],
    seatsPerRow: 12,
    color: "#8b5cf6"
  },
  executive: {
    name: "Executive",
    price: 280,
    rows: ["C", "D", "E", "F"],
    seatsPerRow: 14,
    color: "#2d5a27"
  },
  standard: {
    name: "Standard",
    price: 200,
    rows: ["G", "H", "I", "J"],
    seatsPerRow: 16,
    color: "#2d5a27"
  }
};

// Pre-booked seats (for demo)
export const bookedSeats = [
  "A3", "A4", "A7", "A8",
  "B5", "B6", "B10",
  "C2", "C8", "C9", "C14",
  "D4", "D5", "D11", "D12",
  "E1", "E7", "E8", "E9",
  "F3", "F6", "F13",
  "G5", "G6", "G7", "G12", "G13",
  "H2", "H10", "H11", "H15",
  "I4", "I8", "I9", "I14",
  "J1", "J6", "J7", "J16"
];

// Generate Dates for Next 7 Days
export const generateDates = () => {
  const dates = [];
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push({
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      fullDate: date.toISOString().split('T')[0],
      isToday: i === 0
    });
  }

  return dates;
};

// Helper Methods
export const getMovieById = (id) => {
  return moviesData.find(movie => movie.id === parseInt(id));
};

export const getTheaterById = (id) => {
  return theatersData.find(theater => theater.id === parseInt(id));
};

export const getShowtimes = (theaterId) => {
  return showtimesData[theaterId] || [];
};

export const searchMovies = (query) => {
  const searchTerm = query.toLowerCase();
  return moviesData.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm) ||
    movie.genre.toLowerCase().includes(searchTerm) ||
    movie.cast.some(actor => actor.toLowerCase().includes(searchTerm))
  );
};

export const filterMovies = (language, genre) => {
  return moviesData.filter(movie => {
    const matchLanguage = language === "All" || movie.language === language;
    const matchGenre = genre === "All" || movie.genre.includes(genre);
    return matchLanguage && matchGenre;
  });
};
