import './css/styles.css';
import throttle from 'lodash.throttle';
import axios from 'axios';

import renderGalleryMarkup from './renderMarkup';
import * as message from './showMessage';
import { lightbox } from './lightbox';

import { formEl, galleryElContainer, inputEL, observerEl } from './refs';

formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
  e.preventDefault();
  searchPictures();
}

let totalPages = 0;
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

const clearMarkup = () => (galleryElContainer.innerHTML = '');

async function searchPictures() {
  if (!inputEL.value.trim()) {
    message.onEmpty();
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
      message.onFetchError();
      return;
    }

    appendImagesMarkup(res);
    message.onSuccess(totalHits);
  } catch (error) {
    console.log(error);
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
    if (entry.isIntersecting && entry.boundingClientRect.bottom > 300) {
      incrementPage();
      fetchPictures().then(images => {
        appendImagesMarkup(images);
        checkData(images);
        lightbox.refresh();
      });
    }
  });
};

const intersectionObserver = new IntersectionObserver(
  throttle(makeScroll, 4000),
  {
    rootMargin: '150px',
  }
);

function checkData(data) {
  totalPages = Math.ceil(data.total / perPage);
  if (page >= totalPages) {
    return message.onEndOfResults();
  }
}
