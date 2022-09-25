import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import './css/styles.css';
import { fetchPictures } from './fetchPictures.js';
import { renderGallery } from './renderGallery.js';
import { refs } from './refs';

refs.loadMoreBtn.classList.add('is-hidden');
refs.theEnd.classList.add('is-hidden');

let galleryImg = new SimpleLightbox('.gallery a', {
  enableKeyboard: true,
});

refs.gallery.innerHTML = '';
let name = '';
let perPage = 40;
let page = 0;
let totalPages = 0;

refs.form.addEventListener('submit', onPictureInput);
refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

function onPictureInput(e) {
  refs.theEnd.classList.add('is-hidden');
  refs.loadMoreBtn.classList.add('is-hidden');
  e.preventDefault();

  page = 1;
  name = e.currentTarget.elements.searchQuery.value.trim();
  refs.gallery.innerHTML = '';

  if (name === '') {
    return Notify.failure(
      `The object name is not valid. The name cannot be empty.`
    );
  }

  fetchPictures(name, page, perPage)
    .then(data => {
      refs.theEnd.classList.add('is-hidden');
      refs.gallery.innerHTML = '';

      if (data.totalHits === 0) {
        return Notify.failure(
          `Sorry, there are no images matching your search query. Please try again.`
        );
      } else {
        refs.gallery.insertAdjacentHTML('beforeend', renderGallery(data.hits));

        Notify.success(`Hooray! We found ${data.totalHits} images.`);

        galleryImg.refresh();

        if (data.totalHits > perPage) {
          refs.loadMoreBtn.classList.remove('is-hidden');
        }
      }
    })
    .catch(error => console.log(error));
}

function onLoadMoreBtnClick() {
  page += 1;

  fetchPictures(name, page, perPage).then(data => {
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
      refs.loadMoreBtn.classList.add('is-hidden');
      return Notify.info(
        `We're sorry, but you've reached the end of search results.`,
        {
          position: 'center-bottom',
          width: '420px',
        }
      );
    }
  });
}
