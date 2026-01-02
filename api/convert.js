const sharp = require('sharp');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
    };
    
    try {
        const { url, w = 100, h = 100 } = event.queryStringParameters || {};
        
        if (!url) {
            return { statusCode: 400, headers, body: 'missing url param' };
        }
        
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) throw new Error('fetch failed');
        
        const buffer = await res.arrayBuffer();
        const width = Math.min(parseInt(w), 500);
        const height = Math.min(parseInt(h), 500);
        
        const { data, info } = await sharp(Buffer.from(buffer))
            .resize(width, height, { fit: 'fill' })
            .raw()
            .toBuffer({ resolveWithObject: true });
        
        const pixels = [];
        for (let i = 0; i < data.length; i += info.channels) {
            pixels.push(`${data[i]},${data[i+1]},${data[i+2]}`);
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