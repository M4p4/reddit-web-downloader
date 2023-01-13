import JSZip from 'jszip';
import { useEffect, useReducer } from 'react';
import { saveAs } from 'file-saver';
import produce from 'immer';
import { set, has } from 'lodash';
import {
  downloadAsBase64,
  downloadGfycat,
  downloadRedditFile,
  downloadRedGifs,
  getMd5Checksum,
  isGfycat,
  isGif,
  isGifv,
  isImage,
  isRedGifs,
  isVideo,
} from '../lib/helper';

const initialState = {
  isDownloading: false,
  zip: null,
  current: 0,
  submissions: [],
  downloadCount: 0,
  settings: null,
  setIsReady: true,
  dublicates: [],
};

const reducer = (state, updateArg) => {
  if (updateArg.constructor === Function) {
    return { ...state, ...updateArg(state) };
  }
  if (updateArg.constructor === Object) {
    if (has(updateArg, '_path') && has(updateArg, '_value')) {
      const { _path, _value } = updateArg;
      return produce(state, (draft) => {
        set(draft, _path, _value);
      });
    } else {
      return { ...state, ...updateArg };
    }
  }
};

const useDownloader = () => {
  const [state, updateState] = useReducer(reducer, initialState);
  const {
    current,
    settings,
    submissions,
    downloadCount,
    zip,
    isDownloading,
    isReady,
    dublicates,
  } = state;

  useEffect(() => {
    const downloadPost = async () => {
      const { downloadVideos, downloadGifs, downloadImages } = settings;
      let file = null;
      let extension = '';

      if (!submissions[current]) {
        updateState({ isReady: true });
        return;
      }

      if (dublicates.includes(submissions[current].url)) {
        updateState({ isReady: true });
        return;
      }

      try {
        if (submissions[current].url.indexOf('//i.redd.it/') !== -1) {
          if (
            (downloadImages && isImage(submissions[current].url)) ||
            (downloadVideos && isVideo(submissions[current].url)) ||
            (downloadGifs && isGif(submissions[current].url))
          ) {
            file = await downloadRedditFile(submissions[current].url);
            extension = submissions[current].url.split('.').pop();
          }
        } else if (downloadImages && isImage(submissions[current].url)) {
          file = await downloadAsBase64(submissions[current].url);
          extension = submissions[current].url.split('.').pop();
        } else if (downloadVideos && isVideo(submissions[current].url)) {
          file = await downloadAsBase64(submissions[current].url);
          extension = submissions[current].url.split('.').pop();
        } else if (downloadGifs && isGif(submissions[current].url)) {
          file = await downloadAsBase64(submissions[current].url);
          extension = submissions[current].url.split('.').pop();
        } else if (downloadGifs && isGifv(submissions[current].url)) {
          file = await downloadAsBase64(submissions[current].url);
          extension = submissions[current].url.split('.').pop();
        } else if (downloadVideos && isGfycat(submissions[current].url)) {
          file = await downloadGfycat(submissions[current].url);
          extension = 'mp4';
        } else if (downloadVideos && isRedGifs(submissions[current].url)) {
          file = await downloadRedGifs(submissions[current].url);
          extension = 'mp4';
        }
      } catch (e) {
        console.error(e.message);
      }

      if (file) {
        let hash = '';
        if (
          isImage(submissions[current].url) ||
          isGif(submissions[current].url) ||
          isGifv(submissions[current].url)
        ) {
          hash = await getMd5Checksum(file);
        }
        if (hash === '' || !dublicates.includes(hash)) {
          zip.file(
            `${downloadCount + 1}_${settings.source}.${extension}`,
            file,
            {
              binary: true,
              date: new Date(submissions[current].utc_datetime_str),
            }
          );
          updateState({ downloadCount: downloadCount + 1 });
        }
        const newDublicates = dublicates.slice();
        newDublicates.push(submissions[current].url);
        newDublicates.push(hash);
        updateState({ dublicates: newDublicates });
      } else {
        console.log(submissions[current].url);
      }
      updateState({ isReady: true });
    };

    if (!settings || submissions.length === 0 || isReady) return;
    downloadPost();
  }, [current, settings, submissions, isReady, downloadCount, zip, dublicates]);

  useEffect(() => {
    if (
      isDownloading &&
      submissions.length > 0 &&
      current < submissions.length &&
      isReady
    ) {
      updateState({ isReady: false, current: current + 1 });
    }
    if (current === submissions.length) {
      updateState({ isDownloading: false });
    }
  }, [submissions, isDownloading, current, isReady]);

  const downloadZip = () => {
    updateState({
      settings: null,
      downloadCount: 0,
      isDownloading: false,
      dublicates: [],
      current: 0,
      submissions: [],
    });
    zip
      .generateAsync({
        type: 'blob',
      })
      .then(function (content) {
        saveAs(content, `${settings.source}.zip`);
      });
  };

  const downloadQueue = (submissions, settings) => {
    updateState({
      isDownloading: true,
      settings,
      submissions,
      downloadCount: 0,
      dublicates: [],
      current: 0,
      zip: new JSZip(),
    });
  };

  const stop = () => {
    updateState({
      settings: null,
      isDownloading: false,
      zip: null,
      downloadCount: 0,
      dublicates: [],
      current: 0,
      submissions: [],
    });
  };

  return {
    total: submissions.length,
    current,
    isDownloading,
    downloadQueue,
    downloadCount,
    downloadZip,
    settings,
    stop,
  };
};

export default useDownloader;
