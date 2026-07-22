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

        // 1. Get metadata and clean video link from public API
        const response = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`);
        
        if (response.data && response.data.code === 0) {
            const videoDownloadUrl = response.data.data.play; 

            // 2. Fetch the actual binary video stream from TikTok's CDN
            const videoStreamResponse = await axios({
                method: 'GET',
                url: videoDownloadUrl,
                responseType: 'stream'
            });

            // 3. Set headers to force phone browsers to download the file directly
            res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
            res.setHeader('Content-Type', 'video/mp4');

            // 4. Pipe the video file straight to the user
            videoStreamResponse.data.pipe(res);
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