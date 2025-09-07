# Music App Micro Frontend

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
   # Check http://localhost:5001
   ```

3. **Start the main application in a separate terminal:**

   ```powershell
   cd main-app
   npm install
   npm run dev
   # Check http://localhost:5000
   ```

4. **Open your browser at http://localhost:5000**

## Demo Credentials

- **Admin Role:** username: `admin`, password: `admin`
- **User Role:** username: `user`, password: `user`

## How It Works

### Micro Frontend Architecture

I decided to go with Vite and not Webpack because Webpack+NextJS were having some trouble working together. Vite was simpler.
This project uses Vite's Module Federation to load components across separate applications:

1. The main-app is the shell that handles authentication and loads remote components
2. The music-library exposes a MusicLibrary component loaded at runtime
3. Communication happens through props (the role prop is passed from shell to remote)


## Deployment on Vercel

I separated the codebases and pushed the code for main-app to `melody-shell` and for music-library to `melody-tracks` repos. Then, I hosted these apps separately via Vercel.
Of course it was possible to host it from the same repo, but I like to keep the code commits and git graph separate and clean for both the shell and the music library. Hence, I separated their repo and deployments.

1. **Pushed code to GitHub**

2. **Deployed the music-library remote first:**

   - Created a new project in Vercel pointing to repository
   - Configured build settings (default):
     - Framework Preset: Vite
     - Root Directory: `music-library`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Added environment variable: `VITE_BASE_URL` set to your deployment URL

3. **Deployed the main-app shell:**

   - Created another project in Vercel pointing to the same repository
   - Configured build settings (default):
     - Framework Preset: Vite
     - Root Directory: `main-app`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Added environment variable: `VITE_MUSIC_LIBRARY_URL` set to your music-library deployment URL
