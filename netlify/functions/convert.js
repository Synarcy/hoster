import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

Deno.serve(async (req: Request) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain"
    };

    try {
        const url = new URL(req.url);
        const imgUrl = url.searchParams.get("url");
        const w = Math.min(parseInt(url.searchParams.get("w") || "100"), 500);
        const h = Math.min(parseInt(url.searchParams.get("h") || "100"), 500);

        if (!imgUrl) {
            return new Response("missing url param", { status: 400, headers });
        }

        const res = await fetch(imgUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!res.ok) throw new Error("fetch failed");

        const buffer = new Uint8Array(await res.arrayBuffer());
        let img = await Image.decode(buffer);
        img = img.resize(w, h);

        const pixels: string[] = [];
        for (let y = 1; y <= img.height; y++) {
            for (let x = 1; x <= img.width; x++) {
                const color = img.getPixelAt(x, y);
                const r = (color >> 24) & 0xFF;
                const g = (color >> 16) & 0xFF;
                const b = (color >> 8) & 0xFF;
                pixels.push(`${r},${g},${b}`);
            }
        }

        const data = `${img.width},${img.height};${pixels.join(";")}`;
        return new Response(data, { status: 200, headers });

    } catch (e) {
        return new Response(`error: ${e.message}`, { status: 500, headers });
    }
});
