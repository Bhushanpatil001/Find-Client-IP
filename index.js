const net = require('net');
const express = require('express');
const app = express();

app.set('trust proxy', true)

// Middleware to get IP address
app.use((req, res, next) => {
  let ipv4_address = req.headers['x-forwarded-for'] || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress;

  let ipv6_address = req.socket.address().address;

  let ipv4 = null;
  let ipv6 = null;

  // Check if the address is IPv6 and contains multiple addresses
  if (ipv6_address && ipv6_address.includes(':')) {
    ipv6 = ipv6_address; // Store IPv6 address if it exists
  }

  // If x-forwarded-for contains multiple IPs (due to proxies), pick the first one
  if (ipv4_address && ipv4_address.includes(',')) {
    ipv4_address = ipv4_address.split(',')[0].trim();
  }

  // Log the extracted addresses
  console.log('Extracted IPv4 Address:', ipv4_address);
  console.log('Extracted IPv6 Address:', ipv6_address);

  // Check if the address is valid IPv6 or IPv4 and store them
  if (net.isIPv6(ipv6_address)) {
    console.log('IPv6 Address:', ipv6_address);
    ipv6 = ipv6_address;
  }

  if (net.isIPv4(ipv4_address)) {
    console.log('IPv4 Address:', ipv4_address);
    ipv4 = ipv4_address;
  } else {
    console.log('Unknown IP Format:', ipv4_address);
  }

  // Attach IPv4 and IPv6 to the request object
  req.ipv4 = ipv4;
  req.ipv6 = ipv6;

  next();
});

// Route to send both IPv4 and IPv6 in the JSON response
app.get('/', (req, res) => {
  res.json({
    ipv4: req.ipv4 || 'No IPv4 found',
    ipv6: req.ipv6 || 'No IPv6 found'
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
