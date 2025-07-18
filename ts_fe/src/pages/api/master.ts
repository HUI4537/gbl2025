import type { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/master';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // 마스터 정보 조회
    const r = await fetch(API_URL, { method: 'GET' });
    const data = await r.json();
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    // 마스터 정보 수정
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    return res.status(200).json(data);
  }
  return res.status(405).end();
}
