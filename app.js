import express from 'express';
import { jsonData } from './data.js';
import { initializeCache, getPages, getNav } from './lib/cacheManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

await initializeCache();
const navigation = { hoofdmenu: getNav().navMenus?.hoofdmenu, footerMenu: getNav().navMenus['footer-menu-personal-pages'] }

// Recreating __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.get('/', async (req, res) => {
    try {
        const filteredPage = getPages()?.find(item => item['wp:post_id'] == 508)
        const page = {
            content: filteredPage['content:encoded'],
            date: filteredPage['wp:post_date']
        };

        res.render('frontpage', { page: page, ...navigation });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

app.get('/:post', async (req, res) => {
    try {
        const filteredPage = getPages()?.find(item => item['wp:post_name'] == req.params.post);

        if (filteredPage) {
            const page = {
                title: filteredPage['title'],
                content: filteredPage['content:encoded'],
                date: filteredPage['wp:post_date'],
                author: filteredPage['dc:creator']
            };
            res.render('page', { page: page, ...navigation });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})
