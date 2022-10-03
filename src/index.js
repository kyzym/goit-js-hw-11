import './css/styles.css';
import { Notify } from 'notiflix';
import throttle from 'lodash.throttle';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { formEl, galleryElContainer, inputEL, observerEl } from './refs';
import renderGalleryMarkup from './renderMarkup';
import { onFetchError, onSuccess, onEmpty } from './fetchError.js';

const clearMarkup = () => (galleryElContainer.innerHTML = '');

let lightbox = new SimpleLightbox('.gallery a', {
  enableKeyboard: true,
});

Notify.init({
  position: 'center-bottom',
  distance: '20px',
  borderRadius: '14px',
  timeout: 5000,
  clickToClose: true,
  cssAnimationStyle: 'from-bottom',
});

formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
  e.preventDefault();
  searchPictures();
}

let query = '';
let searchQuery = '';
let page = 0;
const perPage = 40;
const BASE_URL = 'https://pixabay.com/api/';
const KEY = '30138376-6df292770cccddd83200d4f36';

async function fetchPictures() {
  const url = `${BASE_URL}?key=${KEY}&q=${searchQuery}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`;
  const { data } = await axios.get(url);

  return data;
}
const incrementPage = () => (page += 1);
const resetPage = () => (page = 1);

async function searchPictures() {
  if (!inputEL.value.trim()) {
    onEmpty();
    return;
  }

  query = inputEL.value.trim();
  searchQuery = query;

  intersectionObserver.observe(observerEl);
  resetPage();
  clearMarkup();

  try {
    const res = await fetchPictures(query);
    const { totalHits, hits } = res;

    if (!hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        {
          position: 'right-top',
          fontSize: '12px',
        }
      );
      return;
    }

    appendImagesMarkup(res);
    onSuccess(totalHits);
  } catch (error) {
    onFetchError();
  }
}

function appendImagesMarkup(data) {
  galleryElContainer.insertAdjacentHTML(
    'beforeend',
    renderGalleryMarkup(data.hits)
  );

  lightbox.refresh();
}

const makeScroll = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.boundingClientRect.bottom > 200) {
      incrementPage();
      fetchPictures().then(images => {
        appendImagesMarkup(images);
        checkData(images);
        lightbox.refresh();

        // const { height: cardHeight } =
        //   galleryElContainer.firstElementChild.getBoundingClientRect();

        // window.scrollBy({
        //   top: cardHeight * 2,
        //   behavior: 'smooth',
        // });
      });
    }
  });
};

const intersectionObserver = new IntersectionObserver(
  throttle(makeScroll, 4000),
  {
    rootMargin: '100px',
  }
);

function checkData(data) {
  totalPages = Math.ceil(data.total / perPage);
  console.log(page);
  if (page >= totalPages) {
    return Notify.info(
      `We're sorry, but you've reached the end of search results.`,
      {
        position: 'center-bottom',
        width: '420px',
      }
    );
  }
}
