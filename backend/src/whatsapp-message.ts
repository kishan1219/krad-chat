// Normalize customer selections before passing them to keyword and shopping flows.

export interface ParsedPaymentInfo {
  isPayment: boolean;
  status: 'success' | 'pending' | 'failed' | 'canceled';
  referenceId: string;
  transactionId: string;
  amountPaise: number;
  currency: string;
  paymentType: 'upi' | 'meta_pay' | 'card';
  raw: Record<string, unknown>;
}

export function extractPaymentInfo(message: any): ParsedPaymentInfo | null {
  if (message.type === 'payment' && message.payment) {
    const p = message.payment;
    const amountVal = Number(p.amount?.value) || 0;
    const offset = Number(p.amount?.offset) || 100;
    // Standard WhatsApp offsets: offset=100 means value is in paise/cents
    const amountPaise = offset === 100 ? amountVal : Math.round(amountVal * 100);

    return {
      isPayment: true,
      status: p.status === 'success' || p.status === 'captured' ? 'success' :
              p.status === 'failed' ? 'failed' :
              p.status === 'canceled' ? 'canceled' : 'pending',
      referenceId: String(p.reference_id || ''),
      transactionId: String(p.transaction_id || `txn_${Date.now()}`),
      amountPaise,
      currency: String(p.currency || 'INR'),
      paymentType: p.payment_type === 'upi' ? 'upi' : 'meta_pay',
      raw: p
    };
  }

  if (message.type === 'interactive' && message.interactive?.payment_result) {
    const pr = message.interactive.payment_result;
    const amountVal = Number(pr.amount?.value) || 0;
    const offset = Number(pr.amount?.offset) || 100;
    const amountPaise = offset === 100 ? amountVal : Math.round(amountVal * 100);

    return {
      isPayment: true,
      status: pr.payment_status === 'success' ? 'success' :
              pr.payment_status === 'failed' ? 'failed' : 'pending',
      referenceId: String(pr.reference_id || ''),
      transactionId: String(pr.transaction_id || `txn_${Date.now()}`),
      amountPaise,
      currency: String(pr.currency || 'INR'),
      paymentType: 'upi',
      raw: pr
    };
  }

  return null;
}

export function customerMessageText(message: any): string {
  const paymentInfo = extractPaymentInfo(message);
  if (paymentInfo) {
    return JSON.stringify({
      type: 'payment_notification',
      status: paymentInfo.status,
      reference_id: paymentInfo.referenceId,
      transaction_id: paymentInfo.transactionId,
      amount_paise: paymentInfo.amountPaise,
      currency: paymentInfo.currency,
      payment_type: paymentInfo.paymentType
    });
  }

  const selection = message.interactive?.button_reply || message.interactive?.list_reply;
  if (selection) return String(selection.id || selection.title || '').slice(0, 10000);
  if (message.button) return String(message.button.payload || message.button.text || '').slice(0, 10000);
  if (message.text?.body) return String(message.text.body).slice(0, 10000);
  if (message.type === 'order' && message.order) {
    return JSON.stringify({
      type: 'order_notification',
      catalog_id: message.order.catalog_id,
      text: message.order.text || 'Order placed',
      product_items: message.order.product_items || []
    });
  }
  if (message.type === 'location' && message.location) {
    return `Location: ${message.location.latitude}, ${message.location.longitude}${message.location.address ? ` — ${message.location.address}` : ''}`;
  }
  return `[${String(message.type || 'unsupported')} message]`;
}
