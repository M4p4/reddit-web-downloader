import axios from 'axios';
import stream from 'stream';
import { promisify } from 'util';

export const config = {
  api: {
    responseLimit: false,
  },
};

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { file } = req.query;
      const pipeline = promisify(stream.pipeline);

      const instance = axios.create({
        withCredentials: true,
      });

      const headers = {
        referer: 'https://imgur.com/',
        origin: 'https://imgur.com/',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      };

      const result = await instance.get(`https://i.imgur.com/${file}`, {
        responseType: 'stream',
        headers: headers,
      });

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename=test.mp4');

      await pipeline(result.data, res);
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
