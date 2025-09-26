import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="nav-wrapper"> {/* <- Adicionado aqui */}
        <nav className="navbar">
          <ul className="nav-links">
            <li><Link to="/">Página Inicial</Link></li>
            <li><Link to="/auxilio">Auxílio Lixo Eletrônico</Link></li>
            <li><Link to="/pontos">Pontos Autorizados</Link></li>
            <li><Link to="/contato">Contato</Link></li>
            <li><Link to="/cadastro">Cadastre-se</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
