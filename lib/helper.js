import axios from 'axios';
import md5Hex from 'md5-hex';

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
    const response = await axios.get(`/api/redgifs/${redGifsId}`, {
      responseType: 'arraybuffer',
    });
    let blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });
    return blob;
  } catch (e) {
    console.error(e.message);
    return null;
  }
};

export const downloadRedditFile = async (url) => {
  try {
    const fileName = url.toLowerCase().split('/').pop();
    const response = await axios.get(`/api/reddit/${fileName}`, {
      responseType: 'arraybuffer',
    });
    let blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });
    return blob;
  } catch (e) {
    console.error(e.message);
    return null;
  }
};

export const getMd5Checksum = async (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = () => {
      const arrayBuffer = reader.result;
      const wordArray = new Uint8Array(arrayBuffer);
      const hash = md5Hex(wordArray);
      resolve(hash);
    };
  });
};
