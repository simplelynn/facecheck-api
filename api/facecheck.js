export default async function handler(req, res) {
  // Enable CORS for Bubble
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image_url } = req.body;
  
  // Return debug info if no image_url provided
  if (!image_url) {
    return res.status(200).json({ 
      error: 'No image_url provided',
      debug: 'Please provide an image_url in the request body',
      expected_format: {
        image_url: "https://example.com/image.jpg"
      }
    });
  }

  try {
    // For now, let's just test if we can download the image
    console.log('Testing image download from:', image_url);
    
    const imageResponse = await fetch(image_url);
    
    if (!imageResponse.ok) {
      return res.status(400).json({ 
        error: 'Failed to download image',
        status: imageResponse.status,
        image_url: image_url
      });
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Return success with debug info
    return res.status(200).json({
      success: true,
      message: 'Image downloaded successfully',
      image_size: imageBuffer.byteLength,
      image_url: image_url,
      next_step: 'Will integrate FaceCheck.ID once we confirm image handling works'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: error.message,
      debug: 'Error in image download process'
    });
  }
}
