const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const SEARCH_EVENT = 'search-book';
const STORAGE_KEY = 'BOOK_APPS';

const customEventWithDetail = (eventName, detail = {}) => new CustomEvent(eventName, { detail });
const renderEvent = (data) => customEventWithDetail(RENDER_EVENT, data);
const savedEvent = (data) => customEventWithDetail(SAVED_EVENT, data);

function saveData(detail) {
  if (checkStorage()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(savedEvent({ ...detail }));
  }
}

function checkStorage() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  renderData();
}

function renderData(filteredBook = null) {
  let currentBooks = books;
  if (filteredBook !== null) {
    currentBooks = filteredBook;
  }
  const uncompletedBOOKList = document.getElementById('books');
  uncompletedBOOKList.innerHTML = '';

  const completedBOOKList = document.getElementById('completed-books');
  completedBOOKList.innerHTML = '';

  for (const bookItem of currentBooks) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBOOKList.append(bookElement);
    } else {
      completedBOOKList.append(bookElement);
    }
  }
}

function addBook() {
  const bookTitle = document.getElementById('title').value;
  const bookAuthor = document.getElementById('author').value;
  const bookYear = document.getElementById('year').value;
  const bookComplete = document.getElementById('isComplete');

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookComplete.checked);
  books.push(bookObject);

  document.dispatchEvent(renderEvent({ message: `Buku "${bookObject.title}" by ${bookObject.author} berhasil ditambahkan!`, alertType: 'success' }));
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}

function getButtonElement(classNames, onClickCallback) {
  const button = document.createElement('button');
  if (Array.isArray(classNames)) {
    button.classList.add(...classNames);
  } else {
    button.classList.add(classNames);
  }

  button.addEventListener('click', onClickCallback);

  return button;
}

function getUndoButton(bookId) {
  return getButtonElement(['ml-auto', 'undo-button'], () => undoTaskFromCompleted(bookId));
}

function getTrashButton(bookId) {
  return getButtonElement(['trash-button'], () => confirmDelete(bookId));
}

function getCheckButton(bookId) {
  return getButtonElement(['ml-auto', 'check-button'], () => addTaskToCompleted(bookId));
}

function getBookInner(title, author, year) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = author;

  const textYear = document.createElement('p');
  textYear.innerText = year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);

  return textContainer;
}

function makeBook(bookObject) {
  const textContainer = getBookInner(bookObject.title, bookObject.author, bookObject.year);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = getUndoButton(bookObject.id);

    const trashButton = getTrashButton(bookObject.id);

    container.append(undoButton, trashButton);
  } else {
    const checkButton = getCheckButton(bookObject.id);

    container.append(checkButton);
  }

  return container;
}

function addTaskToCompleted(bookId) {
  const bookObject = books.find(book => book.id == bookId);

  if (bookObject == null) return;

  bookObject.isCompleted = true;
  document.dispatchEvent(renderEvent({
    message: `Buku "${bookObject.title}" by ${bookObject.author} selesai dibaca!`, alertType: 'success'
  }));
}

function removeTaskFromCompleted(bookId) {
  const bookObject = books.find(book => book.id == bookId)
  const bookIndex = books.findIndex(book => book.id == bookId);

  if (bookIndex === -1) return;

  books.splice(bookIndex, 1);
  document.dispatchEvent(renderEvent({ message: `Buku "${bookObject.title}" by ${bookObject.author} berhasil dihapus!`, alertType: 'danger' }));
}

function undoTaskFromCompleted(bookId) {
  const bookTarget = books.find(book => book.id == bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(renderEvent({ message: `Buku "${bookTarget.title}" by ${bookTarget.author} dipindahkan ke rak belum selesai!`, alertType: 'warning' }));
}

function searchBook() {
  const bookTitle = document.getElementById('search-title').value;
  if (!bookTitle) return;

  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(bookTitle.toLowerCase()));
  renderData(filteredBooks);
  const bookCount = filteredBooks.length
  showAlert(`Pencarian judul "${bookTitle}". ${bookCount} ditemukan!`, bookCount > 0 ? 'success' : 'warning');
}

function getAlertBodyTemplate(text) {
  return `
    <section class="container bg-white shadow alert-body">
      <p class="m-0 alert-text">${text}</p>
      <span class="alert-action">!</span>
    </section>
  `;
}

function showAlert(text, type, timespan = 3000) {
  const alertContainer = document.getElementById('alert-container');
  const alertBodyTemplate = getAlertBodyTemplate(text);

  alertContainer.innerHTML = alertBodyTemplate;
  alertContainer.classList.remove('alert-success');
  alertContainer.classList.remove('alert-warning');
  alertContainer.classList.remove('alert-danger');
  alertContainer.classList.add('show', `alert-${type}`);

  if (timespan) {
    setTimeout(() => {
      alertContainer.classList.remove('show');
    }, timespan);
  }
}

function closeAlert() {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.classList.remove('show');
}

function confirmDelete(bookId) {
  const alertContainer = document.getElementById('alert-container');

  alertContainer.innerHTML = `
  <form onreset="closeAlert()" onsubmit="removeTaskFromCompleted(${bookId})" class="alert-body shadow bg-white flex-column">
    <p class="alert-text">Apakah anda yakin akan menghapus buku ini?</p>
    <div class="flex ml-auto gap-1">
      <button type="reset" class="btn btn-reset alert-btn">Tidak</button>
      <button type="submit" class="btn btn-submit alert-btn">Ya</button>
    </div>
  </form>
`

  // setTimeout(() => {
  alertContainer.classList.add('show');
  // }, 400);

}