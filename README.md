# Music App Micro Frontend Demo

A React application showcasing micro frontend architecture with module federation and role-based access.

## Features

- Role-based authentication (Admin/User roles)
- Micro frontend architecture using Vite Module Federation
- Music library with filtering and sorting
- Client-side data storage with localStorage

## How to Run Locally

1. **Prerequisites:**

   - Node.js v20.19+ or v22.x
   - NPM v10+

2. **Start the remote micro frontend first:**

   ```powershell
   cd music-library
   npm install
   npm run dev
   # Should run on http://localhost:5001
   ```

3. **Start the main application in a separate terminal:**

   ```powershell
   cd main-app
   npm install
   npm run dev
   # Should run on http://localhost:5000
   ```

4. **Open your browser at http://localhost:5000**

## Demo Credentials

- **Admin Role:** username: `admin`, password: `admin`
- **User Role:** username: `user`, password: `user`

## How It Works

### Micro Frontend Architecture

This project uses Vite's Module Federation to load components across separate applications:

1. The main-app is the shell that handles authentication and loads remote components
2. The music-library exposes a MusicLibrary component loaded at runtime
3. Communication happens through props (the role prop is passed from shell to remote)

### Role-Based Authentication

The application uses a simple role-based access control system:

1. Users log in with credentials stored in localStorage
2. The role ("admin" or "user") is passed to the MusicLibrary component
3. Admin users can add/edit/delete songs, while regular users can only view and filter

## Deployment on Vercel

To deploy this application on Vercel:

1. **Push your code to GitHub**

2. **Deploy the music-library remote first:**

   - Create a new project in Vercel pointing to your repository
   - Configure build settings:
     - Framework Preset: Vite
     - Root Directory: `music-library`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variable: `VITE_APP_BASE_URL` set to your deployment URL

3. **Deploy the main-app shell:**

   - Create another project in Vercel pointing to the same repository
   - Configure build settings:
     - Framework Preset: Vite
     - Root Directory: `main-app`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variable: `VITE_REMOTE_URL` set to your music-library deployment URL
   - Update the remote entry URL in `main-app/vite.config.ts` to point to your deployed music-library
