import axios from 'axios';

export { fetchPictures };

axios.defaults.baseURL = 'https://pixabay.com/api/';
const KEY = '30138376-6df292770cccddd83200d4f36';

async function fetchPictures(name, page, perPage) {
  try {
    const response = await axios.get(
      `?key=${KEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    );
    return await response.data;
  } catch (error) {
    console.log(error.message);
  }
}
