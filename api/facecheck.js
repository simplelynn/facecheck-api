export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For GET requests, return a simple message
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'API is running! Use POST to submit an image_url.',
      status: 'ready' 
    });
  }
  
  // For POST requests
  if (req.method === 'POST') {
    const { image_url } = req.body || {};
    
    return res.status(200).json({
      success: true,
      message: 'POST request received successfully!',
      received_image_url: image_url || 'No image_url provided',
      timestamp: new Date().toISOString()
    });
  }
  
  // For any other method
  return res.status(405).json({ error: 'Method not allowed' });
}
