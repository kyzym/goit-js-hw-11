import { Notify } from 'notiflix';
export function onFetchError() {
  error => {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
      {
        position: 'right-top',
        fontSize: '12px',
      }
    );
  };
}

export const onSuccess = totalHits => {
  Notify.success(`Hooray! We found ${totalHits} images.`, {
    position: 'right-top',
    fontSize: '14px',
  });
};

export const onEmpty = () =>
  Notify.info('If you want to see pictures, write something');
