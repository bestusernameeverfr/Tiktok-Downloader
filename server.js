const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static('public'));

app.get('/api/download-get', async (req, res) => {
    const tiktokUrl = req.query.url;
    
    if (!tiktokUrl) {
        return res.status(400).send('Please provide a URL');
    }

    try {
        console.log("Processing direct download for:", tiktokUrl);

        const response = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`);
        
        if (response.data && response.data.code === 0) {
            const videoDownloadUrl = response.data.data.play; 

            const videoStreamResponse = await axios({
                method: 'GET',
                url: videoDownloadUrl,
                responseType: 'stream'
            });

            res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
            res.setHeader('Content-Type', 'video/mp4');

            videoStreamResponse.data.pipe(res);
        } else {
            res.status(500).send('Could not extract video link from TikTok.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to process TikTok link');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});