export async function handler(event, context) {
  try {
    const res = await fetch("https://zenquotes.io/api/random");
    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        quote: data[0].q,
        author: data[0].a
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch quote" })
    };
  }
}
