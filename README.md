# Pokemon Point Buy Team Builder

A React web application for building Pokemon teams within a pre-set point buy limit.

## Project Structure

The project is divided into two main parts:
- **Frontend**: A React application located in the `src/` directory.
- **Backend**: A Node.js/Express application located in the `server/` directory.

### Project Folders

- `src/components`: Reusable UI components.
- `src/hooks`: Custom React hooks.
- `src/services`: API and data fetching logic (e.g., loading Pokemon database).
- `src/store`: State management (Zustand).
- `src/types`: JavaScript-based type definitions/interfaces.
- `src/utils`: Helper functions and formatting.
- `src/data`: Static data or local database files.
- `server/`: Node.js Express server.
  - `server/index.js`: Main server entry point.
  - `server/package.json`: Backend dependencies and scripts.

## Dependencies

### Frontend
- **UI/Styles**: Tailwind CSS, Lucide React, `clsx`, `tailwind-merge`.
- **State Management**: Zustand.
- **Routing**: React Router DOM.
- **Utilities**: Lodash-es, Axios.

### Backend
- **Framework**: Express.js.
- **Middleware**: CORS.
- **Environment Management**: dotenv.
- **Development**: nodemon.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    cd server
    npm install
    cd ..
    ```
2.  **Run the application (Frontend & Backend)**:
    - This is the **recommended** way to run the app as it starts both the React frontend and Node.js backend.
    ```bash
    npm run dev
    ```
    The backend will run on `http://localhost:5001` and the frontend on `http://localhost:3000`.

3.  **Troubleshooting Startup**:
    - If you see `net::ERR_CONNECTION_REFUSED` or can't load Generations/Tiers, ensure the backend is running.
    - You can verify the backend manually by visiting `http://localhost:5001/api/health`.
    - Make sure you have run `npm install` in both the root directory and the `server/` directory.

4.  **Run only Frontend**:
    ```bash
    npm start
    ```
5.  **Run only Backend**:
    ```bash
    npm run server
    ```

## Deployment to GitHub Pages

The application is now configured to work as a standalone static site on GitHub Pages. It uses a frontend-based scraper with a CORS proxy to fetch data from Smogon when the local backend is not available.

### Steps to Deploy:

1.  **Create a GitHub Repository**: Create a new repository on GitHub (e.g., `pokemon-point-buy`).
2.  **Add Remote**: In your local terminal, add the GitHub repository as a remote:
    ```bash
    git remote add origin https://github.com/USERNAME/REPO_NAME.git
    ```
3.  **Deploy**: Run the following command to build and deploy the app:
    ```bash
    npm run deploy
    ```
    This will automatically build the project and push the `build/` folder to a `gh-pages` branch on your GitHub repository.

4.  **Enable GitHub Pages**:
    - Go to your GitHub repository settings.
    - Select **Pages** from the sidebar.
    - Under **Build and deployment**, ensure the source is set to "Deploy from a branch" and the branch is set to `gh-pages` / `/ (root)`.

### Note on CORS Proxies:
By default, the frontend scraper uses `https://corsproxy.io/?`. If this proxy is unavailable or rate-limited, you can change the `DEFAULT_PROXY` in `src/services/smogonService.js`.

## Features

- [ ] Import/Export team data.
- [ ] Customizable Point Buy configuration.
- [ ] Pokemon database integration.
- [ ] Point limit validation.

## Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm start`
