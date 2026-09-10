import { FaInstagram, FaLinkedin, FaEnvelope, FaWhatsapp, FaFacebook } from "react-icons/fa6";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-name">GAURAV KAMBLE</p>
          <p className="footer-tagline">
            TURNING ATTENTION INTO <span className="accent">ACTION</span>.
          </p>
        </div>

        <div className="footer-right">
          <div className="flex flex-wrap gap-3 justify-end mb-6">
            <a href="https://wa.me/917666401860" target="_blank" rel="noreferrer" className="glass-pill !px-3" aria-label="WhatsApp">
              <FaWhatsapp size={18} />
            </a>
            <a href="mailto:myselfgauravkamble@gmail.com" className="glass-pill !px-3" aria-label="Email">
              <FaEnvelope size={18} />
            </a>
            <a href="https://www.linkedin.com/in/gaurav-kamble-3b3851273/" target="_blank" rel="noreferrer" className="glass-pill !px-3" aria-label="LinkedIn">
              <FaLinkedin size={18} />
            </a>
            <a href="https://www.instagram.com/iamgauravkamble/" target="_blank" rel="noreferrer" className="glass-pill !px-3" aria-label="Instagram">
              <FaInstagram size={18} />
            </a>
            <a href="https://www.facebook.com/iamgauravkamble" target="_blank" rel="noreferrer" className="glass-pill !px-3" aria-label="Facebook">
              <FaFacebook size={18} />
            </a>
          </div>
          <p className="footer-copy">© {year} Gaurav Kamble. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
