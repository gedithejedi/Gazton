const TELEGRAM_TOKEN = '6361707999:AAE2beGY0rrMi4zdVlXrVFP81pKHYP6IEek';
const TELEGRAM_CHAT_ID = '@topGGroupReally';

export async function sendTelegramMessage(message: string): Promise<void> {
  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Failed to send message:', data);
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}
