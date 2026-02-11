const CLIENT_ID = process.argv[2];
const CLIENT_SECRET = process.argv[3];

const response = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
  },
  body: 'grant_type=client_credentials',
});

console.log('Status:', response.status);
const data = await response.json();
console.log('Response:', data);

if (data.access_token) {
  console.log('\n✅ Clés valides! Token obtenu:', data.access_token.substring(0, 20) + '...');
} else {
  console.log('\n❌ Erreur:', data.error_description || data.error);
}
