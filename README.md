# 🎵 Ethiopian Music Collection App

This is a modern web application for managing, uploading, and searching Ethiopian music. It includes song listings, search/filtering, pagination, and music player functionality.

## 🚀 Features

- 🎶 View a list of Ethiopian songs
- 🔍 Real-time search for songs, albums, and artists
- ➕ Add new songs (with Cloudinary image and audio upload)
- 🧑‍🎤 Artist and album metadata
- ⏭️ Pagination support
- 🔊 Music player
- 🌐 Backend API integration

## 🛠️ Tech Stack

- **Frontend**: React, CSS, Lucide/FontAwesome icons
- **State Management**: Redux + Redux-Saga
- **Backend**: Node.js, Express
- **Database**: MongoDB (via Mongoose)
- **File Upload**: Cloudinary API
- **Build Tool**: Webpack
- **Deployment**: Netlify (Frontend), Render or Railway (Backend)

## 🤖 AI Integration

> Redux-Saga setup and integration was guided with help from **Google AI**.
> Component test set up and some configuration done by **Google Ai**

## 🗂️ Folder Structure (Frontend)
project-root/
├── public/
│   └── index.html
│
├── src/
│   ├── api/
│   │   ├── songsApi.js
│   │   └── test.jsx/
│   │       └── songApi.test.js
│   │
│   ├── app/
│   │   └── store.js
│   │
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   ├── Footer.jsx
│   │   ├── Footer.css
│   │   ├── SongList.jsx
│   │   ├── SongList.css
│   │   ├── music/
│   │   │   └── MusicGrid.jsx
│   │   ├── popup/
│   │   │   ├── AddSongForm.jsx
│   │   │   ├── EditingForm.jsx
│   │   │   ├── DeleteConfirmation.jsx
│   │   │   └── SongDetailView.jsx
│   │   └── __tests__/
│   │       ├── SongList.test.js
│   │       └── Footer.test.js
│   │
│   ├── sagas/
│   │   ├── songsSaga.js
│   │   └── test.jsx/
│   │       └── songsSaga.test.js
│   │
│   ├── store/
│   │   ├── songSlice.js
│   │   └── test.jsx/
│   │       └── songSlice.test.js
│   │
│   ├── utils/
│   │   ├── cloudinary.js
│   │   ├── Loader.js
│   │   └── Loader.css
│   │
│   ├── App.jsx
│   └── index.js
│
├── mock/
│   └── cloudinary.js
│
├── .env.deployment
├── .env.test
├── .gitignore
├── .babelrc
├── jest.config.js
├── jest.setup.js
├── webpackconfig.js
├── README.md



---

## 📦 Installation

```bash
git clone https://github.com/Sami0988/song-frontend.git
cd song-frontend
npm install


# Create a .env file based on the environment variables below:
# REACT_APP_CLOUD_NAME=dggq5nzt7
# REACT_APP_CLOUD_PRESET=songcloud

npm start



#Code Optimization
Lazy Loading & Suspense
memo