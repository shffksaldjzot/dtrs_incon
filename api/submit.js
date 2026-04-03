export default async function handler(req, res) {
  // CORS - restrict to our domain only
  const allowedOrigins = ['https://dtrs-incon.com', 'https://dotoriinteriorconsulting.vercel.app'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  // Server-side validation
  if (!data || !data.name || !data.phone || !data.location) {
    return res.status(400).json({ error: '필수 항목을 입력해주세요.' });
  }

  if (data.name.length > 50 || data.phone.length > 20 || data.location.length > 100) {
    return res.status(400).json({ error: '입력값이 너무 깁니다.' });
  }

  // Sanitize inputs
  const sanitize = (str) => String(str || '').slice(0, 500);

  // 1. Send to Google Forms
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/1GMtkv3AIvCl5XvQKULPYreiIyGiZitcerYN8S_r3dig/formResponse';

  const ENTRY_IDS = {
    name: 'entry.1750516445',
    phone: 'entry.943515076',
    location: 'entry.1680683942',
    space_type: 'entry.271598067',
    stage: 'entry.670292362',
    area: 'entry.1475256016',
    concern: 'entry.1363863516',
    docs: 'entry.1091142326',
    schedule: 'entry.19501128',
    extra: 'entry.69819870'
  };

  const params = new URLSearchParams();
  params.append(ENTRY_IDS.name, sanitize(data.name));
  params.append(ENTRY_IDS.phone, sanitize(data.phone));
  params.append(ENTRY_IDS.location, sanitize(data.location));
  if (data.space_type) params.append(ENTRY_IDS.space_type, sanitize(data.space_type));
  if (data.stage) params.append(ENTRY_IDS.stage, sanitize(data.stage));
  if (data.area) params.append(ENTRY_IDS.area, sanitize(data.area));
  if (data.concern) params.append(ENTRY_IDS.concern, sanitize(data.concern));
  if (data.docs && Array.isArray(data.docs)) {
    data.docs.slice(0, 10).forEach(doc => params.append(ENTRY_IDS.docs, sanitize(doc)));
  }
  if (data.schedule) params.append(ENTRY_IDS.schedule, sanitize(data.schedule));
  if (data.extra) params.append(ENTRY_IDS.extra, sanitize(data.extra));

  try {
    await fetch(GOOGLE_FORM_URL + '?' + params.toString());
  } catch (e) {
    // Google Forms may not return proper response, ignore
  }

  // 2. Send Slack notification (webhook URL from environment variable)
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

  if (SLACK_WEBHOOK) {
    const slackMessage = {
      text: '🔔 새 상담 신청이 접수되었습니다!',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🔔 새 상담 신청 접수', emoji: true }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*이름:*\n${sanitize(data.name)}` },
            { type: 'mrkdwn', text: `*연락처:*\n${sanitize(data.phone)}` },
            { type: 'mrkdwn', text: `*지역:*\n${sanitize(data.location)}` },
            { type: 'mrkdwn', text: `*공간 유형:*\n${sanitize(data.space_type) || '-'}` },
            { type: 'mrkdwn', text: `*현재 단계:*\n${sanitize(data.stage) || '-'}` },
            { type: 'mrkdwn', text: `*평수:*\n${sanitize(data.area) || '-'}` }
          ]
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*고민 사항:*\n${sanitize(data.concern) || '-'}` }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*보유 자료:*\n${data.docs ? data.docs.map(d => sanitize(d)).join(', ') : '-'}` },
            { type: 'mrkdwn', text: `*희망 일정:*\n${sanitize(data.schedule) || '-'}` }
          ]
        },
        ...(data.extra ? [{
          type: 'section',
          text: { type: 'mrkdwn', text: `*기타 요청:*\n${sanitize(data.extra)}` }
        }] : []),
        {
          type: 'divider'
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}` }
          ]
        }
      ]
    };

    try {
      await fetch(SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      });
    } catch (e) {
      console.error('Slack error:', e);
    }
  }

  return res.status(200).json({ success: true });
}
