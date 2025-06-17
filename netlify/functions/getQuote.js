export async function handler(event, context) {
  try {
    const res = await fetch('https://api.quotable.io/random');
    const data = await res.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        quote: data.content,
        author: data.author
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load quote' })
    };
  }
}
