// Normalize customer selections before passing them to keyword and shopping flows.
export function customerMessageText(message: any): string {
  const selection = message.interactive?.button_reply || message.interactive?.list_reply;
  if (selection) return String(selection.id || selection.title || '').slice(0, 10000);
  if (message.button) return String(message.button.payload || message.button.text || '').slice(0, 10000);
  if (message.text?.body) return String(message.text.body).slice(0, 10000);
  if (message.type === 'location' && message.location) {
    return `Location: ${message.location.latitude}, ${message.location.longitude}${message.location.address ? ` — ${message.location.address}` : ''}`;
  }
  return `[${String(message.type || 'unsupported')} message]`;
}
