import React, { useState, useEffect, useMemo } from 'react';
import './IconeMenuExclusaoColaboradores.css';
import { FaTrash, FaSearch } from 'react-icons/fa';
import { supabase } from '../../../../supabaseClient';

const ModalConfirmacao = ({ mensagem, onConfirmar, onCancelar }) => (
  <div className="modal-exclusao-fundo">
    <div className="modal-exclusao-conteudo">
      <p>{mensagem}</p>
      <div className="modal-exclusao-botoes">
        <button className="btn-modal-exclusao btn-cancelar" onClick={onCancelar}>Não</button>
        <button className="btn-modal-exclusao btn-confirmar" onClick={onConfirmar}>Sim</button>
      </div>
    </div>
  </div>
);

export const IconeMenuExclusaoColaboradores = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [colaboradorParaExcluir, setColaboradorParaExcluir] = useState(null);
  
  // --- CORREÇÃO APLICADA: O estado 'excluindo' foi removido daqui ---

  useEffect(() => {
    const fetchColaboradores = async () => {
      setCarregando(true);
      setErro(null);
      try {
        const { data, error } = await supabase.from('colaboradores').select('*').order('nome_colaborador', { ascending: true });
        if (error) throw error;
        setColaboradores(data);
      } catch (error) {
        setErro('Falha ao carregar a lista de colaboradores.');
        console.error('Erro ao buscar colaboradores:', error);
      } finally {
        setCarregando(false);
      }
    };
    fetchColaboradores();
  }, []);

  const colaboradoresFiltrados = useMemo(() => {
    if (!termoBusca) return colaboradores;
    return colaboradores.filter(colab =>
      colab.nome_colaborador.toLowerCase().includes(termoBusca.toLowerCase()) ||
      colab.cpf_colaborador.includes(termoBusca)
    );
  }, [colaboradores, termoBusca]);

  const abrirModalExclusao = (colaborador) => {
    setColaboradorParaExcluir(colaborador);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setColaboradorParaExcluir(null);
  };

  const confirmarExclusao = async () => {
    if (!colaboradorParaExcluir) return;
    
    // --- CORREÇÃO APLICADA: A lógica que usava 'setExcluindo' foi removida ---
    try {
      const { error } = await supabase
        .from('colaboradores')
        .delete()
        .eq('cpf_colaborador', colaboradorParaExcluir.cpf_colaborador);
      if (error) throw error;
      setColaboradores(colaboradores.filter(c => c.cpf_colaborador !== colaboradorParaExcluir.cpf_colaborador));
    } catch (error) {
      alert(`Erro ao excluir colaborador: ${error.message}`);
    } finally {
      // Apenas fecha o modal
      fecharModal();
    }
  };

  return (
    <div className="gerenciamento-colaboradores-container">
      {showModal && (
        <ModalConfirmacao
          mensagem={`Deseja realmente excluir o colaborador "${colaboradorParaExcluir?.nome_colaborador}"?`}
          onConfirmar={confirmarExclusao}
          onCancelar={fecharModal}
        />
      )}

      <h2 className="gerenciamento-colaboradores-title">Exclusão de Colaborador</h2>
      
      <div className="barra-pesquisa-container">
        <FaSearch className="pesquisa-icone" />
        <input
          type="text"
          placeholder="Pesquisar por nome ou CPF..."
          className="pesquisa-input"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />
      </div>
      <div className="lista-colaboradores-wrapper">
        {carregando && <p className="feedback-lista">Carregando colaboradores...</p>}
        {erro && <p className="feedback-lista erro">{erro}</p>}
        {!carregando && !erro && colaboradoresFiltrados.length === 0 && (
          <p className="feedback-lista">Nenhum colaborador encontrado.</p>
        )}
        {!carregando && !erro && colaboradoresFiltrados.length > 0 && (
          <ul className="lista-colaboradores">
            {colaboradoresFiltrados.map(colab => (
              <li key={colab.cpf_colaborador} className="colaborador-item">
                <div className="colaborador-info">
                  <span className="colaborador-nome">{colab.nome_colaborador}</span>
                  <span className="colaborador-detalhe">CPF: {colab.cpf_colaborador}</span>
                  <span className="colaborador-detalhe">Cargo: {colab.cargo_colaborador}</span>
                </div>
                <div className="colaborador-acoes">
                  <button className="btn-acao btn-excluir" title="Excluir Colaborador" onClick={() => abrirModalExclusao(colab)}>
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
