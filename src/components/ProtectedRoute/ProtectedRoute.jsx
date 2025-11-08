// src/components/ProtectedRoute/ProtectedRoute.jsx

import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../../supabaseClient'; // Ajuste o caminho se necessário

// Nosso novo componente recebe uma propriedade (prop) chamada 'cargosPermitidos'.
// Esta será uma lista de strings, ex: ['admin'] ou ['agente', 'motorista'].
const ProtectedRoute = ({ cargosPermitidos }) => {
  const [carregando, setCarregando] = useState(true);
  const [estaAutorizado, setEstaAutorizado] = useState(false);

  useEffect(() => {
    const verificarSessaoEAutorizacao = async () => {
      try {
        // 1. Pega a sessão do usuário logado.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        // Se NÃO houver sessão (usuário não logado), ele não está autorizado.
        if (!session) {
          setEstaAutorizado(false);
          return; // Para a execução aqui.
        }

        // Se CHEGOU AQUI, o usuário está logado. Agora, vamos verificar o cargo.
        const user = session.user;
        let cargoDoUsuario = null;

        // 2. Lógica para determinar o cargo do usuário.
        // Regra especial para o admin.
        if (user.email === 'nicolasadmin@gmail.com') {
          cargoDoUsuario = 'admin';
        } else {
          // Para outros usuários, busca o cargo na tabela 'colaboradores'.
          const { data: colaboradorData, error: colaboradorError } = await supabase
            .from('colaboradores')
            .select('cargo_colaborador')
            .eq('email_colaborador', user.email)
            .single();
          
          if (colaboradorError && colaboradorError.code !== 'PGRST116') {
            throw colaboradorError;
          }

          if (colaboradorData) {
            cargoDoUsuario = colaboradorData.cargo_colaborador;
          } else {
            // Se não está na tabela 'colaboradores', é um usuário comum.
            cargoDoUsuario = 'usuario';
          }
        }

        // 3. Compara o cargo do usuário com os cargos permitidos para a rota.
        // O método .includes() verifica se a lista de cargos permitidos contém o cargo do usuário.
        if (cargosPermitidos.includes(cargoDoUsuario)) {
          setEstaAutorizado(true); // Autorizado!
        } else {
          setEstaAutorizado(false); // Não autorizado.
        }

      } catch (error) {
        console.error("Erro na verificação de autorização:", error);
        setEstaAutorizado(false); // Assume não autorizado em caso de erro.
      } finally {
        setCarregando(false); // Termina o carregamento.
      }
    };

    verificarSessaoEAutorizacao();
  }, [cargosPermitidos]); // Re-executa se a lista de permissões mudar (raro, mas é boa prática).

  // Lógica de Renderização
  if (carregando) {
    return <div>Verificando permissões...</div>;
  }

  // Se autorizado, renderiza o conteúdo da rota. Senão, redireciona para o login.
  return estaAutorizado ? <Outlet /> : <Navigate to="/cadastro" replace />;
};

export default ProtectedRoute;
