import React from "react";
import "./SongList.css";
import "./Footer.css";
import {
  FaMusic,
  FaSpotify,
  FaYoutube,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

const Footer = () => {
  return (
    <div className="music-app">
      <div className="background-overlay"></div>
      <footer className="music-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <FaMusic size={28} />
            <span>EthioMusic</span>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Discover</h4>
              <a href="#">Popular</a>
              <a href="#">New Releases</a>
              <a href="#">Genres</a>
              <a href="#">Artists</a>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Cookies</a>
              <a href="#">Licenses</a>
            </div>
          </div>

          <div className="footer-social">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#">
                <FaSpotify />
              </a>
              <a href="#">
                <FaYoutube />
              </a>
              <a href="#">
                <FaInstagram />
              </a>
              <a href="#">
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} EthioMusic. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
