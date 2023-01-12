import axios from 'axios';
import { getQueryString } from './helper';

const API = 'https://api.pushshift.io/reddit/search/submission?';

export const getUserSubmissions = async (user, limit) => {
  const query = { size: limit, author: user };
  const res = await axios.get(API + getQueryString(query), { timeout: 5000 });
  return res;
};

export const getSubredditSubmissions = async (subreddit, limit) => {
  const query = { size: limit, subreddit: subreddit };
  const res = await axios.get(API + getQueryString(query), { timeout: 5000 });
  return res;
};
