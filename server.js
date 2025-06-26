import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage for scores (in production, use a database)
let scores = [];

// Serve the game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle score submission
app.post('/play', (req, res) => {
    try {
        const { user_id, score } = req.body;
        
        if (!user_id || typeof score !== 'number') {
            return res.status(400).json({ 
                error: 'Invalid data. user_id and score are required.' 
            });
        }

        // Store the score with timestamp
        const scoreEntry = {
            user_id,
            score,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        scores.push(scoreEntry);

        // Keep only the last 1000 scores to prevent memory issues
        if (scores.length > 1000) {
            scores = scores.slice(-1000);
        }

        console.log(`Score submitted: User ${user_id} scored ${score} points`);

        res.json({ 
            success: true, 
            message: 'Score submitted successfully',
            data: scoreEntry
        });

    } catch (error) {
        console.error('Error submitting score:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// Get leaderboard (optional endpoint)
app.get('/leaderboard', (req, res) => {
    try {
        // Get top 10 scores
        const topScores = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(entry => ({
                user_id: entry.user_id,
                score: entry.score,
                timestamp: entry.timestamp
            }));

        res.json({
            success: true,
            leaderboard: topScores
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        totalScores: scores.length
    });
});

app.listen(PORT, () => {
    console.log(`🍭 Candy Crush game server running on port ${PORT}`);
    console.log(`🌐 Game available at: http://localhost:${PORT}`);
});