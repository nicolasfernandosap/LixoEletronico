import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css'; // Importa o CSS se quiser deixar organizado aqui

function App() {
  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
       

        <div className="notificacoes">
          <div className="notificacao">Mensagem 1</div>
          <div className="notificacao">Mensagem 2</div>
          <div className="notificacao">Mensagem 3</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;