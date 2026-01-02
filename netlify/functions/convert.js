import { decode } from "https://deno.land/x/pngs@0.1.1/mod.ts";

Deno.serve(async (req) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain"
    };

    try {
        const url = new URL(req.url);
        const imgUrl = url.searchParams.get("url");
        const w = parseInt(url.searchParams.get("w") || "100");
        const h = parseInt(url.searchParams.get("h") || "100");

        if (!imgUrl) {
            return new Response("missing url param", { status: 400, headers });
        }

        const res = await fetch(imgUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!res.ok) throw new Error("fetch failed");

        const buffer = new Uint8Array(await res.arrayBuffer());
        const img = decode(buffer);

        const pixels = [];
        for (let i = 0; i < img.image.length; i += 4) {
            const r = img.image[i];
            const g = img.image[i + 1];
            const b = img.image[i + 2];
            pixels.push(`${r},${g},${b}`);
        }

        return new Response(`${img.width},${img.height};${pixels.join(";")}`, { status: 200, headers });

    } catch (e) {
        return new Response(`error: ${e.message}`, { status: 500, headers });
    }
});
