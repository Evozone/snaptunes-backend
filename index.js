const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8080;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(express.json({ limit: '10MB' }));

app.get('/api/', (req, res) => {
    res.send('Hello, welocme to SnapTunes API!');
});

app.post('/api/recommend-songs', async (req, res) => {
    try {
        const imageParts = req.body.imageParts;
        const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
        const prompt = `Please generate a JSON object containing a list of songs for the given image input. Assume that you are a highly experienced software engineer and video editor who has knowledge of both Bollywood and Hollywood songs suitable for various occasions or themes depicted in images or videos.

        The output should be in the following JSON format:
             
        {
          "Bollywood": ["Song 1 by Artist 1", "Song 2 by Artist 2", "Song 3 by Artist 3", "Song 4 by Artist 4"],
          "Hollywood": ["Song 1 by Artist 1", "Song 2 by Artist 2", "Song 3 by Artist 3", "Song 4 by Artist 4"]
        }
        
        Please ensure the following:
        
            The output is a valid JSON object.
            The object contains two arrays: one for Bollywood songs and one for Hollywood songs.
            Each song entry follows the format 'Song Name by Artist Name'.
            There are exactly four songs in each array.
            Use double quotation marks (") for each song and artist name.
            If there are any special characters within a song name, make sure to escape them properly.
        
        Feel free to consider the theme or context of the given image when suggesting songs. Thank you!`;

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = result.response;
        var text = response.text();
        if (text.includes('```json')) {
            text = text.replace('```json', '');
            text = text.replace('```', '');
        }
        // Write a regular expression to extract the JSON object from the response
        const jsonRegex = /{[^]*}/;
        const match = text.match(jsonRegex);
        if (!match) {
            throw new Error('Failed to extract JSON object from response');
        }
        text = match[0];
        res.send(text);
    } catch (error) {
        // send error in response
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () =>
    console.log('Hello! This is SnapTunes backend, listening on port - ', PORT)
);
