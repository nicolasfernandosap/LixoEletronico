import './Home.css';

const Home = () => {
  return (
    <div className="home-wrapper">
      <h1>Bem-vindo ao site Lixo Eletrônico</h1>
      <p>Site em desenvolvimento - Aluno: Nicolas Fernando</p>
      <p>Escola CIMOL Monteiro Lobato</p>

      <div className="home-container">
        <div className="box">Caixa 1</div>
        <div className="box">Caixa 2</div>
        <div className="box">Caixa 3</div>
      </div>
    </div>
  );
};

export default Home;
