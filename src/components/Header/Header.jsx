import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="nav-wrapper">
        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <nav className={`navbar ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Página Inicial</Link></li>
            <li><Link to="/auxilio" onClick={() => setMenuOpen(false)}>Auxílio Lixo Eletrônico</Link></li>
            <li><Link to="/pontos" onClick={() => setMenuOpen(false)}>Pontos Autorizados</Link></li>
            <li><Link to="/contato" onClick={() => setMenuOpen(false)}>Contato</Link></li>
            <li><Link to="/cadastro" onClick={() => setMenuOpen(false)}>Cadastre-se</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
