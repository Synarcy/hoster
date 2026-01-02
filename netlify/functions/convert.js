const sharp = require('sharp');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
    };

    try {
        const params = event.queryStringParameters || {};
        const url = params.url;
        const w = Math.min(parseInt(params.w) || 100, 500);
        const h = Math.min(parseInt(params.h) || 100, 500);

        if (!url) {
            return { statusCode: 400, headers, body: 'missing url param' };
        }

        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) throw new Error('fetch failed');

        const buffer = Buffer.from(await res.arrayBuffer());
        const { data, info } = await sharp(buffer)
            .resize(w, h, { fit: 'fill' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const pixels = [];
        for (let i = 0; i < data.length; i += info.channels) {
            pixels.push(`${data[i]},${data[i + 1]},${data[i + 2]}`);
        }

        return {
            statusCode: 200,
            headers,
            body: `${info.width},${info.height};${pixels.join(';')}`
        };

    } catch (e) {
        return { statusCode: 500, headers, body: `error: ${e.message}` };
    }
};
