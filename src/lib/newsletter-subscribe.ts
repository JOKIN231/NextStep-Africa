// Cloudflare Pages Function — POST /api/newsletter-subscribe
//
// Replaces the earlier Beehiiv version — Beehiiv's signup requires Stripe
// identity verification that doesn't currently support Liberian national
// IDs. Brevo (formerly Sendinblue) is a plain email-marketing tool with no
// creator-payout system bundled in, so it doesn't have that same identity
// check for a free account.
//
// Same security pattern as every other proxy here: BREVO_API_KEY and
// BREVO_LIST_ID are Cloudflare secrets, never VITE_ variables, so the key
// never reaches the browser.

export const onRequestPost = async (context: any) => {
  const apiKey = context.env.BREVO_API_KEY;
  const listId = context.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    return new Response(JSON.stringify({ success: false, message: 'Newsletter delivery is not configured yet.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let email = '';
  try {
    const body = await context.request.json();
    email = (body?.email || '').trim().toLowerCase();
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'Invalid request.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ success: false, message: 'Please enter a valid email address.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email,
        listIds: [Number(listId)],
        updateEnabled: true, // re-subscribing someone who already exists just updates them, instead of erroring
      }),
    });

    // Brevo returns 204 (no body) if the contact already existed and was
    // just updated — that's still a success, not an error.
    if (!brevoRes.ok && brevoRes.status !== 204) {
      const errBody = await brevoRes.text();
      console.error('Brevo subscribe failed:', brevoRes.status, errBody);
      return new Response(
        JSON.stringify({ success: false, message: 'Something went wrong subscribing you. Please try again.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, message: "You're in! Check your inbox soon." }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: 'Something went wrong subscribing you. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
