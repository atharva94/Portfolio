import './style.css';

const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
const submitButton = form?.querySelector('button[type="submit"]');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.reportValidity() || !status || !submitButton) return;

  status.textContent = 'Sending your message…';
  status.classList.remove('form-status-error', 'form-status-success');
  submitButton.disabled = true;

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const result = await response.json();

    if (!response.ok) {
      status.textContent = result.error || 'Your message could not be sent. Please try again.';
      status.classList.add('form-status-error');
      return;
    }

    status.textContent = result.message;
    status.classList.add('form-status-success');
    form.reset();
  } catch {
    status.textContent = 'Could not reach the contact service. Check your connection and try again.';
    status.classList.add('form-status-error');
  } finally {
    submitButton.disabled = false;
  }
});
