// Tiny fetch wrapper: adds the JWT and throws readable errors
export async function api(path, { method = 'GET', body, token } = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch('/api' + path, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(body && !isForm && { 'Content-Type': 'application/json' }),
    },
    body: body && (isForm ? body : JSON.stringify(body)),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}
