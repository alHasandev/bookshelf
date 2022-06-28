document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('form-add-book');
  const searchForm = document.getElementById('form-search-book')
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
    submitForm.reset();
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  })

  searchForm.addEventListener('reset', function (event) {
    renderData();
  })

  // Render data from local storage
  if (checkStorage()) { 
    loadDataFromStorage();
  }

  document.addEventListener(RENDER_EVENT, function (event) {
    // Save books to local storage with message
    saveData({ message: event.detail?.message, alertType: event.detail?.alertType });

    renderData();
  });

  document.addEventListener(SAVED_EVENT, function (event) {
    if (!event.detail?.message) return;
    showAlert(event.detail?.message, event.detail?.alertType);
  });

});
