const sharp = require('sharp');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const { url, w = 100, h = 100 } = req.query;

        if (!url) {
            return res.status(400).send('missing url param');
        }

        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!response.ok) throw new Error('fetch failed');

        const buffer = Buffer.from(await response.arrayBuffer());
        const { data, info } = await sharp(buffer)
            .resize(Math.min(parseInt(w), 500), Math.min(parseInt(h), 500), { fit: 'fill' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const pixels = [];
        for (let i = 0; i < data.length; i += info.channels) {
            pixels.push(`${data[i]},${data[i + 1]},${data[i + 2]}`);
        }

        res.status(200).send(`${info.width},${info.height};${pixels.join(';')}`);

    } catch (e) {
        res.status(500).send(`error: ${e.message}`);
    }
};
```

Same `package.json` in root. Vercel URL would be:
```
https://your-project.vercel.app/api/convert?url=...&w=100&h=100
