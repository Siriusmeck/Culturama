document.addEventListener('DOMContentLoaded', function() {

  /* ==============================================
     PEGANDO AS PEÇAS DO HTML
     ==============================================
  */
  const entryForm = document.getElementById('entryForm');
  const entriesList = document.getElementById('entriesList');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const tabs = document.querySelectorAll('.tabs button');
  const categorySelect = document.getElementById('category');
  const titleInput = document.getElementById('title');
  const genreInput = document.getElementById('genre');
  const apiSearchBtn = document.getElementById('apiSearchBtn');
  const apiResults = document.getElementById('apiResults');
  
  /* ==============================================
     MEMÓRIA DO APLICATIVO
     ==============================================
  */
  let entries = JSON.parse(localStorage.getItem('culturalEntries')) || [];
  let currentFilter = 'todos';
  let editMode = false;
  let currentEditId = null;

  /* ==============================================
     INICIALIZAÇÃO
     ==============================================
  */
  renderEntries();
  document.getElementById('date').valueAsDate = new Date();
  updateSearchButtonVisibility();
  
  /* ==============================================
     OUVINDO AS AÇÕES DO USUÁRIO
     ==============================================
  */
  entryForm.addEventListener('submit', function(e) { e.preventDefault(); handleSubmit(); });
  searchInput.addEventListener('input', renderEntries);
  statusFilter.addEventListener('change', renderEntries);
  tabs.forEach(btn => {
    btn.addEventListener('click', function() {
      currentFilter = this.dataset.category;
      tabs.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderEntries();
    });
  });
  entriesList.addEventListener('click', handleListClick);
  apiSearchBtn.addEventListener('click', handleApiSearch);
  categorySelect.addEventListener('change', updateSearchButtonVisibility);

  /* ==============================================
     LÓGICA DA INTERFACE (UI)
     ==============================================
  */
  function updateSearchButtonVisibility() {
    const selectedCategory = categorySelect.value;
    if (selectedCategory === 'filmes' || selectedCategory === 'livros' || selectedCategory === 'mangas' || selectedCategory === 'musicas') {
        apiSearchBtn.style.display = 'block';
    } else {
        apiSearchBtn.style.display = 'none';
    }

    if (selectedCategory === 'filmes') { titleInput.placeholder = 'Título do Filme'; }
    else if (selectedCategory === 'livros') { titleInput.placeholder = 'Título do Livro'; }
    else if (selectedCategory === 'mangas') { titleInput.placeholder = 'Título do Mangá'; }
    else if (selectedCategory === 'musicas') { titleInput.placeholder = 'Nome do Álbum ou Artista'; }
    else { titleInput.placeholder = 'Título'; }
  }

  /* ==============================================
     LÓGICA DA API (O "GERENTE" DE BUSCAS)
     ==============================================
  */
  function handleApiSearch() {
    const selectedCategory = categorySelect.value;

    if (selectedCategory === 'filmes') { searchMovies(); }
    else if (selectedCategory === 'livros') { searchBooks(); }
    else if (selectedCategory === 'mangas') { searchManga(); }
    else if (selectedCategory === 'musicas') { searchMusic(); }
    else { alert('Por favor, selecione uma categoria que permita busca.'); }
  }

  /* ==============================================
     FUNÇÕES DAS APIs (Filmes, Livros, Mangás, Músicas)
     ==============================================
  */

  function searchBooks() { /* ...código da API do Google Books... */ }
  function displayBookResults(books) { /* ...código da API do Google Books... */ }
  function selectBook(event) { /* ...código da API do Google Books... */ }
  function searchManga() { /* ...código da API Jikan... */ }
  function displayMangaResults(mangas) { /* ...código da API Jikan... */ }
  function selectManga(event) { /* ...código da API Jikan... */ }
  function searchMovies() { /* ...código da API do TMDB... */ }
  function displayTmdbResults(movies) { /* ...código da API do TMDB... */ }
  function selectMovie(event) { /* ...código da API do TMDB... */ }
  function searchMusic() { /* ...código da API do Last.fm... */ }
  function displayMusicResults(albums) { /* ...código da API do Last.fm... */ }
  function selectMusic(event) { /* ...código da API do Last.fm... */ }
  
  // CÓDIGO COMPLETO DAS FUNÇÕES DE API
  function searchBooks() {
    const query = titleInput.value;
    if (!query) { alert('Por favor, digite um nome de livro para buscar.'); return; }
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}`;
    apiResults.innerHTML = '<p class="tmdb-no-results">Buscando livros...</p>';
    fetch(url).then(response => response.json()).then(data => { displayBookResults(data.items); }).catch(error => { console.error('Erro ao buscar livros:', error); });
  }
  function displayBookResults(books) {
    if (!books || books.length === 0) { apiResults.innerHTML = '<p class="tmdb-no-results">Nenhum livro encontrado.</p>'; return; }
    apiResults.innerHTML = books.slice(0, 5).map(book => {
      const bookInfo = book.volumeInfo;
      const imageUrl = bookInfo.imageLinks?.thumbnail.replace("http://", "https://") || 'https://via.placeholder.com/92x138.png?text=Sem+Capa';
      const author = bookInfo.authors ? bookInfo.authors[0] : 'Autor desconhecido';
      return `<div class="tmdb-result-item"><img src="${imageUrl}" alt="Capa de ${bookInfo.title}"><div class="tmdb-result-info"><p>${bookInfo.title} - ${author}</p><button type="button" class="select-book-btn" data-title="${bookInfo.title}" data-date="${bookInfo.publishedDate || ''}" data-poster="${imageUrl}">Selecionar</button></div></div>`}).join('');
    document.querySelectorAll('.select-book-btn').forEach(button => button.addEventListener('click', selectBook));
  }
  function selectBook(event) {
    const button = event.target;
    titleInput.value = button.dataset.title;
    document.getElementById('posterPath').value = button.dataset.poster;
    document.getElementById('date').value = button.dataset.date.substring(0, 10);
    apiResults.innerHTML = '';
  }
  function searchManga() {
    const query = titleInput.value;
    if (!query) { alert('Por favor, digite um nome de mangá para buscar.'); return; }
    const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&sfw`;
    apiResults.innerHTML = '<p class="tmdb-no-results">Buscando mangás...</p>';
    fetch(url).then(response => response.json()).then(data => { displayMangaResults(data.data); }).catch(error => { console.error('Erro ao buscar mangás:', error); });
  }
  function displayMangaResults(mangas) {
    if (mangas.length === 0) { apiResults.innerHTML = '<p class="tmdb-no-results">Nenhum mangá encontrado.</p>'; return; }
    apiResults.innerHTML = mangas.slice(0, 5).map(manga => `<div class="tmdb-result-item"><img src="${manga.images.jpg.image_url}" alt="Capa de ${manga.title}"><div class="tmdb-result-info"><p>${manga.title} (${manga.published.from ? new Date(manga.published.from).getFullYear() : 'N/A'})</p><button type="button" class="select-manga-btn" data-title="${manga.title}" data-date="${manga.published.from}" data-poster="${manga.images.jpg.image_url}">Selecionar</button></div></div>`).join('');
    document.querySelectorAll('.select-manga-btn').forEach(button => button.addEventListener('click', selectManga));
  }
  function selectManga(event) {
    const button = event.target;
    titleInput.value = button.dataset.title;
    document.getElementById('posterPath').value = button.dataset.poster;
    if (button.dataset.date && button.dataset.date !== 'null') { document.getElementById('date').value = button.dataset.date.split('T')[0]; }
    apiResults.innerHTML = '';
  }
  function searchMovies() {
    const query = titleInput.value;
    if (!query) { alert('Por favor, digite um nome de filme para buscar.'); return; }
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`;
    fetch(url).then(response => response.json()).then(data => { displayTmdbResults(data.results); }).catch(error => { console.error('Erro ao buscar filmes:', error); });
  }
  function displayTmdbResults(movies) {
    if (movies.length === 0) { apiResults.innerHTML = '<p class="tmdb-no-results">Nenhum filme encontrado.</p>'; return; }
    apiResults.innerHTML = movies.slice(0, 5).map(movie => `<div class="tmdb-result-item"><img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w92' + movie.poster_path : 'https://via.placeholder.com/92x138.png?text=Sem+Pôster'}" alt="Pôster do filme ${movie.title}"><div class="tmdb-result-info"><p>${movie.title} (${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'})</p><button type="button" class="select-movie-btn" data-title="${movie.title}" data-date="${movie.release_date}" data-poster="${movie.poster_path}">Selecionar</button></div></div>`).join('');
    document.querySelectorAll('.select-movie-btn').forEach(button => button.addEventListener('click', selectMovie));
  }
  function selectMovie(event) {
    const button = event.target;
    titleInput.value = button.dataset.title;
    if (button.dataset.date) { document.getElementById('date').value = button.dataset.date; }
    document.getElementById('posterPath').value = button.dataset.poster;
    apiResults.innerHTML = '';
  }
  function searchMusic() {
    const query = titleInput.value;
    if (!query) { alert('Por favor, digite um nome de álbum ou artista para buscar.'); return; }
    const url = `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(query)}&api_key=${LASTFM_API_KEY}&format=json`;
    apiResults.innerHTML = '<p class="tmdb-no-results">Buscando álbuns...</p>';
    fetch(url).then(response => response.json()).then(data => { displayMusicResults(data.results.albummatches.album); }).catch(error => { console.error('Erro ao buscar músicas:', error); });
  }
  function displayMusicResults(albums) {
    if (!albums || albums.length === 0) { apiResults.innerHTML = '<p class="tmdb-no-results">Nenhum álbum encontrado.</p>'; return; }
    apiResults.innerHTML = albums.slice(0, 5).map(album => {
      const imageUrl = album.image.find(img => img.size === 'large')['#text'] || 'https://via.placeholder.com/92x138.png?text=Sem+Capa';
      return `<div class="tmdb-result-item"><img src="${imageUrl}" alt="Capa de ${album.name}"><div class="tmdb-result-info"><p>${album.name} - ${album.artist}</p><button type="button" class="select-music-btn" data-title="${album.name} - ${album.artist}" data-poster="${imageUrl}">Selecionar</button></div></div>`}).join('');
    document.querySelectorAll('.select-music-btn').forEach(button => { button.addEventListener('click', selectMusic); });
  }
  function selectMusic(event) {
    const button = event.target;
    titleInput.value = button.dataset.title;
    document.getElementById('posterPath').value = button.dataset.poster;
    document.getElementById('date').value = ''; 
    apiResults.innerHTML = '';
  }

  /* ==============================================
     FUNÇÕES PRINCIPAIS DO DIÁRIO (CRUD)
     ==============================================
  */
  function handleSubmit() { /* ...código sem alterações... */ }
  function handleEdit(id) { /* ...código sem alterações... */ }
  function handleListClick(event) { /* ...código sem alterações... */ }
  function deleteEntry(id) { /* ...código sem alterações... */ }
  function renderEntries() { /* ...código sem alterações... */ }
  function getCategoryName(category) { /* ...código sem alterações... */ }
  function getStatusText(status) { /* ...código sem alterações... */ }
  function formatDate(dateString) { /* ...código sem alterações... */ }
  function saveToLocalStorage() { /* ...código sem alterações... */ }

  function handleSubmit() {
    const posterPath = document.getElementById('posterPath').value;
    if (editMode) {
      const entryIndex = entries.findIndex(entry => entry.id === currentEditId);
      if (entryIndex === -1) return;
      entries[entryIndex].category = categorySelect.value;
      entries[entryIndex].title = titleInput.value;
      entries[entryIndex].genre = genreInput.value;
      entries[entryIndex].comment = document.getElementById('comment').value;
      entries[entryIndex].date = document.getElementById('date').value;
      entries[entryIndex].status = document.querySelector('input[name="status"]:checked').value;
      entries[entryIndex].posterPath = posterPath;
    } else {
      const newEntry = {
        id: Date.now(),
        category: categorySelect.value,
        title: titleInput.value,
        genre: genreInput.value,
        comment: document.getElementById('comment').value,
        date: document.getElementById('date').value,
        status: document.querySelector('input[name="status"]:checked').value,
        posterPath: posterPath,
      };
      entries.push(newEntry);
    }
    editMode = false;
    currentEditId = null;
    document.querySelector('#entryForm button.primary').textContent = 'Adicionar';
    saveToLocalStorage();
    renderEntries();
    entryForm.reset();
    document.getElementById('date').valueAsDate = new Date();
  }
  function handleEdit(id) {
    const entryToEdit = entries.find(entry => entry.id === id);
    if (!entryToEdit) return;
    editMode = true;
    currentEditId = id;
    categorySelect.value = entryToEdit.category;
    titleInput.value = entryToEdit.title;
    genreInput.value = entryToEdit.genre || '';
    document.getElementById('comment').value = entryToEdit.comment;
    document.getElementById('date').value = entryToEdit.date;
    document.querySelector(`input[name="status"][value="${entryToEdit.status}"]`).checked = true;
    document.getElementById('posterPath').value = entryToEdit.posterPath || '';
    updateSearchButtonVisibility();
    document.querySelector('#entryForm button.primary').textContent = 'Salvar Alterações';
    titleInput.focus();
  }
  function handleListClick(event) {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.classList.contains('delete-btn')) {
      const idToDelete = Number(target.dataset.id);
      deleteEntry(idToDelete);
    }
    if (target.classList.contains('edit-btn')) {
      const idToEdit = Number(target.dataset.id);
      handleEdit(idToEdit);
    }
  }
  function deleteEntry(id) {
    if (confirm('Tem certeza que deseja deletar este item?')) {
        entries = entries.filter(entry => entry.id !== id);
        saveToLocalStorage();
        renderEntries();
    }
  }
  function renderEntries() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const filteredEntries = entries.filter(entry => {
      const matchesCategory = currentFilter === 'todos' || entry.category === currentFilter;
      const matchesSearch = (entry.title.toLowerCase().includes(searchTerm) || (entry.comment && entry.comment.toLowerCase().includes(searchTerm)) || (entry.genre && entry.genre.toLowerCase().includes(searchTerm)));
      const matchesStatus = statusValue === 'todos' || entry.status === statusValue;
      return matchesCategory && matchesSearch && matchesStatus;
    });
    if (filteredEntries.length === 0) {
      entriesList.innerHTML = `<div class="empty-state"><p>Sua estante cultural está vazia ou nenhum item corresponde aos filtros.</p></div>`;
      return;
    }
    const html = filteredEntries.map(entry => {
      let posterSrc = '';
      if (entry.posterPath && entry.posterPath !== 'null') {
        if (entry.posterPath.startsWith('http')) {
          posterSrc = entry.posterPath;
        } else {
          posterSrc = `https://image.tmdb.org/t/p/w92${entry.posterPath}`;
        }
      }
      const posterImg = posterSrc ? `<img class="entry-poster" src="${posterSrc}" alt="Pôster de ${entry.title}">` : '';
      const genreTag = entry.genre ? `<span class="entry-genre">${entry.genre}</span>` : '';
      return `<div class="entry-item">${posterImg}<div class="entry-item-content"><h3>${entry.title}</h3><div class="entry-meta"><span>${getCategoryName(entry.category)}</span>${genreTag}<span>${formatDate(entry.date)}</span></div><p class="entry-comment">${entry.comment || 'Sem comentários.'}</p><span class="entry-status status-${entry.status}">${getStatusText(entry.status)}</span></div><div class="entry-actions"><button class="edit-btn" data-id="${entry.id}" aria-label="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg></button> <button class="delete-btn" data-id="${entry.id}" aria-label="Deletar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/></svg></button></div></div>`;
    }).join('');
    entriesList.innerHTML = html;
  }
  function getCategoryName(category) {
    const names = { 'filmes': 'Filme', 'livros': 'Livro', 'mangas': 'Mangá', 'musicas': 'Música' };
    return names[category] || 'Geral';
  }
  function getStatusText(status) {
    const statusMap = { 'planejado': 'Planejado', 'em-andamento': 'Em andamento', 'concluido': 'Concluído' };
    return statusMap[status];
  }
  function formatDate(dateString) {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString.split('T')[0] + 'T00:00:00-03:00');
    return date.toLocaleDateString('pt-BR');
  }
  function saveToLocalStorage() {
    localStorage.setItem('culturalEntries', JSON.stringify(entries));
  }

  /* ==============================================
     LÓGICA DO SELETOR DE TEMA
     ==============================================
  */
  const switcher = document.querySelector('.switcher');

  function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.querySelector(`input[value="${savedTheme}"]`).checked = true;
    }
  }

  function saveTheme() {
    const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
    localStorage.setItem('theme', selectedTheme);
  }

  function trackPrevious(el) {
    const radios = el.querySelectorAll('input[type="radio"]');
    let previousValue = el.querySelector('input[type="radio"]:checked')?.getAttribute("c-option");
    if (previousValue) { el.setAttribute('c-previous', previousValue); }
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                el.setAttribute('c-previous', previousValue);
                previousValue = radio.getAttribute("c-option");
                saveTheme();
            }
        });
    });
  }

  applySavedTheme();
  trackPrevious(switcher);
  
});