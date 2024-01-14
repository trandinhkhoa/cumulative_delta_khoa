import express from 'express'

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('Server is up and running!');
});


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

export default app;