import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false, message: '비밀번호가 필요합니다.' });
  if (password === process.env.MASTER_PASSWORD) {
    return res.status(200).json({ success: true });
  }
  return res.status(401).json({ success: false, message: '비밀번호가 올바르지 않습니다.' });
} 