import axios from 'axios';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { id } = req.query;

      const instance = axios.create({
        withCredentials: true,
      });

      const headers = {
        referer: 'https://www.redgifs.com/',
        origin: 'https://www.redgifs.com',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      };

      const resultAuth = await instance.get(
        'https://api.redgifs.com/v2/auth/temporary',
        { headers: headers }
      );

      const resApi = await instance.get(
        `https://api.redgifs.com/v2/gifs/${id}`,
        {
          headers: {
            ...headers,
            'content-type': 'application/json',
            Authorization: `Bearer ${resultAuth.data.token}`,
          },
        }
      );
      const srcUrl = resApi.data?.gif?.urls?.hd;

      const result = await instance.get(srcUrl, {
        responseType: 'stream',
        headers: headers,
      });
      return res.status(200).send(result.data);
    }
  } catch (e) {
    console.warn(e.message);
    return res
      .status(500)
      .json({ message: 'Internal Server Error', error: e.message || 'error' });
  }
  return res.status(404).json({ message: 'Invalid request' });
};

export default handler;
