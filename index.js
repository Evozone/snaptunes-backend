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
        const prompt = `You are a highly acclaimed video-editor person, who is aware about the latest and legacy songs which go perfect with a respective image or video shot. Now can u please use your years of experience and suggest some songs for the given image input. Try to think what the image is about, like is it a festival or event or something else, and based on that suggest songs. Those songs should be from Bollywood or Hollywood. The output should be strictly in string format and it should be an object of length 2 where in the first element should be an array of 4 Bollywood Songs and 2nd element should be another array of 4 Hollywood songs. The song name should be followed by artist name as well. Example - "{"Bollywood": ["Rang Barse Silsila by Amitabh Bachchan","Holi Ke Din by Kishore Kumar, Lata Mangeshkar, and R. D. Burman","Balam Pichkari by  Shalmali Kholgade, Vishal Dadlani, Pritam Chakraborty, Amitabh Bhattacharya","Soniyo by Raju Singh, Shreya Ghoshal, and Sonu Nigam"],"Hollywood": ["Happy by Pharrell Williams","Dont Stop Me Now by Queen","Celebration by Pat Boone","I Gotta Feeling by  Black Eyed Peas"]}" . Important Note is do not include any indentation markers like json or do not decorate it with backticks. The output should strictly follow the format of the given example. Thankyou!`;
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = result.response;
        const text = response.text();
        console.log(text);
        res.send(text);
    } catch (error) {
        // send error in response
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () =>
    console.log('Hello! This is SnapTunes backend, listening on port - ', PORT)
);
