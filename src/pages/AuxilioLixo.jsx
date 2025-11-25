import React, { useState } from 'react';
import './AuxilioLixo.css';

import ImagemMaquina from '../assets/LinhaBrancaMaquina.webp';
import ImagemMicroondas from '../assets/LinhaAzulMicroondas.jpeg';
import ImagemPilhas from '../assets/LinhaBateriasPilhas.jpg';
import ImagemTelevisao from '../assets/LinhaMarromTelevisor.jpeg';
import ImagemImpressora from '../assets/LinhaVerdeImpressora.webp';

const AuxilioLixo = () => {
  const [cardAberto, setCardAberto] = useState(null);

  const cards = [
    {
      id: 1,
      linha: "Linha Branca",
      descricao: `Eletrodomésticos grandes como geladeiras, freezers, máquinas de lavar e micro-ondas.
      Esses equipamentos contêm componentes recicláveis e precisam de descarte adequado para evitar contaminação e promover a reutilização eficiente dos materiais. É importante não descartá-los em lixo comum devido a fluidos e metais pesados.`,
      imagem: ImagemMaquina,
      classe: "card-maquina"
    },
    {
      id: 2,
      linha: "Linha Azul",
      descricao: `Equipamentos elétricos e eletrônicos como micro-ondas, ferramentas, brinquedos eletrônicos e dispositivos médicos.
      Devem ser descartados corretamente para evitar poluição por componentes tóxicos e garantir o reaproveitamento de partes úteis. Possuem circuitos e baterias que merecem manejo especializado.`,
      imagem: ImagemMicroondas,
      classe: "card-microondas"
    },
    {
      id: 3,
      linha: "Pilhas e Baterias",
      descricao: `Pilhas e baterias portáteis contêm metais tóxicos como mercúrio, cádmio e chumbo que podem contaminar o solo e a água.
      O descarte deve ser feito exclusivamente em pontos específicos ou programas de logística reversa para evitar danos ambientais e riscos à saúde.`,
      imagem: ImagemPilhas,
      classe: "card-pilhas"
    },
    {
      id: 4,
      linha: "Linha Marrom",
      descricao: `Equipamentos de áudio e vídeo como televisores, rádios e aparelhos de som.
      Esses itens contêm substâncias tóxicas, como chumbo em telas e outros componentes perigosos, que precisam ser manejados separadamente para não prejudicar o meio ambiente.`,
      imagem: ImagemTelevisao,
      classe: "card-televisao"
    },
    {
      id: 5,
      linha: "Linha Verde",
      descricao: `Computadores, notebooks, impressoras, celulares e tablets.
      Aparelhos com metais preciosos e circuitos complexos que necessitam de descarte em locais apropriados para evitar contaminação e garantir a recuperação de materiais valiosos.`,
      imagem: ImagemImpressora,
      classe: "card-impressora"
    }
  ];

  const handleClick = (id) => {
    const novoEstado = cardAberto === id ? null : id;
    setCardAberto(novoEstado);

    if (novoEstado) {
      setTimeout(() => {
        const el = document.getElementById(`card-${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  return (
    <div>
      <h2 className="titulo-principal">Auxílio ao Descarte de Lixo Eletrônico</h2>

      <p className="descricao-texto">
        O descarte correto de resíduos eletrônicos é essencial para preservar o meio ambiente,
        evitar a contaminação do solo e garantir que componentes reutilizáveis sejam reciclados
        da forma correta. Aqui você encontra orientações rápidas e simples para separar,
        identificar e descartar seus equipamentos eletrônicos de maneira segura e responsável.
      </p>

      <div className="cards-area">
        {cards.map((item) => (
          <div
            key={item.id}
            id={`card-${item.id}`}
            className={`card-base ${item.classe} ${cardAberto === item.id ? "aberto" : ""}`}
            onClick={() => handleClick(item.id)}
          >
            <img
              src={item.imagem}
              alt={item.linha}
              className="card-imagem"
            />

            <h3 className="linha-titulo">{item.linha}</h3>

            <div className={`conteudo-expandido ${cardAberto === item.id ? "mostrar" : ""}`}>
              <p>{item.descricao}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuxilioLixo;
