import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="nav-wrapper">
        <nav className="navbar">
          <ul className="nav-links">
            <li><a href="#">Página Inicial</a></li>
            <li><a href="#">Auxílio Lixo Eletrônico</a></li>
            <li><a href="#">Pontos Autorizados</a></li>
            <li><a href="#">Contato</a></li>
            <li><a href="#">Cadastre-se</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
