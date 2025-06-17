export async function handler(event, context) {
  try {
    const response = await fetch('https://api.quotable.io/random?tags=inspirational');
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',  // ← This fixes CORS
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch quote' }),
    };
  }
}
