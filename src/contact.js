(() => {
  'use strict';
  const form = document.getElementById('wash-form');
  if (!form) return;
  const name = document.getElementById('customer-name');
  const service = document.getElementById('service');
  const quantity = document.getElementById('quantity');
  const note = document.getElementById('collection-note');
  const receipt = document.getElementById('collection-receipt');
  const treatments = {
    banknotes: { name: 'Banknote washing', rate: 4, label: 'Number of notes', unit: 'notes' },
    coins: { name: 'Coin polishing', rate: 2, label: 'Number of coins', unit: 'coins' },
    bulk: { name: 'Bulk cash care', rate: 40, label: 'Number of batches', unit: 'batches (up to 20 items each)' }
  };
  const money = value => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value) + ' CAD';
  const requested = new URLSearchParams(window.location.search).get('service');
  if (Object.hasOwn(treatments, requested)) service.value = requested;
  function update() {
    const treatment = treatments[service.value];
    document.getElementById('quantity-label').textContent = treatment.label;
    document.getElementById('quantity-hint').textContent = service.value === 'bulk' ? 'Enter 1–1,000 whole batches. Each batch holds up to 20 items.' : 'Enter a whole number from 1 to 1,000.';
    const valid = quantity.validity.valid && quantity.value !== '';
    document.getElementById('quote').textContent = valid ? money(Number(quantity.value) * treatment.rate) : 'Enter a valid quantity';
  }
  name.addEventListener('input', () => name.setCustomValidity(name.value.trim() ? '' : 'Enter a name for your collection receipt.'));
  quantity.addEventListener('input', () => { quantity.setCustomValidity(''); update(); });
  quantity.addEventListener('invalid', () => quantity.setCustomValidity('Enter a whole number from 1 to 1,000.'));
  service.addEventListener('change', update);
  form.addEventListener('submit', event => {
    event.preventDefault();
    name.setCustomValidity(name.value.trim() ? '' : 'Enter a name for your collection receipt.');
    if (!form.reportValidity()) return;
    const treatment = treatments[service.value];
    const count = Number(quantity.value);
    const reference = 'RMW-' + (globalThis.crypto?.randomUUID ? crypto.randomUUID().slice(0, 8).toUpperCase() : Date.now().toString(36).toUpperCase());
    const entries = [ ['Reference', reference], ['Collection name', name.value.trim()], ['Treatment', treatment.name], ['Quantity', count.toLocaleString('en-CA') + ' ' + treatment.unit], ['Illustrative total', money(count * treatment.rate)], ['Status', 'Fictional record prepared — no booking made'] ];
    const details = document.getElementById('receipt-details');
    details.replaceChildren();
    for (const [label, value] of entries) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value;
      row.append(term, description);
      details.append(row);
    }
    const receiptNote = document.getElementById('receipt-note');
    receiptNote.textContent = note.value.trim() ? 'Collection note: ' + note.value.trim() : '';
    receiptNote.hidden = !note.value.trim();
    form.hidden = true;
    receipt.hidden = false;
    document.getElementById('receipt-announcement').textContent = 'Your fictional collection receipt is ready. No information was sent.';
    document.getElementById('receipt-heading').focus();
  });
  document.getElementById('print-receipt').addEventListener('click', () => window.print());
  document.getElementById('another-receipt').addEventListener('click', () => {
    form.reset();
    name.setCustomValidity('');
    quantity.setCustomValidity('');
    receipt.hidden = true;
    form.hidden = false;
    update();
    name.focus();
  });
  document.getElementById('receipt-submit').disabled = false;
  update();
})();
