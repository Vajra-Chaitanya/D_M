# DualMind React Integration

This guide explains how to set up and run the DualMind application with a React frontend and FastAPI backend.

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## Backend Setup

1. Navigate to the project root directory:
   ```bash
   cd JARVIS-DOMAIN-SPECIFIC-V1
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI backend server:
   ```bash
   uvicorn api:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

## Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the React development server:
   ```bash
   npm start
   # or
   yarn start
   ```

   The React app will open in your default browser at `http://localhost:3000`

## Features

- **Chat Interface**: Interactive chat with the DualMind assistant
- **PDF Upload**: Upload and process PDF documents
- **Markdown Support**: Rich text rendering in messages
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between light and dark themes

## Project Structure

```
JARVIS-DOMAIN-SPECIFIC-V1/
├── api.py                # FastAPI backend
├── frontend/             # React frontend
│   ├── public/           # Static files
│   └── src/              # React source code
│       ├── components/   # React components
│       ├── services/     # API services
│       └── App.tsx       # Main application component
├── orchestrator.py       # Core orchestrator logic
├── requirements.txt      # Python dependencies
└── tools/               # Custom tools
```

## Available Scripts

In the frontend directory, you can run:

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Troubleshooting

- If you get CORS errors, ensure the backend is running and the `FRONTEND_ORIGINS` in `.env` includes your frontend URL
- If the frontend can't connect to the backend, check that the API server is running on port 8000
- For PDF upload issues, verify that the `output` directory exists and is writable

## License

This project is licensed under the MIT License - see the LICENSE file for details.
