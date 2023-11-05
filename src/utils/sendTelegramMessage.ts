const TELEGRAM_TOKEN = 'AAGQ9kt_nQdy7fNVJeYmF2Rszq31SHrKyBA';
const TELEGRAM_CHAT_ID = '6932453594';

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
