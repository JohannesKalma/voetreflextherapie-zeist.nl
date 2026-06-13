import fs from 'fs/promises';

const jsonData = async () => {
    const navMenuFilePath = './wp-export/split_output/nav_menu_item.json';
    const termFilePath = './wp-export/split_output/terms.json';
    try {
        const [navMenuRaw, termRaw] = await Promise.all([
            fs.readFile(navMenuFilePath, 'utf-8'),
            fs.readFile(termFilePath, 'utf-8')
        ]);
        return {
            navMenu: JSON.parse(navMenuRaw),
            terms: JSON.parse(termRaw)
        };
    } catch (err) {
        console.error("Error reading JSON files:", err);
        throw err; // Re-throw so the calling function knows something went wrong
    }
}

const navData = async () => {
        const data = await jsonData()

        const navMenuItems = data?.terms?.filter(item => item['wp:term_taxonomy'] === 'nav_menu').map(menu => menu['wp:term_slug'])
        console.log('navMenuItems:', navMenuItems); // Log the navMenuItems array to see its contents

const postData = req.app.get('globalPostsCache')

        const navMenus = navMenuItems.reduce((acc, navMenuItem) => {

            const menuItems = data?.navMenu?.filter(item => {
                return item.category?.['@_nicename'] === navMenuItem;
            }).map(item => {
                const postId = item["wp:postmeta"]?.find(meta => meta["wp:meta_key"] === "_menu_item_object_id")?.["wp:meta_value"];
                const post = postsData.find(p => p['wp:post_id'] === postId);
                return {
                    title: (item.title && String(item.title).trim() !== '') ? item.title : (post ? post.title : ''),
                    menuOrder: item["wp:menu_order"],
                    objectId: postId ? postId : null,
                    //postTitle: post ? post.title : "Unknown Post",
                    postName: post ? post['wp:post_name'] : null
                };
            }).sort((a, b) => Number(a.menuOrder) - Number(b.menuOrder));
            acc[navMenuItem] = menuItems;
            return acc;
        }, {});
        return navMenus;
    }

export { navData }