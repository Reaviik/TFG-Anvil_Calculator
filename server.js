const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
// Substitua 'sua_string_de_conexao' pela sua string do MongoDB Atlas
const MONGODB_URI = 'mongodb://localhost:27017/tfc_crafts'; // Para local
// ou para MongoDB Atlas:
// const MONGODB_URI = 'mongodb+srv://usuario:senha@cluster.mongodb.net/tfc_crafts';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Schema do Craft
const craftSchema = new mongoose.Schema({
    name: { type: String, required: true },
    emoji: { type: String, default: '📦' },
    target: { type: Number, required: true },
    rules: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
});

const Craft = mongoose.model('Craft', craftSchema);

// Rotas

// GET - Buscar todos os crafts
app.get('/api/crafts', async (req, res) => {
    try {
        const crafts = await Craft.find().sort({ createdAt: -1 });
        res.json(crafts);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar crafts' });
    }
});

// POST - Salvar novo craft
app.post('/api/crafts', async (req, res) => {
    try {
        const { name, emoji, target, rules } = req.body;
        
        // Verifica se já existe um craft com o mesmo nome
        const existing = await Craft.findOne({ name });
        if (existing) {
            // Atualiza o existente
            existing.emoji = emoji || existing.emoji;
            existing.target = target;
            existing.rules = rules;
            await existing.save();
            return res.json(existing);
        }

        // Cria novo craft
        const craft = new Craft({ name, emoji, target, rules });
        await craft.save();
        res.json(craft);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar craft' });
    }
});

// PUT - Atualizar craft
app.put('/api/crafts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, emoji, target, rules } = req.body;
        
        const craft = await Craft.findByIdAndUpdate(
            id,
            { name, emoji, target, rules },
            { new: true }
        );
        
        if (!craft) {
            return res.status(404).json({ error: 'Craft não encontrado' });
        }
        
        res.json(craft);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar craft' });
    }
});

// DELETE - Excluir craft
app.delete('/api/crafts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const craft = await Craft.findByIdAndDelete(id);
        
        if (!craft) {
            return res.status(404).json({ error: 'Craft não encontrado' });
        }
        
        res.json({ message: 'Craft excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir craft' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});