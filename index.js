const Jimp = require('jimp');

module.exports = async (req, res) => {
    try {
        const { url, width, height } = req.query;
        if (!url) return res.status(400).json({ error: 'no url' });
        
        const w = parseInt(width) || 100;
        const h = parseInt(height) || 100;
        
        const img = await Jimp.read(url);
        img.resize(w, h);
        
        const pixels = [];
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const c = Jimp.intToRGBA(img.getPixelColor(x, y));
                pixels.push([c.r, c.g, c.b]);
            }
        }
        
        res.json({ pixels, width: w, height: h });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
