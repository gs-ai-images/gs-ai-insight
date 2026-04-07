async function testPost() {
  try {
    const res = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Mock session headers for testing NextAuth?
        // Actually, without a real Next.js session cookie, it will reject with 401.
      },
      body: JSON.stringify({
        title: "Test Post",
        content: "Test Content",
        category: "news"
      })
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
  } catch(e) {
    console.log(e);
  }
}
testPost();
