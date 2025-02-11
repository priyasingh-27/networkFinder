# Startup Network Finder

Startup Network Finder is a full-stack web application designed to help users discover and connect with networks based on query. It features user authentication, AI-powered search, and a credit-based system for searches.

## Features

- **User Authentication**: Secure login with Google OAuth.
- **AI-Powered Search**: Utilizes Gemini API or ChatGPT API for intelligent search recommendations.
- **Credit-Based System**: Users have limited search credits managed via Gmail API email detection.
- **MySQL Database**: Efficient data management and storage.
- **Modern UI**: Built with React.js for a smooth user experience.
- **Scalable Backend**: Node.js and Express power the backend services.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: Google OAuth
- **AI Services**: Gemini API / ChatGPT API
- **Deployment**: Deployed on railway.com

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo-url.git
   cd startup-network-finder
   ```
2. Install dependencies for both frontend and backend:
   ```sh
   cd backend
   npm install
   cd ../frontend
   npm install && npm run build
   ```
3. Set up environment variables (update `.env` files in `backend` and `frontend`).
4. Start the development servers:
   ```sh
   cd backend
   node index.js
   cd ../frontend
   npx serve -s dist
   ```

## Usage

- Sign in using Google authentication.
- Use the AI-powered search to find relevant networks.
- Manage search credits through email-based tracking.

## Contribution

Contributions are welcome. Feel free to submit issues and pull requests.

## License

This project is licensed under [MIT License](LICENSE).
