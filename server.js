const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static('public'));

app.post('/api/download', async (req, res) => {
    const { tiktokUrl } = req.body;
    
    if (!tiktokUrl) {
        return res.status(400).json({ error: 'Please provide a URL' });
    }

    try {
        console.log("Fetching TikTok link via API wrapper:", tiktokUrl);

        // Using a reliable public backend utility endpoint to extract the clean video stream
        const response = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`);
        
        if (response.data && response.data.code === 0) {
            const videoDownloadUrl = response.data.data.play; // Watermark-free MP4 link
            return res.json({ downloadUrl: videoDownloadUrl });
        } else {
            return res.status(500).json({ error: 'Could not extract video link from TikTok.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process TikTok link' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});