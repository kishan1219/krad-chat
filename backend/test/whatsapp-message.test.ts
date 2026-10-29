import test from 'node:test';
import assert from 'node:assert/strict';
import { customerMessageText } from '../src/whatsapp-message';

test('interactive selections use stable action IDs rather than translated display labels', () => {
  assert.equal(customerMessageText({ interactive: { button_reply: { id: 'CHECKOUT', title: 'Place order' } } }), 'CHECKOUT');
  assert.equal(customerMessageText({ interactive: { list_reply: { id: 'ADD TEA 1', title: 'Tea' } } }), 'ADD TEA 1');
  assert.equal(customerMessageText({ button: { payload: 'AGENT', text: 'Support' } }), 'AGENT');
});

test('text and unsupported events retain safe deterministic representations', () => {
  assert.equal(customerMessageText({ text: { body: 'SHOP' } }), 'SHOP');
  assert.equal(customerMessageText({ type: 'image' }), '[image message]');
  assert.equal(customerMessageText({}), '[unsupported message]');
});
