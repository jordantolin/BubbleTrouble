# Bubble Trouble Social Network

A real-time social networking platform with a unique bubble-themed interaction model. Content and interactions float like bubbles in a digital space, emphasizing authentic, time-sensitive social connections.

## Features

- 🫧 Bubble-themed interface with dynamic animations
- 🔄 Real-time WebSocket communication
- 🔒 User authentication and profile management
- 📱 Responsive design for mobile and desktop
- ⏳ Ephemeral content system
- 🎯 Challenge system for user engagement
- 🎨 Modern UI with pastel color scheme
- ♿ Accessible components using Radix UI

## Tech Stack

- **Frontend**:
  - React.js with TypeScript
  - Vite for fast development
  - TanStack Query for data management
  - Framer Motion for animations
  - Tailwind CSS for styling
  - Radix UI for accessible components

- **Backend**:
  - Express.js server
  - PostgreSQL database
  - Drizzle ORM for type-safe database operations
  - WebSocket for real-time communication
  - JWT for authentication

## Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bubble-trouble.git
   cd bubble-trouble
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   pnpm install

   # Install client dependencies
   cd ../client
   pnpm install
   ```

3. Set up the database:
   ```bash
   # Create the database
   createdb bubble_trouble

   # Generate and run migrations
   cd ../server
   pnpm db:generate
   pnpm db:migrate
   ```

4. Create a `.env` file in the server directory:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bubble_trouble
   JWT_SECRET=your-secret-key
   PORT=3000
   ```

5. Start the development servers:
   ```bash
   # Start the server (from server directory)
   pnpm dev

   # Start the client (from client directory)
   pnpm dev
   ```

The application will be available at:
- Frontend: http://localhost:5177
- Backend: http://localhost:3000

## Development

### Project Structure

```
bubble-trouble/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and configurations
│   │   └── styles/       # Global styles and Tailwind configuration
│   └── public/           # Static assets
└── server/               # Backend Express application
    ├── db/               # Database schema and migrations
    ├── routes/           # API routes
    ├── services/         # Business logic and services
    └── middleware/       # Express middleware
```

### Key Components

- **BubbleRadar**: Main component for displaying and interacting with bubbles
- **WebSocket Service**: Handles real-time communication
- **Authentication**: JWT-based auth with token refresh
- **Challenge System**: Gamification features for user engagement

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Radix UI for accessible component primitives
- Tailwind CSS for utility-first styling
- Framer Motion for smooth animations
