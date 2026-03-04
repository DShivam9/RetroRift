import React from 'react'
import { Github, Twitter, Disc, Globe } from 'lucide-react'
import FooterGrid from './effects/FooterGrid'
import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      {/* Background Effect */}
      <div className="footer__bg">
        <FooterGrid />
      </div>

      <div className="footer__container">

        {/* Top Row: Main Content */}
        <div className="footer__main">
          {/* Brand */}
          <div className="footer__col footer__col--brand">
            <div className="footer__brand">RetroPlay HUB</div>
            <p className="footer__desc">
              The ultimate destination for classic web-based gaming.
              No downloads, just pure nostalgia.
            </p>
            <div className="footer__status">
              <div className="footer__status-dot"></div>
              <span>SYSTEM: ONLINE_v1.0.4</span>
            </div>

            <div className="footer__socials" style={{ marginTop: '20px' }}>
              <a href="#" className="footer__icon-link" aria-label="Website"><Globe size={18} /></a>
              <a href="#" className="footer__icon-link" aria-label="Github"><Github size={18} /></a>
              <a href="#" className="footer__icon-link" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" className="footer__icon-link" aria-label="Discord"><Disc size={18} /></a>
            </div>
          </div>

          {/* Placeholders */}
          <div className="footer__links-grid">
            <div className="footer__col">
              <h4 className="footer__heading">EXPLORE</h4>
              <ul className="footer__list">
                <li><a href="#" className="footer__link">Latest Releases</a></li>
                <li><a href="#" className="footer__link">Popular Games</a></li>
                <li><a href="#" className="footer__link">Collections</a></li>
                <li><a href="#" className="footer__link">Random Play</a></li>
              </ul>
            </div>

            <div className="footer__col">
              <h4 className="footer__heading">COMMUNITY</h4>
              <ul className="footer__list">
                <li><a href="#" className="footer__link">Leaderboards</a></li>
                <li><a href="#" className="footer__link">Tournaments</a></li>
                <li><a href="#" className="footer__link">Discord Server</a></li>
                <li><a href="#" className="footer__link">Feedback</a></li>
              </ul>
            </div>

            <div className="footer__col">
              <h4 className="footer__heading">LEGAL</h4>
              <ul className="footer__list">
                <li><a href="#" className="footer__link">Privacy Policy</a></li>
                <li><a href="#" className="footer__link">Terms of Service</a></li>
                <li><a href="#" className="footer__link">DMCA</a></li>
                <li><a href="#" className="footer__link">Cookie Settings</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer__div"></div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__copy">© {currentYear} RetroPlay. All Code is Art.</div>


        </div>

      </div>
    </footer>
  )
}
