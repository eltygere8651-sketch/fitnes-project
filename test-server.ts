import express from 'express';
import youtubedl from 'youtube-dl-exec';
import https from 'https';

const app = express();

app.get('/audio/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        console.log("Fetching url for", videoId);
        const data = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
          dumpJson: true,
          noWarnings: true,
        });
        const url = (data as any).formats?.find((f: any) => f.vcodec === 'none' && f.acodec !== 'none').url;
        
        if (!url) return res.status(404).send("no url");

        const range = req.headers.range;
        const headers: any = {};
        if (range) headers['Range'] = range;

        https.get(url, { headers }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res);
        }).on('error', (err) => {
            console.error('Proxy Error:', err);
            res.status(500).send("proxy error");
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("error");
    }
});

app.listen(3001, () => {
   console.log('Listening 3001');
});
