import axios from 'axios';

export const config = {
  api: {
    responseLimit: false,
  },
};

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { file } = req.query;

      const instance = axios.create({
        withCredentials: true,
      });

      const headers = {
        referer: 'https://www.reddit.com/',
        origin: 'https://www.reddit.com/',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      };

      const result = await instance.get(`https://i.redd.it/${file}`, {
        responseType: 'stream',
        headers: headers,
      });

      return res.status(200).send(result.data);
    }
  } catch (e) {
    console.warn(e.message);
    return res
      .status(400)
      .json({ message: 'Internal Server Error', error: e.message || 'error' });
  }
  return res.status(404).json({ message: 'Invalid request' });
};

export default handler;
