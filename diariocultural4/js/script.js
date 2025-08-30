// Espera a página HTML carregar completamente antes de executar qualquer código.
// É uma boa prática para garantir que todos os elementos da página existam
// antes de tentarmos manipulá-los com o JavaScript.
document.addEventListener('DOMContentLoaded', function() {

  /* ==============================================
     PEGANDO AS PEÇAS DO HTML
     ==============================================
     Aqui, guardamos em "caixas" (variáveis) as partes
     importantes do nosso HTML. Assim, fica fácil
     encontrá-las e usá-las depois.
  */
  const entryForm = document.getElementById('entryForm');         // O formulário de adicionar item
  const entriesList = document.getElementById('entriesList');     // A área onde a lista de itens vai aparecer
  const searchInput = document.getElementById('searchInput');     // O campo de busca
  const statusFilter = document.getElementById('statusFilter');   // O filtro de status (Planejado, etc.)
  const tabs = document.querySelectorAll('.tabs button');         // Todos os botões de categoria (Filmes, Livros...)

  /* ==============================================
     MEMÓRIA DO APLICATIVO
     ==============================================
     Aqui guardamos os dados que o aplicativo precisa para funcionar.
  */
  // A nossa lista principal, onde todos os registros culturais ficarão guardados.
  // Ele tenta carregar a lista salva na memória do navegador. Se não houver nada, começa com uma lista vazia [].
  let entries = JSON.parse(localStorage.getItem('culturalEntries')) || [];
  
  // Guarda qual filtro de categoria está ativo no momento. Começa mostrando "Todos".
  let currentFilter = 'todos';

  /* ==============================================
     INICIALIZAÇÃO
     ==============================================
     Coisas que acontecem assim que a página carrega.
  */
  // 1. "Desenha" a lista de itens na tela pela primeira vez.
  renderEntries();
  // 2. Coloca a data de hoje no campo de data do formulário.
  document.getElementById('date').valueAsDate = new Date();

  /* ==============================================
     OUVINDO AS AÇÕES DO USUÁRIO (EVENT LISTENERS)
     ==============================================
     Esta parte fica "escutando" o que o usuário faz na página
     (cliques, digitação, etc.) e chama a função certa para cada ação.
  */
  // Quando o formulário for enviado...
  entryForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Impede que a página recarregue (comportamento padrão de formulários).
    addEntry();         // ...chama a função para adicionar o novo item.
  });

  // Quando o usuário digitar algo no campo de busca...
  searchInput.addEventListener('input', renderEntries);
  // Quando o usuário mudar o filtro de status...
  statusFilter.addEventListener('change', renderEntries);
  // ...chama a função para redesenhar a lista com os filtros aplicados.
  
  // Para cada um dos botões de categoria...
  tabs.forEach(btn => {
    // ...fica escutando por um clique.
    btn.addEventListener('click', function() {
      currentFilter = this.dataset.category; // Atualiza o filtro atual com a categoria do botão clicado.
      tabs.forEach(b => b.classList.remove('active')); // Remove a classe 'active' de todos os botões.
      this.classList.add('active'); // Adiciona a classe 'active' apenas no botão que foi clicado.
      renderEntries(); // Redesenha a lista com o novo filtro de categoria.
    });
  });

  /* ==============================================
     FUNÇÕES (ONDE A MÁGICA ACONTECE)
     ==============================================
     Aqui ficam as funções que fazem o trabalho pesado.
  */

  /**
   * Pega os dados do formulário, cria um novo item e o adiciona à nossa lista principal.
   */
  function addEntry() {
    // Cria um objeto para guardar os dados do novo item.
    const entry = {
      id: Date.now(), // Um ID único baseado no momento atual.
      category: document.getElementById('category').value,
      title: document.getElementById('title').value,
      comment: document.getElementById('comment').value,
      date: document.getElementById('date').value,
      status: document.querySelector('input[name="status"]:checked').value, // Pega o status que está marcado.
    };
    
    entries.push(entry);      // Adiciona o novo item na nossa lista 'entries'.
    saveToLocalStorage();     // Salva a lista atualizada na memória do navegador.
    renderEntries();          // Redesenha a lista na tela para mostrar o novo item.
    entryForm.reset();        // Limpa o formulário.
    document.getElementById('date').valueAsDate = new Date(); // Coloca a data de hoje de volta.
  }

  /**
   * A função mais importante: desenha a lista de itens na tela.
   * Ela primeiro filtra a lista e depois cria o HTML para cada item.
   */
  function renderEntries() {
    const searchTerm = searchInput.value.toLowerCase(); // Pega o texto da busca e deixa em minúsculo.
    const statusValue = statusFilter.value;             // Pega o valor do filtro de status.

    // Usa a função 'filter' (