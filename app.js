import express from 'express';
import { jsonData } from './data.js';
import { initializeCache, getPages, getNav } from './lib/cacheManager.js';

const app = express();
const PORT = 3000;

await initializeCache();
const navigation = {hoofdmenu: getNav().navMenus?.hoofdmenu, footerMenu: getNav().navMenus['footer-menu-personal-pages']}

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (req, res) => {
    try {
        const navMenus = getNav().navMenus;
        const filteredPost = getPages()?.find(item => item['wp:post_id'] == 508)
        
        const post = {
                title: filteredPost['title'],
                content: filteredPost['content:encoded'],
            };

            res.render('frontpage', { post:post, ...navigation });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

app.get('/menu', async (req, res) => {
    try {
            const navMenus = getNav().navMenus['footer-menu-personal-pages'];
            res.render('menu', { hoofdmenu:navMenus.hoofdmenu });
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Failed to load data' });
        }
    });

app.get('/:post', async (req, res) => {
    try {
        const page = getPages()?.find(item => item['wp:post_name'] == req.params.post);

        if (page) {
            const mappedPage = {
                title: page['title'],
                content: page['content:encoded'],
                date: page['wp:post_date'],
                author: page['dc:creator']
            };
            res.render('page', { page: mappedPage, ...navigation });
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
