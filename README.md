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

## 🗂️ Folder Structure (Frontend)
src/
├── api/
│ ├── test.jsx/
│ │ └── songApi.test.js # Unit tests for API calls
│ └── songsApi.js # Axios API functions
│
├── app/
│ └── store.js # Redux store setup
│
├── components/
│ ├── Header.jsx
│ ├── Header.css
│ ├── Footer.jsx
│ ├── Footer.css
│ ├── SongList.jsx
│ └── SongList.css
│
├── sagas/
│ ├── test.jsx/
│ │ └── songsSaga.test.js # Unit tests for sagas
│ └── songsSaga.js # Redux saga for async flows
│
├── store/
│ ├── test.jsx/
│ │ └── songSlice.test.js # Unit tests for Redux slice
│ └── songSlice.js # Redux Toolkit slice
│
├── utils/
│ ├── cloudinary.js # Cloudinary upload config
│ ├── Loader.js # Loading spinner component
│ └── Loader.css
│
├── App.jsx # Main app file
└── index.js # React entry point

yaml
Copy
Edit

---

## 📦 Installation

```bash
git clone https://github.com/Sami0988/song-frontend.git
cd song-frontend
npm install


## Enviromental variable
REACT_APP_CLOUD_NAME=dggq5nzt7
REACT_APP_CLOUD_PRESET=songcloud

## To test ur code use
 npm test


💡 AI Help
🧠 Saga integration was guided by suggestions from Google AI.
npm start



---

Let me know if you'd like to:

- Add deployment steps (e.g., with Vercel or Netlify).
- Include backend instructions.
- Generate a separate `CONTRIBUTING.md`.

I'm happy to customize it more.
