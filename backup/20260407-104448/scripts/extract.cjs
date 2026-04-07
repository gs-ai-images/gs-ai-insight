const str = "CBMiJWh0dHBzOi8vd3d3LmZldHYuY28ua3IvbmV3cy8xMjQ1MzLSAQA";
try {
  let decoded = Buffer.from(str.substring(4), 'base64').toString('utf8');
  let match = decoded.match(/(https?:\/\/[a-zA-Z0-9\-.\/?&_=]+)/);
  console.log(match ? match[1] : null);
} catch(e) {
  console.error(e);
}
