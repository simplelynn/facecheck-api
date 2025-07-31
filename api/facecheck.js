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
  const authToken = 'wV1cRvip6IZSFLf5gS/3RZbSTc+Vq1DvSxuSifR0D7HokiBcLi0WUpRRg91Tad6bTaX4wq7I8Ak=';

  if (!image_url) {
    return res.status(400).json({ error: 'image_url is required' });
  }

  try {
    console.log('Starting image download from:', image_url);
    
    // Download image from URL
    const imageResponse = await fetch(image_url);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log('Image downloaded, size:', imageBuffer.byteLength);
    
    // Create FormData and append image
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('images', blob, 'image.jpg');
    
    console.log('Uploading to FaceCheck...');
    
    // Upload to FaceCheck
    const uploadResponse = await fetch('https://facecheck.id/api/upload_pic', {
      method: 'POST',
      headers: {
        'Authentication-Token': authToken
      },
      body: formData
    });

    const html = await uploadResponse.text();
    console.log('FaceCheck response received');
    
    // Parse id_search from HTML response
    const match = html.match(/id_search=(\d+)/);
    const idSearch = match ? match[1] : null;
    
    if (!idSearch) {
      console.error('Could not find id_search in response');
      return res.status(400).json({ 
        error: 'Could not find id_search in FaceCheck response',
        debug: html.substring(0, 500) // First 500 chars for debugging
      });
    }

    console.log('Found id_search:', idSearch);

    // Wait a moment for FaceCheck to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get search results
    const searchResponse = await fetch(`https://facecheck.id/api/search_pic?id_search=${idSearch}`, {
      headers: {
        'Authentication-Token': authToken
      }
    });

    const searchText = await searchResponse.text();
    
    // Try to parse as JSON, if it fails return the raw response
    let results;
    try {
      results = JSON.parse(searchText);
    } catch (e) {
      console.log('Search response is not JSON, returning as text');
      results = searchText;
    }
    
    return res.status(200).json({
      success: true,
      id_search: idSearch,
      results: results,
      search_url: `https://facecheck.id/api/search_pic?id_search=${idSearch}`
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
