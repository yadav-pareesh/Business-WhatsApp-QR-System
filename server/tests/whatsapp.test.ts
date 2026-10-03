import { describe, it, expect } from 'vitest';
import { normalizeWhatsAppNumber, buildWhatsAppOrderMessage, generateWhatsAppDeepLink } from '../src/utils/whatsapp';

describe('WhatsApp Utility Tests', () => {
  describe('normalizeWhatsAppNumber', () => {
    it('normalizes 10-digit Indian numbers by adding 91 prefix', () => {
      const result = normalizeWhatsAppNumber('9876543210');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('919876543210');
    });

    it('normalizes formatted numbers with spaces, + and dashes', () => {
      const result = normalizeWhatsAppNumber('+91 98765-43210');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('919876543210');
    });

    it('handles 11-digit numbers starting with 0', () => {
      const result = normalizeWhatsAppNumber('09876543210');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('919876543210');
    });

    it('rejects too short numbers', () => {
      const result = normalizeWhatsAppNumber('12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('buildWhatsAppOrderMessage', () => {
    it('generates a clean structured message with correct order details', () => {
      const msg = buildWhatsAppOrderMessage({
        businessName: 'ABC Restaurant',
        orderNumber: '#ABC-1024',
        items: [
          {
            name: 'Paneer Makhani Pizza',
            quantity: 2,
            unitPrice: 250,
            totalPrice: 500,
            variantsText: 'Medium 10"',
            addonsText: 'Extra Cheese',
          },
          {
            name: 'Coke',
            quantity: 1,
            unitPrice: 60,
            totalPrice: 60,
          },
        ],
        currencySymbol: '₹',
        subtotal: 560,
        taxAmount: 28,
        taxRate: 5,
        totalAmount: 588,
        customerName: 'Rahul',
        tableNumber: 'Table 4',
        customerNotes: 'Less spicy please',
      });

      expect(msg).toContain('ABC Restaurant');
      expect(msg).toContain('#ABC-1024');
      expect(msg).toContain('2 × Paneer Makhani Pizza (Medium 10", Extra Cheese) — ₹500');
      expect(msg).toContain('1 × Coke — ₹60');
      expect(msg).toContain('Subtotal: ₹560');
      expect(msg).toContain('Tax (5%): ₹28');
      expect(msg).toContain('Grand Total: ₹588');
      expect(msg).toContain('Name: Rahul');
      expect(msg).toContain('Table / Seat: Table 4');
      expect(msg).toContain('Notes: Less spicy please');
    });
  });

  describe('generateWhatsAppDeepLink', () => {
    it('properly encodes message URL with special characters, unicode, and newlines', () => {
      const phone = '919876543210';
      const msg = 'Hi ABC 👋\nTotal: ₹500 & 5%';
      const url = generateWhatsAppDeepLink(phone, msg);

      expect(url).toContain('https://wa.me/919876543210?text=');
      expect(url).toContain(encodeURIComponent('👋'));
      expect(url).toContain(encodeURIComponent('₹500'));
      expect(url).toContain(encodeURIComponent('&'));
    });
  });
});
