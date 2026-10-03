/**
 * Normalizes phone numbers to standard international WhatsApp format without '+' or special characters.
 * Defaults to India (country code 91) if a 10-digit number is provided.
 */
export function normalizeWhatsAppNumber(rawNumber: string, defaultCountryCode = '91'): { isValid: boolean; normalized: string; error?: string } {
  if (!rawNumber || typeof rawNumber !== 'string') {
    return { isValid: false, normalized: '', error: 'WhatsApp number is required.' };
  }

  // Remove all non-digit characters
  const digitsOnly = rawNumber.replace(/\D/g, '');

  if (!digitsOnly) {
    return { isValid: false, normalized: '', error: 'Invalid number format.' };
  }

  let normalized = digitsOnly;

  // If 10 digits, assume standard Indian mobile number
  if (digitsOnly.length === 10) {
    normalized = `${defaultCountryCode}${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    // 0 followed by 10 digits
    normalized = `${defaultCountryCode}${digitsOnly.substring(1)}`;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    normalized = digitsOnly;
  }

  // Global mobile numbers range from 10 to 15 digits
  if (normalized.length < 10 || normalized.length > 15) {
    return {
      isValid: false,
      normalized,
      error: 'WhatsApp number must be between 10 and 15 digits including country code.',
    };
  }

  return { isValid: true, normalized };
}

export interface OrderMessageItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantsText?: string;
  addonsText?: string;
}

export interface WhatsAppMessagePayload {
  businessName: string;
  orderNumber: string;
  items: OrderMessageItem[];
  currencySymbol: string;
  subtotal: number;
  taxAmount?: number;
  taxRate?: number;
  deliveryFee?: number;
  totalAmount: number;
  customerName: string;
  customerPhone?: string;
  tableNumber?: string;
  deliveryAddress?: string;
  customerNotes?: string;
  customFields?: Record<string, string>;
}

/**
 * Builds a clean, professional, structured WhatsApp order message.
 */
export function buildWhatsAppOrderMessage(payload: WhatsAppMessagePayload): string {
  const {
    businessName,
    orderNumber,
    items,
    currencySymbol,
    subtotal,
    taxAmount = 0,
    taxRate = 0,
    deliveryFee = 0,
    totalAmount,
    customerName,
    customerPhone,
    tableNumber,
    deliveryAddress,
    customerNotes,
    customFields = {},
  } = payload;

  const lines: string[] = [];

  lines.push(`*New Order for ${businessName}* 🛍️`);
  lines.push(`Order ID: *${orderNumber}*`);
  lines.push('');
  lines.push('📋 *Order Summary:*');

  for (const item of items) {
    let itemLine = `• ${item.quantity} × ${item.name}`;
    const extras: string[] = [];
    if (item.variantsText) extras.push(item.variantsText);
    if (item.addonsText) extras.push(item.addonsText);
    if (extras.length > 0) {
      itemLine += ` (${extras.join(', ')})`;
    }
    itemLine += ` — ${currencySymbol}${item.totalPrice.toFixed(0)}`;
    lines.push(itemLine);
  }

  lines.push('');
  lines.push(`Subtotal: ${currencySymbol}${subtotal.toFixed(0)}`);
  
  if (taxAmount > 0) {
    lines.push(`Tax (${taxRate}%): ${currencySymbol}${taxAmount.toFixed(0)}`);
  }
  if (deliveryFee > 0) {
    lines.push(`Delivery Fee: ${currencySymbol}${deliveryFee.toFixed(0)}`);
  }
  lines.push(`*Grand Total: ${currencySymbol}${totalAmount.toFixed(0)}*`);

  lines.push('');
  lines.push('👤 *Customer Details:*');
  lines.push(`Name: ${customerName}`);

  if (customerPhone) {
    lines.push(`Phone: ${customerPhone}`);
  }
  if (tableNumber) {
    lines.push(`Table / Seat: ${tableNumber}`);
  }
  if (deliveryAddress) {
    lines.push(`Address: ${deliveryAddress}`);
  }
  if (customFields && Object.keys(customFields).length > 0) {
    for (const [key, value] of Object.entries(customFields)) {
      if (value) {
        lines.push(`${key}: ${value}`);
      }
    }
  }
  if (customerNotes) {
    lines.push(`Notes: ${customerNotes}`);
  }

  lines.push('');
  lines.push('Thank you! 🙏');

  return lines.join('\n');
}

/**
 * Generates an official WhatsApp click-to-chat deep link URL.
 */
export function generateWhatsAppDeepLink(normalizedPhone: string, message: string): string {
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}
