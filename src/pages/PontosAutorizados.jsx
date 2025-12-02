import React, { useEffect } from 'react';
import './PontosAutorizados.css';
import imagemFundo from '../assets/DepartamentoAmbiental.jpeg';

const PontosAutorizados = () => {
  // Efeito para desativar o scroll na página
  useEffect(() => {
    // Adiciona a classe ao body quando o componente é montado
    document.body.classList.add('sem-scroll');

    // Função de limpeza: remove a classe quando o componente é desmontado
    return () => {
      document.body.classList.remove('sem-scroll');
    };
  }, []); // O array vazio [] garante que o efeito rode apenas uma vez

  return (
    <main 
      className="ponto-coleta-pagina" 
      style={{ backgroundImage: `url(${imagemFundo})` }}
    >
      <div className="ponto-coleta-card">
        <h2 className="ponto-coleta-card__titulo">Ponto de Coleta Autorizado</h2>
        <div className="ponto-coleta-card__conteudo">
          <p className="ponto-coleta-card__texto">
            <strong className="ponto-coleta-card__texto--destaque">Local:</strong> Eco Ponto
          </p>
          <p className="ponto-coleta-card__texto">
            <strong className="ponto-coleta-card__texto--destaque">Endereço:</strong> Av. Borges de Medeiros, 257 - Cidade Alta, Santo Antônio da Patrulha - RS, 95500-000
          </p>
        </div>
      </div>
    </main>
  );
};

export default PontosAutorizados;
