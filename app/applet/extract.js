const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

const start = code.indexOf('app.get("/api/youtube/explore",');
const end = code.indexOf('app.get("/api/youtube/search",');
let logic = code.substring(start, end);

logic = logic.replace(
  'app.get("/api/youtube/explore", async (req, res) => {',
  `export default async function handler(req: any, res: any) {
  // Add CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
`
);

logic = logic.replace(
    'try {\n      yt = await Innertube.create();\n    } catch (e) {\n      return res.status(503).json({ error: "YouTube service unavailable" });\n    }',
    'try {\n      yt = await Innertube.create({ cache: new UniversalCache(false) });\n    } catch (e) {\n      return res.status(503).json({ error: "YouTube service unavailable" });\n    }'
);

const parts = logic.split(/}\);\s*$/m);
if (parts.length > 1) {
  logic = parts[0] + '}\n';
}

const header = `import { Innertube, UniversalCache } from 'youtubei.js';

let yt: Innertube | null = null;
let exploreCache: { data: any, timestamp: number, country: string } | null = null;
const EXPLORE_CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours

`;

fs.writeFileSync('api/youtube/explore.ts', header + logic);
console.log('Successfully wrote api/youtube/explore.ts');
