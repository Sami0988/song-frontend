// src/App.js
import React from 'react';
import SongList from './components/SongList';
import Hero from './components/Hero';
import Footer from './components/Footer';


const App = () => {
  return (
    <div>
       <Hero />
    
      <SongList />

      <Footer/>
      
    </div>
  );
};

export default App;
