import './css/styles.css';
import { fetchPictures } from './fetchPictures.js';
import Notiflix from 'notiflix';
import { renderGallery } from './renderGallery.js';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more-btn'),
};

const endSearch = document.querySelector('.end-search');

refs.loadMoreBtn.classList.add('is-hidden');
// endSearch.classList.add('is-hidden');
let galleryImg = new SimpleLightbox('.gallery a', {
  /* options */ enableKeyboard: true,
});
refs.gallery.innerHTML = '';
let name = '';
let perPage = 40;
let page = 0;
let totalPages = 0;

refs.form.addEventListener('submit', onPictureInput);
refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

function onPictureInput(evt) {
  evt.preventDefault();
  // loadMoreBtn.classList.remove('is-hidden');
  endSearch.classList.add('is-hidden');
  refs.loadMoreBtn.classList.add('is-hidden');
  window.scrollTo({ top: 0 });
  page = 1;
  name = evt.currentTarget.elements.searchQuery.value.trim();
  refs.gallery.innerHTML = '';

  if (name === '') {
    return alertEmptyName();
  }

  fetchPictures(name, page, perPage)
    .then(data => {
      endSearch.classList.add('is-hidden');
      refs.gallery.innerHTML = '';

      if (data.totalHits === 0) {
        alertNotFoundImages();
      } else {
        refs.gallery.insertAdjacentHTML('beforeend', renderGallery(data.hits));

        alertImagesFound(data);
        // simpleLightBox = new SimpleLightbox('.gallery a', {
        //   captions: true,
        //   captionsData: 'alt',
        //   captionDelay: 250,
        // })
        galleryImg.refresh();

        if (data.totalHits > perPage) {
          loadMoreBtn.classList.remove('is-hidden');
        }
      }
    })
    .catch(error => console.log(error));
}

function onLoadMoreBtnClick() {
  page += 1;
  // galleryImg.destroy();

  fetchPicturs(name, page, perPage).then(data => {
    refs.gallery.insertAdjacentHTML('beforeend', renderGallery(data.hits));
    galleryImg.refresh();

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    totalPages = Math.ceil(data.totalHits / perPage);
    if (page >= totalPages) {
      // endSearch.classList.remove('is-hidden');
      loadMoreBtn.classList.add('is-hidden');
      alertEndOfSearch();
    }
  });
}
function alertEmptyName() {
  Notiflix.Notify.failure(
    `The object name is not valid. The name cannot be empty.`
  );
}
function alertNotFoundImages() {
  Notiflix.Notify.failure(
    `Sorry, there are no images matching your search query. Please try again.`
  );
}
function alertImagesFound(data) {
  Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
}
function alertEndOfSearch() {
  Notiflix.Notify.info(
    `We're sorry, but you've reached the end of search results.`,
    {
      position: 'center-bottom',
      width: '420px',
    }
  );
}
