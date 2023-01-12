import axios from 'axios';

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const getQueryString = (obj) => {
  const params = Object.entries(obj).map(([key, value]) => `${key}=${value}`);
  return params.join('&');
};

export const isImage = (url) => {
  const extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.webp', '.svg'];
  const res = extensions.filter((extension) => url.indexOf(extension) !== -1);
  return res.length === 0 ? false : true;
};

export const isVideo = (url) => {
  const extensions = ['.webm', '.avi', '.mp4', '.mkv', '.mov'];
  const res = extensions.filter((extension) => url.indexOf(extension) !== -1);
  return res.length === 0 ? false : true;
};

export const isGif = (url) => {
  return url.indexOf('.gif') !== -1 && !isGifv(url);
};

export const isGifv = (url) => {
  return url.indexOf('.gifv') !== -1;
};

export const isGfycat = (url) => {
  return url.includes('//gfycat.com/') || url.includes('//www.gfycat.com/');
};

export const isRedGifs = (url) => {
  return url.includes('//redgifs.com/') || url.includes('//www.redgifs.com/');
};

export const downloadAsBase64 = async (url) => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });
  let blob = new Blob([response.data], {
    type: response.headers['content-type'],
  });
  return blob;
};

export const downloadGfycat = async (url) => {
  const gfycatId = url.toLowerCase().split('/').pop();
  try {
    const res = await axios.get(
      'https://api.gfycat.com/v1/gfycats/' + gfycatId
    );
    const mp4Url = res.data.gfyItem.mp4Url;
    return downloadAsBase64(mp4Url);
  } catch (e) {
    console.error(e.message);
    return null;
  }
};

export const downloadRedGifs = async (url) => {
  try {
    const redGifsId = url.toLowerCase().split('/').pop();
    const res = await axios.get('https://api.redgifs.com/v2/auth/temporary');
    if (res.data.token) {
      const result = await axios.get(
        `https://api.redgifs.com/v2/gifs/${redGifsId}`,
        {
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${res.data.token}`,
          },
        }
      );
      const url = result.data?.gif?.urls?.hd;
      return downloadAsBase64(url);
    }
  } catch (e) {
    console.error(e.message);
    return null;
  }
};
