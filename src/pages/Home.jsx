// src/pages/Home.jsx

import './Home.css';

// 1. CORREÇÃO: Ajuste o caminho para subir apenas um nível (../)
import prevencaoImg from '../assets/prevencaoHambiente.jpg';
import problemaImg from '../assets/problemaLixo.jpg';
import separacaoImg from '../assets/separacaoLixo.jpg';

const Home = () => {
  return (
    <div className="home-wrapper">
      <div className="home-intro">
        <h1>O Problema do Lixo Eletrônico</h1>
        <p className="home-description">
          O descarte incorreto de equipamentos eletrônicos causa contaminação do solo e da água, liberando substâncias tóxicas que prejudicam o meio ambiente e a saúde humana. Nosso objetivo é facilitar a reciclagem e o descarte consciente.
        </p>
        <button className="home-button">
          Saiba como descartar
        </button>
      </div>

      <div className="home-container">
        <div className="box">
          <img src={prevencaoImg} alt="Prevenção e cuidado com o meio ambiente" />
          <div className="box-overlay">
            <h3>Prevenção</h3>
          </div>
        </div>
        
        <div className="box">
          <img src={problemaImg} alt="Problema do acúmulo de lixo eletrônico" />
          <div className="box-overlay">
            <h3>Impacto</h3>
          </div>
        </div>

        <div className="box">
          <img src={separacaoImg} alt="Separação correta do lixo" />
          <div className="box-overlay">
            <h3>Solução</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
