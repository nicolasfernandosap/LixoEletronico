import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './IconeMenuChamadosPendentes.css';
import { FaClipboardList, FaSpinner, FaUser, FaIdCard, FaClock, FaCheckCircle, FaEye, FaSearch, FaTimes } from 'react-icons/fa';

const STATUS_PENDENTE_ID = 1;

const IconeMenuChamadosPendentes = () => {
  const [ordens, setOrdens] = useState([]);
  const [ordensFiltradas, setOrdensFiltradas] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotoVisivel, setFotoVisivel] = useState(null);

  const buscarOrdensPendentes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          id_ref_ordem_servico, 
          numero_os, 
          descricao, 
          data_criacao,
          mensagem,
          foto_armazenamento,
          usuarios (nome_completo, cpf),
          tipos_servicos (tipo_servico), 
          equipamentos_tipos (equipamento_tipo), 
          status: status_da_os (status_os)
        `)
        .eq('status_os', STATUS_PENDENTE_ID) 
        .order('data_criacao', { ascending: true });

      if (error) throw error;
      
      setOrdens(data || []);
      setOrdensFiltradas(data || []);

    } catch (err) {
      console.error('Erro ao buscar ordens pendentes:', err);
      setError('Não foi possível carregar os chamados pendentes. Tente novamente.');
      setOrdens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarOrdensPendentes();
  }, [buscarOrdensPendentes]);

  useEffect(() => {
    const termo = busca.toLowerCase();
    if (termo === '') {
      setOrdensFiltradas(ordens);
      return;
    }
    const filtradas = ordens.filter(ordem => {
      const nomeUsuario = ordem.usuarios?.nome_completo?.toLowerCase() || '';
      const cpfUsuario = ordem.usuarios?.cpf?.toLowerCase() || '';
      const numeroOs = ordem.numero_os ? ordem.numero_os.toString().padStart(4, '0') : '';
      return nomeUsuario.includes(termo) || cpfUsuario.includes(termo) || numeroOs.includes(termo);
    });
    setOrdensFiltradas(filtradas);
  }, [busca, ordens]);

  const formatarData = (dataString) => {
    if (!dataString) return 'Não definida';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="chamados-pendentes-container loading-state">
        <FaSpinner className="spinner-icon" />
        <h2>Carregando Chamados Pendentes...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chamados-pendentes-container error-state">
        <h2>Erro ao Carregar</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="chamados-pendentes-container">
      <h2><FaClipboardList /> Chamados Pendentes ({ordens.length})</h2>
      
      <div className="campo-busca">
        <FaSearch className="icone-busca" />
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou OS..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <div className="linha-separadora"></div>

      {ordens.length === 0 ? (
        <div className="sem-chamados">
          <FaCheckCircle className="check-icon" />
          <p>Parabéns! Não há chamados pendentes no momento.</p>
        </div>
      ) : ordensFiltradas.length === 0 ? (
        <p className="nenhum-resultado">Nenhum chamado encontrado para o termo de busca.</p>
      ) : (
        <div className="ordens-pendentes-grid">
          {ordensFiltradas.map(ordem => (
            <div key={ordem.id_ref_ordem_servico} className="ordem-card-pendente">
              {ordem.foto_armazenamento && (
                <FaEye 
                  className="icone-visualizar-foto" 
                  title="Visualizar Foto" 
                  onClick={() => setFotoVisivel(ordem.id_ref_ordem_servico)}
                />
              )}
              
              {/* --- CORREÇÃO DE LAYOUT AQUI --- */}
              <div className="ordem-header-pendente">
                {/* Novo container para agrupar status e número da OS */}
                <div className="ordem-info-principal">
                  <span className="status-badge-pendente">
                    {ordem.status?.status_os || 'Status Desconhecido'}
                  </span>
                  <span className="ordem-numero-pendente">
                    OS: {ordem.numero_os ? ordem.numero_os.toString().padStart(4, '0') : '—'}
                  </span>
                </div>
                {/* O ícone do olho agora fica sozinho à direita, pois o container acima ocupa o espaço à esquerda */}
              </div>

              <div className="ordem-body-pendente">
                <p className="ordem-descricao-pendente"><strong>Descrição:</strong> {ordem.descricao}</p>
                <p className="ordem-tipo-pendente"><strong>Serviço:</strong> {ordem.tipos_servicos?.tipo_servico || 'Não definido'}</p>
                <p className="ordem-equipamento-pendente"><strong>Equipamento:</strong> {ordem.equipamentos_tipos?.equipamento_tipo || 'Não definido'}</p>
                {ordem.mensagem && <p className="ordem-observacoes"><strong>Obs. Adicionais:</strong> {ordem.mensagem}</p>}
              </div>

              <div className="ordem-footer-pendente">
                <div className="usuario-info">
                  <p><FaUser /> <strong>Usuário:</strong> {ordem.usuarios?.nome_completo || 'Usuário Não Encontrado'}</p>
                  <p><FaIdCard /> <strong>CPF:</strong> {ordem.usuarios?.cpf || 'Não Informado'}</p>
                </div>
                <small className="data-criacao-pendente"><FaClock /> Criado em: {formatarData(ordem.data_criacao)}</small>
              </div>

              {fotoVisivel === ordem.id_ref_ordem_servico && (
                <div className="foto-overlay" onClick={() => setFotoVisivel(null)}>
                  <div className="foto-overlay-content" onClick={(e) => e.stopPropagation()}>
                    <img src={ordem.foto_armazenamento} alt="Foto do problema" />
                    <button className="btn-fechar-foto" onClick={() => setFotoVisivel(null)}>
                      <FaTimes /> Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IconeMenuChamadosPendentes;
