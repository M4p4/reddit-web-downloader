import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { classNames } from '../lib/helper';
import produce from 'immer';
import { set, has } from 'lodash';
import { getSubredditSubmissions, getUserSubmissions } from '../lib/pushshift';
import useDownloader from '../hooks/useDownloader';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

const initialState = {
  mode: 'user',
  source: '',
  sort: '',
  isRunning: false,
  fileTypes: [
    { name: 'Images', isActive: true },
    { name: 'Videos', isActive: true },
    { name: 'Gifs', isActive: true },
  ],
  settings: {
    fileName: '',
    limit: '',
  },
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

const RedditDownloader = () => {
  const [state, updateState] = useReducer(reducer, initialState);
  const [errors, setErrors] = useState([]);
  const downloader = useDownloader();
  const { mode, isRunning } = state;
  const { isDownloading, downloadZip, settings } = downloader;

  useEffect(() => {
    setErrors([]);
  }, [mode]);

  useEffect(() => {
    if (!isDownloading && isRunning && settings) {
      downloadZip();
      updateState({ isRunning: false });
    }
  }, [isDownloading, downloadZip, isRunning, settings]);

  const updateInput = useCallback(({ target: { value, name, type } }) => {
    const updatePath = name.split('.');

    if (type === 'checkbox') {
      updateState((prevState) => ({
        [name]: !prevState[name],
      }));
      return;
    }
    if (updatePath.length === 1) {
      const [key] = updatePath;
      updateState({
        [key]: value,
      });
    }

    if (updatePath.length === 2) {
      updateState({
        _path: updatePath,
        _value: value,
      });
    }
  }, []);

  const stopDownload = async () => {
    downloader.stop();
    updateState({ isRunning: false });
  };

  const startDownload = async () => {
    const startErrors = [];
    setErrors([]);
    if (
      state.fileTypes.filter((fileType) => fileType.isActive === true)
        .length === 0
    ) {
      startErrors.push('Please select at least 1 filetype to download');
    }
    if (state.source.length === 0) {
      startErrors.push('Subreddit or User can not be empty');
    }

    if (startErrors.length > 0) {
      setErrors(startErrors);
      return;
    }

    updateState({ isRunning: true });

    let data = [];
    try {
      if (mode === 'user') {
        const res = await getUserSubmissions(state.source, 100);
        data = res.data.data;
      } else {
        const res = await getSubredditSubmissions(state.source, 1000);
        data = res.data.data;
      }
    } catch (e) {
      startErrors.push(e.message);
      updateState({ isRunning: false });
      setErrors(startErrors);
      return;
    }
    if (data.length > 0) {
      downloader.downloadQueue(data, {
        downloadGifs: state.fileTypes[2].isActive,
        downloadVideos: state.fileTypes[1].isActive,
        downloadImages: state.fileTypes[0].isActive,
        source: state.source,
      });
    }
  };

  return (
    <>
      <div className="relative">
        {isRunning ? (
          <div className="absolute w-full h-full bg-slate-900 bg-opacity-50 z-30">
            <div className="flex justify-center items-center h-full">
              <ArrowPathIcon className="w-12 h-12 animate-spin" />
            </div>
          </div>
        ) : null}
        <div className="mt-10">
          <h2 className="text-xl font-bold mt-3 mb-3 text-center">
            What do you want to download?
          </h2>
          <div className="flex flex-row justify-center space-x-10 items-center">
            <div
              onClick={() => {
                updateState({
                  mode: 'subreddit',
                  source: '',
                });
              }}
              className={classNames(
                state.mode === 'subreddit'
                  ? 'bg-sky-500 border-sky-600'
                  : 'bg-sky-600 border-sky-700',
                ' border p-2 rounded-lg w-full text-center font-semibold hover:bg-sky-500 cursor-pointer'
              )}
            >
              Subreddit
            </div>
            <div
              onClick={() => {
                updateState({
                  mode: 'user',
                  source: '',
                });
              }}
              className={classNames(
                state.mode === 'user'
                  ? 'bg-sky-500 border-sky-600'
                  : 'bg-sky-600 border-sky-700',
                'border-sky-700 border p-2 rounded-lg w-full text-center font-semibold hover:bg-sky-500 cursor-pointer'
              )}
            >
              User
            </div>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-bold mt-3 mb-3 text-center">
            Enter {state.mode === 'user' ? 'username' : 'subreddit'}
          </h2>
          <div className="w-full flex items-center justify-center">
            <input
              value={state.source}
              onChange={updateInput}
              name="source"
              type="text"
              placeholder={state.mode === 'user' ? 'username' : 'subreddit'}
              className="p-2 rounded-lg focus:outline-none text-slate-700 w-full md:w-1/2"
            />
          </div>
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-bold mt-3 mb-3 text-center">
            What files you want to download?
          </h2>
          <div className="grid grid-cols-3 gap-5">
            {state.fileTypes.map((fileType, i) => (
              <div
                key={i}
                className="border-sky-700 border-2 rounded-lg flex items-center p-4"
              >
                <label className="relative inline-flex items-center mx-auto cursor-pointer">
                  <input
                    type="checkbox"
                    value={fileType.isActive}
                    className="sr-only peer"
                    checked={fileType.isActive}
                    onChange={() => {
                      const typeCopy = state.fileTypes.slice();
                      typeCopy[i].isActive = !typeCopy[i].isActive;
                      updateState({ ...state, fileTypes: typeCopy });
                    }}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  <span className="ml-3 text-sm font-medium text-slate-200">
                    {fileType.name}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 hidden">
          <h2 className="text-xl font-bold mt-3 mb-3 text-center">Settings</h2>
        </div>
      </div>
      <div className="mt-10">
        {errors.length > 0 ? (
          <div className="text-center text-red-500 text-sm font-semibold mb-5">
            <h3 className="font-bold text-lg">
              There{' '}
              {errors.length === 1
                ? 'is an error to fix'
                : 'are a few errors to fix'}
            </h3>
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </div>
        ) : null}
        <div className="border-2 border-slate-800 rounded-lg p-3">
          <div className="font-bold">
            Crawling post {downloader.current} of {downloader.total}
          </div>
          <div className="mb-5 text-sm font-semibold text-slate-300">
            Unique files downloaded {downloader.downloadCount}
          </div>
          {isRunning ? (
            <div
              onClick={stopDownload}
              className="p-2 bg-red-600 text-center rounded-lg hover:bg-red-500 cursor-pointer"
            >
              Cancel
            </div>
          ) : (
            <div
              onClick={startDownload}
              className="p-2 bg-sky-600 text-center rounded-lg hover:bg-sky-500 cursor-pointer"
            >
              Download
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RedditDownloader;
