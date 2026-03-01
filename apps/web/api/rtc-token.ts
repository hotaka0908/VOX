import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RtcRole, RtcTokenBuilder } from 'agora-token';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    return res.status(500).json({
      error: 'Missing AGORA_APP_ID / AGORA_APP_CERTIFICATE',
    });
  }

  const channel = typeof req.body?.channel === 'string' ? req.body.channel.trim() : '';
  const uidRaw = req.body?.uid;
  const roleRaw = req.body?.role;
  const ttlSecondsRaw = req.body?.ttlSeconds;

  if (!channel) {
    return res.status(400).json({ error: 'channel is required' });
  }

  const uid = Number.isFinite(Number(uidRaw)) ? Number(uidRaw) : NaN;
  if (!Number.isInteger(uid) || uid < 0) {
    return res.status(400).json({ error: 'uid must be a non-negative integer' });
  }

  const ttlSeconds = Number.isFinite(Number(ttlSecondsRaw)) ? Number(ttlSecondsRaw) : 3600;
  if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0 || ttlSeconds > 24 * 3600) {
    return res.status(400).json({ error: 'ttlSeconds must be 1..86400' });
  }

  const role = roleRaw === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channel,
    uid,
    role,
    ttlSeconds,
    ttlSeconds
  );

  return res.json({ appId, token });
}
