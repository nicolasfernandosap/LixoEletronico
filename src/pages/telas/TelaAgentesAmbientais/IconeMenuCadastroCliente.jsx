import React, { useState, useEffect } from "react";
import { supabase } from "../../../../supabaseClient";
import "./IconeMenuCadastroCliente.css";
import { FaEye } from "react-icons/fa"; // 👁️ ícone de visualizar

const IconeMenuCadastroCliente = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const buscarClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select(
          "id_usuario, nome_completo, celular, endereco, cpf, numero_casa, bairro, cidade, cep, estado, email"
        );

      if (error) throw error;
      setClientes(data);
    } catch (error) {
      console.error("❌ Erro ao buscar clientes:", error.message);
    }
  };

  useEffect(() => {
    buscarClientes();
  }, []);

  return (
    <div className="clientes-container">
      <div className="clientes-card">
        <h2>Clientes Cadastrados</h2>
        <div className="linha"></div>

        {clientes.length === 0 ? (
          <p className="nenhum-cliente">Nenhum cliente encontrado.</p>
        ) : (
          <ul className="lista-clientes">
            {clientes.map((cliente) => (
              <li key={cliente.id_usuario} className="cliente-item">
                <span className="cliente-nome">{cliente.nome_completo}</span>
                <FaEye
                  className="icone-olho"
                  title="Ver detalhes"
                  onClick={() => setClienteSelecionado(cliente)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {clienteSelecionado && (
        <div className="modal-cliente">
          <div className="modal-conteudo">
            <h3>{clienteSelecionado.nome_completo}</h3>
            <div className="linha"></div>
            <p>
              <strong>Celular:</strong> {clienteSelecionado.celular || "—"}
            </p>
            <p>
              <strong>CPF:</strong> {clienteSelecionado.cpf || "—"}
            </p>
            <p>
              <strong>Endereço:</strong> {clienteSelecionado.endereco || "—"}
            </p>
            <p>
              <strong>Número:</strong> {clienteSelecionado.numero_casa || "—"}
            </p>
            <p>
              <strong>Bairro:</strong> {clienteSelecionado.bairro || "—"}
            </p>
            <p>
              <strong>Cidade:</strong> {clienteSelecionado.cidade || "—"}
            </p>
            <p>
              <strong>CEP:</strong> {clienteSelecionado.cep || "—"}
            </p>
            <p>
              <strong>Estado:</strong> {clienteSelecionado.estado || "—"}
            </p>
            <p>
              <strong>Email:</strong> {clienteSelecionado.email || "—"}
            </p>

            <button onClick={() => setClienteSelecionado(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconeMenuCadastroCliente;
