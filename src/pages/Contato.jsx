import React, { useEffect } from 'react';
import './Contato.css'; // Importa o CSS específico para a página de Contato
import imagemFundo from '../assets/CidadeAltaSantoAntonio.jpg'; // Importa a imagem de fundo

const Contato = () => {
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
      className="contato-pagina" 
      style={{ backgroundImage: `url(${imagemFundo})` }}
    >
      <div className="contato-card">
        <h2 className="contato-card__titulo">Contato</h2>
        <div className="contato-card__conteudo">
          {/* --- INFORMAÇÕES ATUALIZADAS ABAIXO --- */}
          <p className="contato-card__texto">
            <strong className="contato-card__texto--destaque">Cidade:</strong> Santo Antônio da Patrulha
          </p>
          <p className="contato-card__texto">
            <strong className="contato-card__texto--destaque">Setor Representante:</strong> Meio Ambiente
          </p>
          <p className="contato-card__texto">
            <strong className="contato-card__texto--destaque">Fone:</strong> 51 3662-8441
          </p>
        </div>
      </div>
    </main>
  );
};

export default Contato;
