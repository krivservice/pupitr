// Структура данных:
// speeches = [
//   {
//     id: Number,
//     title: String,
//     description: String,
//     sets: [
//       {
//         id: Number,
//         title: String,
//         songs: [
//           {
//             songId: Number, // ID песни из общего списка
//             order: Number   // Порядок в сете
//           }
//         ]
//       }
//     ]
//   }
// ]
// songs = [
//   {
//     id: Number,
//     title: String,
//     text: String
//   }
// ]

let speeches = []; // Все выступления
let songs = []; // Все песни
let currentSpeechId = null; // Текущее выбранное выступление
let currentSetId = null; // Текущий редактируемый сет
let currentSongId = null; // Текущая редактируемая песня
let currentSetForAddingSong = null; // Текущий сет для добавления песни
let currentPerformanceSet = null; // Текущий сет в режиме выступления
let currentSongIndex = 0; // Индекс текущей песни в выступлении

// Получаем элементы DOM
const elements = {
  burger: document.querySelector('.header__burger'),
  menu: document.querySelector('.menu'),
  menuList: document.querySelector('.menu__list'),
  newSpeechBtn: document.getElementById('newSpeechBtn'),
  speechEditor: document.getElementById('speechEditor'),
  workspaceTitle: document.querySelector('.workspace__title'),
  addSetBtn: document.getElementById('addSetBtn'),
  setsContainer: document.getElementById('setsContainer'),
  setModal: document.getElementById('setModal'),
  setNameInput: document.getElementById('setNameInput'),
  closeSetBtn: document.getElementById('closeSetBtn'),
  cancelSetBtn: document.getElementById('cancelSetBtn'),
  saveSetBtn: document.getElementById('saveSetBtn'),
  addSongToSetBtn: document.getElementById('addSongToSetBtn'),
  setSongsList: document.getElementById('setSongsList'),
  // Элементы режима выступления
  performanceModal: document.getElementById('performanceModal'),
  performanceTitle: document.getElementById('performanceTitle'),
  performanceProgress: document.getElementById('performanceProgress'),
  prevSongBtn: document.getElementById('prevSongBtn'),
  nextSongBtn: document.getElementById('nextSongBtn'),
  closePerformanceBtn: document.getElementById('closePerformanceBtn'),
  currentSongTitle: document.getElementById('currentSongTitle'),
  currentSongNumber: document.getElementById('currentSongNumber'),
  currentSongText: document.getElementById('currentSongText'),
  // Элементы для песен
  songsBtn: document.getElementById('songsBtn'),
  songsModal: document.getElementById('songsModal'),
  closeSongsBtn: document.getElementById('closeSongsBtn'),
  addSongBtn: document.getElementById('addSongBtn'),
  songsList: document.getElementById('songsList'),
  songEditModal: document.getElementById('songEditModal'),
  songEditTitle: document.getElementById('songEditTitle'),
  songTitleInput: document.getElementById('songTitleInput'),
  songTextInput: document.getElementById('songTextInput'),
  cancelSongBtn: document.getElementById('cancelSongBtn'),
  saveSongBtn: document.getElementById('saveSongBtn'),
  // Элементы для модальных окон
  errorModal: document.getElementById('errorModal'),
  errorMessage: document.getElementById('errorMessage'),
  errorOkBtn: document.getElementById('errorOkBtn'),
  confirmModal: document.getElementById('confirmModal'),
  confirmMessage: document.getElementById('confirmMessage'),
  confirmCancelBtn: document.getElementById('confirmCancelBtn'),
  confirmOkBtn: document.getElementById('confirmOkBtn'),
  // Элементы для добавления песен в сет
  addSongToSetModal: document.getElementById('addSongToSetModal'),
  closeAddSongToSetBtn: document.getElementById('closeAddSongToSetBtn'),
  songSearchInput: document.getElementById('songSearchInput'),
  songsSelectorList: document.getElementById('songsSelectorList')
};



// Инициализация приложения
function init() {
  loadFromLocalStorage();
  setupEventListeners();
  renderSpeeches();
}

// Загрузка данных из localStorage
function loadFromLocalStorage() {
  const savedSpeeches = localStorage.getItem('speeches');
  if (savedSpeeches) {
    speeches = JSON.parse(savedSpeeches);
  }
  
  const savedSongs = localStorage.getItem('songs');
  if (savedSongs) {
    songs = JSON.parse(savedSongs);
  }
}

// Сохранение данных в localStorage
function saveToLocalStorage() {
  localStorage.setItem('speeches', JSON.stringify(speeches));
  localStorage.setItem('songs', JSON.stringify(songs));
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Бургер-меню для мобильных
  elements.burger?.addEventListener('click', () => {
    elements.menu.classList.toggle('menu--open');
  });

  // Создание нового выступления
  elements.newSpeechBtn.addEventListener('click', createNewSpeech);

  // Добавление нового сета
  elements.addSetBtn.addEventListener('click', addNewSet);

  // Модальное окно сета
  elements.closeSetBtn.addEventListener('click', closeSetModal);
  elements.cancelSetBtn.addEventListener('click', closeSetModal);
  elements.saveSetBtn.addEventListener('click', saveSetChanges);
  elements.addSongToSetBtn.addEventListener('click', () => openAddSongToSetModal(currentSetId));
  elements.setModal.addEventListener('click', (e) => {
    if (e.target === elements.setModal) closeSetModal();
  });

  // Обработчики для песен
  elements.songsBtn.addEventListener('click', openSongsModal);
  elements.closeSongsBtn.addEventListener('click', closeSongsModal);
  elements.addSongBtn.addEventListener('click', () => openSongEditModal());
  elements.cancelSongBtn.addEventListener('click', closeSongEditModal);
  elements.saveSongBtn.addEventListener('click', saveSongChanges);
  

  
  // Закрытие модальных окон по клику вне их
  elements.songsModal.addEventListener('click', (e) => {
    if (e.target === elements.songsModal) closeSongsModal();
  });
  elements.songEditModal.addEventListener('click', (e) => {
    if (e.target === elements.songEditModal) closeSongEditModal();
  });
  
  // Обработчики для модальных окон ошибок и подтверждений
  elements.errorOkBtn.addEventListener('click', closeErrorModal);
  elements.confirmCancelBtn.addEventListener('click', closeConfirmModal);
  elements.confirmOkBtn.addEventListener('click', () => {
    if (window.confirmCallback) {
      window.confirmCallback();
      window.confirmCallback = null;
    }
    closeConfirmModal();
  });
  
  elements.errorModal.addEventListener('click', (e) => {
    if (e.target === elements.errorModal) closeErrorModal();
  });
  elements.confirmModal.addEventListener('click', (e) => {
    if (e.target === elements.confirmModal) closeConfirmModal();
  });
  
  // Обработчики для добавления песен в сет
  elements.closeAddSongToSetBtn.addEventListener('click', closeAddSongToSetModal);
  elements.addSongToSetModal.addEventListener('click', (e) => {
    if (e.target === elements.addSongToSetModal) closeAddSongToSetModal();
  });
  elements.songSearchInput.addEventListener('input', filterSongsInSelector);
  
  // Обработчики для режима выступления
  elements.closePerformanceBtn.addEventListener('click', closePerformance);
  elements.prevSongBtn.addEventListener('click', () => navigateSong('prev'));
  elements.nextSongBtn.addEventListener('click', () => navigateSong('next'));
  
  // Горячие клавиши для навигации
  document.addEventListener('keydown', (e) => {
    if (currentPerformanceSet) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateSong('prev');
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        navigateSong('next');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePerformance();
      }
    }
  });
}

// Создание нового выступления
function createNewSpeech() {
  const newSpeech = {
    id: Date.now(), // Используем timestamp как ID
    title: `Выступление ${speeches.length + 1}`,
    description: '',
    sets: []
  };
  
  speeches.push(newSpeech);
  saveToLocalStorage();
  renderSpeeches();
  selectSpeech(newSpeech.id); // Автоматически выбираем новое выступление
}

// Отрисовка списка выступлений
function renderSpeeches() {
  elements.menuList.innerHTML = '';
  
  if (speeches.length === 0) {
    elements.menuList.innerHTML = '<div class="empty-msg">Нет выступлений</div>';
    showEmptyWorkspace();
    return;
  }

  speeches.forEach(speech => {
    const item = document.createElement('li');
    item.className = 'menu__item';
    if (speech.id === currentSpeechId) {
      item.classList.add('menu__item--active');
    }
    item.dataset.id = speech.id;

    const container = document.createElement('div');
    container.className = 'menu__item-container';

    // Название выступления
    const title = document.createElement('span');
    title.className = 'menu__item-title';
    title.textContent = speech.title;
    title.addEventListener('click', () => selectSpeech(speech.id));

    // Кнопки управления
    const actions = document.createElement('div');
    actions.className = 'menu__item-actions';

    // Кнопка добавления сета
    const addSetBtn = document.createElement('button');
    addSetBtn.innerHTML = '➕';
    addSetBtn.title = 'Добавить сет';
    addSetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addNewSetToSpeech(speech.id);
    });

    // Кнопка редактирования
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Редактировать';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startRenamingSpeech(speech.id);
    });

    // Кнопка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Удалить';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSpeech(speech.id);
    });

    actions.append(addSetBtn, editBtn, deleteBtn);
    container.append(title, actions);
    
    // Счетчик сетов
    const counter = document.createElement('div');
    counter.className = 'menu__item-counter';
    counter.textContent = `🗂️ ${speech.sets.length} сет${speech.sets.length !== 1 ? 'а' : ''}`;

    item.append(container, counter);
    elements.menuList.appendChild(item);
  });
}

// Показываем пустую рабочую область
function showEmptyWorkspace() {
  elements.workspaceTitle.textContent = 'Выберите выступление';
  elements.speechEditor.value = '';
  elements.addSetBtn.classList.add('hidden');
  elements.setsContainer.innerHTML = '';
}

// Выбор выступления для просмотра/редактирования
function selectSpeech(speechId) {
  currentSpeechId = speechId;
  const speech = speeches.find(s => s.id === speechId);
  
  if (speech) {
    elements.workspaceTitle.textContent = speech.title;
    elements.speechEditor.value = speech.description;
    elements.addSetBtn.classList.remove('hidden');
    renderSets(speech.sets);
  }
  
  renderSpeeches(); // Обновляем список, чтобы подсветить активное
}

// Отрисовка списка сетов
function renderSets(sets) {
  elements.setsContainer.innerHTML = '';
  
  if (sets.length === 0) {
    elements.setsContainer.innerHTML = '<div class="empty-msg">Сетов пока нет</div>';
    return;
  }

  sets.forEach(set => {
    const setItem = document.createElement('div');
    setItem.className = 'set-item';
    setItem.dataset.id = set.id;

    const setHeader = document.createElement('div');
    setHeader.className = 'set-item__header';

    const title = document.createElement('div');
    title.className = 'set-item__title';
    title.textContent = set.title;

    const actions = document.createElement('div');
    actions.className = 'set-item__actions';

    // Кнопка выступления
    const performBtn = document.createElement('button');
    performBtn.className = 'set-item__btn set-item__btn--perform';
    performBtn.innerHTML = '🎤';
    performBtn.title = 'Выступить';
    performBtn.addEventListener('click', () => startPerformance(set.id));

    // Кнопка редактирования
    const editBtn = document.createElement('button');
    editBtn.className = 'set-item__btn';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', () => openSetModal(set.id));

    // Кнопка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'set-item__btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.addEventListener('click', () => deleteSet(set.id));

    actions.append(performBtn, editBtn, deleteBtn);
    setHeader.append(title, actions);
    setItem.appendChild(setHeader);

    // Список песен в сете
    if (set.songs && set.songs.length > 0) {
      const songsList = document.createElement('div');
      songsList.className = 'set-songs-list';
      
      // Сортируем песни по порядку
      const sortedSongs = [...set.songs].sort((a, b) => a.order - b.order);
      
      sortedSongs.forEach((songInSet, index) => {
        const song = songs.find(s => s.id === songInSet.songId);
        if (song) {
          const songItem = document.createElement('div');
          songItem.className = 'set-song-item';
          songItem.dataset.songId = songInSet.songId;

          const songInfo = document.createElement('div');
          songInfo.className = 'set-song-item__info';

          const songNumber = document.createElement('div');
          songNumber.className = 'set-song-item__number';
          songNumber.textContent = `${songInSet.order}.`;

          const songTitle = document.createElement('div');
          songTitle.className = 'set-song-item__title';
          songTitle.textContent = song.title;

          songInfo.append(songNumber, songTitle);

          const songActions = document.createElement('div');
          songActions.className = 'set-song-item__actions';

          // Кнопки перестановки
          if (index > 0) {
            const moveUpBtn = document.createElement('button');
            moveUpBtn.className = 'set-song-item__btn';
            moveUpBtn.innerHTML = '⬆️';
            moveUpBtn.title = 'Поднять выше';
            moveUpBtn.addEventListener('click', () => moveSongInSet(set.id, songInSet.songId, 'up'));
            songActions.appendChild(moveUpBtn);
          }

          if (index < sortedSongs.length - 1) {
            const moveDownBtn = document.createElement('button');
            moveDownBtn.className = 'set-song-item__btn';
            moveDownBtn.innerHTML = '⬇️';
            moveDownBtn.title = 'Опустить ниже';
            moveDownBtn.addEventListener('click', () => moveSongInSet(set.id, songInSet.songId, 'down'));
            songActions.appendChild(moveDownBtn);
          }

          // Кнопка удаления из сета
          const removeBtn = document.createElement('button');
          removeBtn.className = 'set-song-item__btn';
          removeBtn.innerHTML = '❌';
          removeBtn.title = 'Удалить из сета';
          removeBtn.addEventListener('click', () => removeSongFromSet(set.id, songInSet.songId));
          songActions.appendChild(removeBtn);

          songItem.append(songInfo, songActions);
          songsList.appendChild(songItem);
        }
      });

      setItem.appendChild(songsList);
    } else {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'set-empty-msg';
      emptyMsg.textContent = 'В сете пока нет песен';
      setItem.appendChild(emptyMsg);
    }

    elements.setsContainer.appendChild(setItem);
  });
}

// Добавление сета в текущее выступление
function addNewSet() {
  if (!currentSpeechId) return;
  addNewSetToSpeech(currentSpeechId);
}

// Добавление сета в конкретное выступление
function addNewSetToSpeech(speechId) {
  const speech = speeches.find(s => s.id === speechId);
  if (!speech) return;

  const newSet = {
    id: Date.now(),
    title: `Сет ${speech.sets.length + 1}`,
    songs: []
  };

  speech.sets.push(newSet);
  saveToLocalStorage();
  
  // Обновляем интерфейс
  if (currentSpeechId === speechId) {
    renderSets(speech.sets);
  }
  renderSpeeches();
}

// Открытие модалки редактирования сета
function openSetModal(setId) {
  if (!currentSpeechId) return;
  
  const speech = speeches.find(s => s.id === currentSpeechId);
  if (!speech) return;

  const set = speech.sets.find(s => s.id === setId);
  if (!set) return;

  currentSetId = setId;
  elements.setNameInput.value = set.title;
  elements.setModal.classList.add('modal--active');
  
  // Отображаем песни в сете
  renderSetSongs(set);
}

// Сохранение изменений сета
function saveSetChanges() {
  if (!currentSpeechId || !currentSetId) return;
  
  const speech = speeches.find(s => s.id === currentSpeechId);
  if (!speech) return;

  const set = speech.sets.find(s => s.id === currentSetId);
  if (!set) return;

  const newTitle = elements.setNameInput.value.trim();
  if (newTitle && newTitle !== set.title) {
    set.title = newTitle;
    saveToLocalStorage();
    renderSets(speech.sets);
    renderSpeeches();
  }

  closeSetModal();
}

// Закрытие модалки сета
function closeSetModal() {
  elements.setModal.classList.remove('modal--active');
  currentSetId = null;
}

// Удаление сета
function deleteSet(setId) {
  if (!currentSpeechId) return;
  
  const speech = speeches.find(s => s.id === currentSpeechId);
  if (!speech) return;

  speech.sets = speech.sets.filter(s => s.id !== setId);
  saveToLocalStorage();
  
  renderSets(speech.sets);
  renderSpeeches();
}

// Редактирование названия выступления
function startRenamingSpeech(speechId) {
  const speech = speeches.find(s => s.id === speechId);
  if (!speech) return;

  const menuItem = document.querySelector(`.menu__item[data-id="${speechId}"]`);
  const titleSpan = menuItem.querySelector('.menu__item-title');
  const currentTitle = titleSpan.textContent;

  const input = document.createElement('input');
  input.className = 'menu__item-input';
  input.value = currentTitle;
  
  menuItem.classList.add('editing');
  titleSpan.replaceWith(input);
  input.focus();

  const saveTitle = () => {
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== currentTitle) {
      speech.title = newTitle;
      saveToLocalStorage();
    }
    menuItem.classList.remove('editing');
    renderSpeeches();
    if (currentSpeechId === speechId) {
      elements.workspaceTitle.textContent = newTitle;
    }
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveTitle();
    if (e.key === 'Escape') {
      menuItem.classList.remove('editing');
      renderSpeeches();
    }
  });

  input.addEventListener('blur', saveTitle);
}

// Удаление выступления
function deleteSpeech(speechId) {
  speeches = speeches.filter(s => s.id !== speechId);
  saveToLocalStorage();
  
  if (currentSpeechId === speechId) {
    currentSpeechId = null;
    showEmptyWorkspace();
  }
  
  renderSpeeches();
}

// Функции для управления песнями

// Открытие модального окна песен
function openSongsModal() {
  elements.songsModal.classList.add('modal--active');
  renderSongs();
}

// Закрытие модального окна песен
function closeSongsModal() {
  elements.songsModal.classList.remove('modal--active');
}

// Отрисовка списка песен
function renderSongs() {
  elements.songsList.innerHTML = '';
  
  if (songs.length === 0) {
    elements.songsList.innerHTML = '<div class="empty-msg">Песен пока нет</div>';
    return;
  }

  songs.forEach(song => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.dataset.id = song.id;

    const info = document.createElement('div');
    info.className = 'song-item__info';

    const title = document.createElement('div');
    title.className = 'song-item__title';
    title.textContent = song.title;

    // Показываем начало текста песни, если он есть
    if (song.text) {
      const textPreview = document.createElement('div');
      textPreview.className = 'song-item__text-preview';
      const preview = song.text.length > 100 ? song.text.substring(0, 100) + '...' : song.text;
      textPreview.textContent = preview;
      info.append(title, textPreview);
    } else {
      info.appendChild(title);
    }

    const actions = document.createElement('div');
    actions.className = 'song-item__actions';

    // Кнопка редактирования
    const editBtn = document.createElement('button');
    editBtn.className = 'song-item__btn';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Редактировать';
    editBtn.addEventListener('click', () => openSongEditModal(song.id));

    // Кнопка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'song-item__btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Удалить';
    deleteBtn.addEventListener('click', () => deleteSong(song.id));

    actions.append(editBtn, deleteBtn);
    songItem.append(info, actions);
    elements.songsList.appendChild(songItem);
  });
}

// Открытие модального окна редактирования песни
function openSongEditModal(songId = null) {
  currentSongId = songId;
  
  if (songId) {
    // Редактирование существующей песни
    const song = songs.find(s => s.id === songId);
    if (song) {
      elements.songEditTitle.textContent = 'Редактировать песню';
      elements.songTitleInput.value = song.title || '';
      elements.songTextInput.value = song.text || '';
    }
  } else {
    // Добавление новой песни
    elements.songEditTitle.textContent = 'Добавить песню';
    elements.songTitleInput.value = '';
    elements.songTextInput.value = '';
  }
  
  elements.songEditModal.classList.add('modal--active');
}

// Закрытие модального окна редактирования песни
function closeSongEditModal() {
  elements.songEditModal.classList.remove('modal--active');
  currentSongId = null;
}

// Сохранение изменений песни
function saveSongChanges() {
  const title = elements.songTitleInput.value.trim();
  const text = elements.songTextInput.value.trim();

  if (!title) {
    showErrorModal('Введите название песни');
    return;
  }

  if (currentSongId) {
    // Обновление существующей песни
    const song = songs.find(s => s.id === currentSongId);
    if (song) {
      song.title = title;
      song.text = text;
      console.log('Обновлена песня:', song);
    }
  } else {
    // Создание новой песни
    const newSong = {
      id: Date.now(),
      title,
      text
    };
    songs.push(newSong);
  }

  saveToLocalStorage();
  renderSongs();
  closeSongEditModal();
}

// Удаление песни
function deleteSong(songId) {
  showConfirmModal('Вы уверены, что хотите удалить эту песню?', () => {
    songs = songs.filter(s => s.id !== songId);
    saveToLocalStorage();
    renderSongs();
  });
}

// Функции для работы с модальными окнами

// Показать модальное окно ошибки
function showErrorModal(message) {
  elements.errorMessage.textContent = message;
  elements.errorModal.classList.add('modal--active');
}

// Закрыть модальное окно ошибки
function closeErrorModal() {
  elements.errorModal.classList.remove('modal--active');
}

// Показать модальное окно подтверждения
function showConfirmModal(message, callback) {
  elements.confirmMessage.textContent = message;
  window.confirmCallback = callback;
  elements.confirmModal.classList.add('modal--active');
}

// Закрыть модальное окно подтверждения
function closeConfirmModal() {
  elements.confirmModal.classList.remove('modal--active');
  window.confirmCallback = null;
}

// Отображение песен в модальном окне сета
function renderSetSongs(set) {
  elements.setSongsList.innerHTML = '';
  
  if (!set.songs || set.songs.length === 0) {
    elements.setSongsList.innerHTML = '<div class="empty-msg">В сете пока нет песен</div>';
    return;
  }

  // Сортируем песни по порядку
  const sortedSongs = [...set.songs].sort((a, b) => a.order - b.order);
  
  sortedSongs.forEach((songInSet, index) => {
    const song = songs.find(s => s.id === songInSet.songId);
    if (song) {
      const songItem = document.createElement('div');
      songItem.className = 'set-song-modal-item';
      songItem.dataset.songId = songInSet.songId;

      const songInfo = document.createElement('div');
      songInfo.className = 'set-song-modal-item__info';

      const songNumber = document.createElement('div');
      songNumber.className = 'set-song-modal-item__number';
      songNumber.textContent = `${songInSet.order}.`;

      const songTitle = document.createElement('div');
      songTitle.className = 'set-song-modal-item__title';
      songTitle.textContent = song.title;

      songInfo.append(songNumber, songTitle);

      const songActions = document.createElement('div');
      songActions.className = 'set-song-modal-item__actions';

      // Кнопки перестановки
      if (index > 0) {
        const moveUpBtn = document.createElement('button');
        moveUpBtn.className = 'set-song-modal-item__btn';
        moveUpBtn.innerHTML = '⬆️';
        moveUpBtn.title = 'Поднять выше';
        moveUpBtn.addEventListener('click', () => moveSongInSetModal(set.id, songInSet.songId, 'up'));
        songActions.appendChild(moveUpBtn);
      }

      if (index < sortedSongs.length - 1) {
        const moveDownBtn = document.createElement('button');
        moveDownBtn.className = 'set-song-modal-item__btn';
        moveDownBtn.innerHTML = '⬇️';
        moveDownBtn.title = 'Опустить ниже';
        moveDownBtn.addEventListener('click', () => moveSongInSetModal(set.id, songInSet.songId, 'down'));
        songActions.appendChild(moveDownBtn);
      }

      // Кнопка удаления из сета
      const removeBtn = document.createElement('button');
      removeBtn.className = 'set-song-modal-item__btn set-song-modal-item__btn--remove';
      removeBtn.innerHTML = '❌';
      removeBtn.title = 'Удалить из сета';
      removeBtn.addEventListener('click', () => removeSongFromSetModal(set.id, songInSet.songId));
      songActions.appendChild(removeBtn);

      songItem.append(songInfo, songActions);
      elements.setSongsList.appendChild(songItem);
    }
  });
}

// Функции для добавления песен в сеты

// Открытие модального окна добавления песни в сет
function openAddSongToSetModal(setId) {
  currentSetForAddingSong = setId;
  elements.addSongToSetModal.classList.add('modal--active');
  renderSongsSelector();
}

// Закрытие модального окна добавления песни в сет
function closeAddSongToSetModal() {
  elements.addSongToSetModal.classList.remove('modal--active');
  currentSetForAddingSong = null;
  elements.songSearchInput.value = '';
}

// Отрисовка списка песен для выбора
function renderSongsSelector() {
  elements.songsSelectorList.innerHTML = '';
  
  if (songs.length === 0) {
    elements.songsSelectorList.innerHTML = '<div class="empty-msg">Песен пока нет</div>';
    return;
  }

  const speech = speeches.find(s => s.id === currentSpeechId);
  const set = speech?.sets.find(s => s.id === currentSetForAddingSong);
  const existingSongIds = set?.songs?.map(s => s.songId) || [];

  songs.forEach(song => {
    const isAlreadyInSet = existingSongIds.includes(song.id);
    
    const songItem = document.createElement('div');
    songItem.className = 'song-selector-item';
    songItem.dataset.songId = song.id;

    const info = document.createElement('div');
    info.className = 'song-selector-item__info';

    const title = document.createElement('div');
    title.className = 'song-selector-item__title';
    title.textContent = song.title;

    // Показываем начало текста песни, если он есть
    if (song.text) {
      const textPreview = document.createElement('div');
      textPreview.className = 'song-selector-item__text-preview';
      const preview = song.text.length > 100 ? song.text.substring(0, 100) + '...' : song.text;
      textPreview.textContent = preview;
      info.append(title, textPreview);
    } else {
      info.appendChild(title);
    }

    const addBtn = document.createElement('button');
    addBtn.className = 'song-selector-item__add-btn';
    addBtn.textContent = isAlreadyInSet ? 'Уже в сете' : 'Добавить';
    addBtn.disabled = isAlreadyInSet;
    
    if (!isAlreadyInSet) {
      addBtn.addEventListener('click', () => addSongToSet(song.id));
    }

    songItem.append(info, addBtn);
    elements.songsSelectorList.appendChild(songItem);
  });
}

// Фильтрация песен в селекторе
function filterSongsInSelector() {
  const searchTerm = elements.songSearchInput.value.toLowerCase();
  const songItems = elements.songsSelectorList.querySelectorAll('.song-selector-item');
  
  songItems.forEach(item => {
    const title = item.querySelector('.song-selector-item__title').textContent.toLowerCase();
    const textPreview = item.querySelector('.song-selector-item__text-preview')?.textContent.toLowerCase() || '';
    
    if (title.includes(searchTerm) || textPreview.includes(searchTerm)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// Добавление песни в сет
function addSongToSet(songId) {
  if (!currentSpeechId || !currentSetForAddingSong) return;
  
  const speech = speeches.find(s => s.id === currentSpeechId);
  if (!speech) return;

  const set = speech.sets.find(s => s.id === currentSetForAddingSong);
  if (!set) return;

  // Инициализируем массив песен, если его нет
  if (!set.songs) {
    set.songs = [];
  }

  // Добавляем песню в конец сета
  const newSongInSet = {
    songId: songId,
    order: set.songs.length + 1
  };

  set.songs.push(newSongInSet);
  saveToLocalStorage();
  
  // Обновляем интерфейс
  renderSongsSelector();
  renderSets(speech.sets);
  
  // Если модальное окно сета открыто, обновляем его
  if (currentSetId === currentSetForAddingSong) {
    renderSetSongs(set);
  }
  
  showSuccessMessage('Песня добавлена в сет');
}

// Показать сообщение об успехе
function showSuccessMessage(message) {
  // Временно показываем сообщение (можно заменить на более красивое уведомление)
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 2000;
    font-size: 14px;
  `;
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    document.body.removeChild(successDiv);
  }, 3000);
}

// Функции для управления песнями в сетах

// Удаление песни из сета (из основного списка)
function removeSongFromSet(setId, songId) {
  showConfirmModal('Удалить эту песню из сета?', () => {
    if (!currentSpeechId) return;
    
    const speech = speeches.find(s => s.id === currentSpeechId);
    if (!speech) return;

    const set = speech.sets.find(s => s.id === setId);
    if (!set || !set.songs) return;

    // Удаляем песню из сета
    set.songs = set.songs.filter(s => s.songId !== songId);
    
    // Пересчитываем порядок
    set.songs.forEach((song, index) => {
      song.order = index + 1;
    });

    saveToLocalStorage();
    renderSets(speech.sets);
    renderSongsSelector(); // Обновляем селектор песен
    
    showSuccessMessage('Песня удалена из сета');
  });
}

// Удаление песни из сета (из модального окна)
function removeSongFromSetModal(setId, songId) {
  showConfirmModal('Удалить эту песню из сета?', () => {
    if (!currentSpeechId) return;
    
    const speech = speeches.find(s => s.id === currentSpeechId);
    if (!speech) return;

    const set = speech.sets.find(s => s.id === setId);
    if (!set || !set.songs) return;

    // Удаляем песню из сета
    set.songs = set.songs.filter(s => s.songId !== songId);
    
    // Пересчитываем порядок
    set.songs.forEach((song, index) => {
      song.order = index + 1;
    });

    saveToLocalStorage();
    renderSets(speech.sets);
    renderSongsSelector(); // Обновляем селектор песен
    renderSetSongs(set); // Обновляем модальное окно сета
    
    showSuccessMessage('Песня удалена из сета');
  });
}

// Изменение порядка песни в сете (из основного списка)
function moveSongInSet(setId, songId, direction) {
  if (!currentSpeechId) return;
  
  const speech = speeches.find(s => s.id === currentSpeechId);
  if (!speech) return;

  const set = speech.sets.find(s => s.id === setId);
  if (!set || !set.songs) return;

  // Находим текущую позицию песни
  const currentIndex = set.songs.findIndex(s => s.songId === songId);
  if (currentIndex === -1) return;

  // Определяем новую позицию
  let newIndex;
  if (direction === 'up' && currentIndex > 0) {
    newIndex = currentIndex - 1;
  } else if (direction === 'down' && currentIndex < set.songs.length - 1) {
    newIndex = currentIndex + 1;
  } else {
    return; // Нельзя двигать дальше
  }

  // Меняем местами песни
  const temp = set.songs[currentIndex];
  set.songs[currentIndex] = set.songs[newIndex];
  set.songs[newIndex] = temp;

  // Пересчитываем порядок
  set.songs.forEach((song, index) => {
    song.order = index + 1;
  });

  saveToLocalStorage();
  renderSets(speech.sets);
  
  const directionText = direction === 'up' ? 'поднята' : 'опущена';
  showSuccessMessage(`Песня ${directionText}`);
}

// Изменение порядка песни в сете (из модального окна)
function moveSongInSetModal(setId, songId, direction) {
  if (!currentSpeechId) return;
  
  const speech = speeches.find(s => s.id === currentSpeechId);
  if (!speech) return;

  const set = speech.sets.find(s => s.id === setId);
  if (!set || !set.songs) return;

  // Находим текущую позицию песни
  const currentIndex = set.songs.findIndex(s => s.songId === songId);
  if (currentIndex === -1) return;

  // Определяем новую позицию
  let newIndex;
  if (direction === 'up' && currentIndex > 0) {
    newIndex = currentIndex - 1;
  } else if (direction === 'down' && currentIndex < set.songs.length - 1) {
    newIndex = currentIndex + 1;
  } else {
    return; // Нельзя двигать дальше
  }

  // Меняем местами песни
  const temp = set.songs[currentIndex];
  set.songs[currentIndex] = set.songs[newIndex];
  set.songs[newIndex] = temp;

  // Пересчитываем порядок
  set.songs.forEach((song, index) => {
    song.order = index + 1;
  });

  saveToLocalStorage();
  renderSets(speech.sets);
  renderSetSongs(set); // Обновляем модальное окно сета
  
  const directionText = direction === 'up' ? 'поднята' : 'опущена';
  showSuccessMessage(`Песня ${directionText}`);
}

// Функции режима выступления

// Начать выступление
function startPerformance(setId) {
  if (!currentSpeechId) return;
  
  const speech = speeches.find(s => s.id === currentSpeechId);
  if (!speech) return;

  const set = speech.sets.find(s => s.id === setId);
  if (!set || !set.songs || set.songs.length === 0) {
    showErrorModal('В сете нет песен для выступления');
    return;
  }

  currentPerformanceSet = set;
  currentSongIndex = 0;
  
  // Устанавливаем заголовок выступления
  elements.performanceTitle.textContent = `${speech.title} - ${set.title}`;
  
  // Открываем модальное окно
  elements.performanceModal.classList.add('modal--active');
  
  // Показываем первую песню
  showCurrentSong();
}

// Закрыть режим выступления
function closePerformance() {
  elements.performanceModal.classList.remove('modal--active');
  currentPerformanceSet = null;
  currentSongIndex = 0;
}

// Показать текущую песню
function showCurrentSong() {
  if (!currentPerformanceSet || !currentPerformanceSet.songs) return;
  
  const sortedSongs = [...currentPerformanceSet.songs].sort((a, b) => a.order - b.order);
  const currentSongInSet = sortedSongs[currentSongIndex];
  
  if (!currentSongInSet) return;
  
  const song = songs.find(s => s.id === currentSongInSet.songId);
  if (!song) return;
  
  // Обновляем информацию о песне
  elements.currentSongTitle.textContent = song.title;
  elements.currentSongNumber.textContent = `${currentSongInSet.order}.`;
  
  // Обрабатываем текст песни
  const songText = song.text || 'Текст песни не добавлен';
  elements.currentSongText.textContent = songText;
  
  // Обновляем прогресс
  elements.performanceProgress.textContent = `Песня ${currentSongIndex + 1} из ${sortedSongs.length}`;
  
  // Обновляем состояние кнопок
  elements.prevSongBtn.disabled = currentSongIndex === 0;
  elements.nextSongBtn.disabled = currentSongIndex === sortedSongs.length - 1;
  
  // Визуальное отображение состояния кнопок
  elements.prevSongBtn.style.opacity = currentSongIndex === 0 ? '0.3' : '1';
  elements.nextSongBtn.style.opacity = currentSongIndex === sortedSongs.length - 1 ? '0.3' : '1';
}

// Навигация по песням
function navigateSong(direction) {
  if (!currentPerformanceSet || !currentPerformanceSet.songs) return;
  
  const sortedSongs = [...currentPerformanceSet.songs].sort((a, b) => a.order - b.order);
  
  if (direction === 'prev' && currentSongIndex > 0) {
    currentSongIndex--;
    showCurrentSong();
  } else if (direction === 'next' && currentSongIndex < sortedSongs.length - 1) {
    currentSongIndex++;
    showCurrentSong();
  } else if (direction === 'next' && currentSongIndex === sortedSongs.length - 1) {
    // Последняя песня - показываем сообщение о завершении
    showConfirmModal('Выступление завершено! Закрыть режим выступления?', () => {
      closePerformance();
    });
  }
}



// Запускаем приложение
init();
