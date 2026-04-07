import { parse } from 'dotenv';
import fs from 'fs';
import { NextRequest } from 'next/server';
import { GET } from '../app/api/agent/news-cycle/route';

// Load .env
const envConfig = parse(fs.readFileSync('.env'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

async function test() {
  const req = new NextRequest('http://localhost:3000/api/agent/news-cycle');
  const res = await GET(req);
  const data = await res.json();
  console.log(data);
}
test().catch(console.error);
