# Security Basics (2.2.1)

To guard against injection attacks, the application now ships with a strict Content Security Policy.
The policy allows resources only from the same origin and permits web workers from `blob:` URLs:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; worker-src blob:">
```

A small module `cspNonce.js` generates a random nonce on page load and adds it to any inline script tags.
This prepares the code base for future CSP policies that require nonces.

Verify the policy by opening DevTools. No CSP errors should appear in the console when loading the page.
