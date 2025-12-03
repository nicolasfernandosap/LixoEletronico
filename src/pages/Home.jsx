// src/pages/Home.jsx

import './Home.css';

// Caminhos das imagens
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
      </div>

      <div className="home-container">
        {/* Card 1: Prevenção */}
        <div className="card-wrapper">
          <div className="box">
            <img src={prevencaoImg} alt="Prevenção e cuidado com o meio ambiente" />
            <div className="box-overlay">
              <h3>Prevenção</h3>
            </div>
          </div>
          <p className="box-description">
            A melhor forma de combater o lixo eletrônico é reduzir o consumo e prolongar a vida útil dos aparelhos.
          </p>
        </div>
        
        {/* Card 2: Impacto */}
        <div className="card-wrapper">
          <div className="box">
            <img src={problemaImg} alt="Problema do acúmulo de lixo eletrônico" />
            <div className="box-overlay">
              <h3>Impacto</h3>
            </div>
          </div>
          <p className="box-description">
            Quando descartado incorretamente, o lixo eletrônico libera metais pesados que contaminam ecossistemas e afetam nossa saúde.
          </p>
        </div>

        {/* Card 3: Solução */}
        <div className="card-wrapper">
          <div className="box">
            <img src={separacaoImg} alt="Separação correta do lixo" />
            <div className="box-overlay">
              <h3>Solução</h3>
            </div>
          </div>
          <p className="box-description">
            A reciclagem e o descarte em pontos de coleta autorizados garantem que os materiais sejam reaproveitados de forma segura.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
