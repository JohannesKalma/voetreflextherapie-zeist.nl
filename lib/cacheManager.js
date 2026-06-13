import { readFile } from 'fs/promises';

let cachedPages = null;
let cachedNavObject = null;

const navData = (menus, terms, posts) => {

    const navMenuItems = terms?.filter(item => item['wp:term_taxonomy'] === 'nav_menu').map(menu => menu['wp:term_slug'])
    const navMenus = navMenuItems.reduce((acc, navMenuItem) => {
        const menuItems = menus?.filter(item => {
            return item.category?.['@_nicename'] === navMenuItem;
        }).map(item => {
            const postId = item["wp:postmeta"]?.find(meta => meta["wp:meta_key"] === "_menu_item_object_id")?.["wp:meta_value"];
            const post = posts.find(p => p['wp:post_id'] === postId);
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
    return {
        generatedAt: new Date().toISOString(),
        navMenus: navMenus
    }
}

export const initializeCache = async () => {
    // Prevent double initialization
    if (cachedPages && cachedNavObject) return;

    try {
        const paths = {
            posts: './wp-export/split_output/page.json',
            navItems: './wp-export/split_output/nav_menu_item.json',
            terms: './wp-export/split_output/terms.json'
        };

        // Read all 3 files concurrently at startup
        const [postsRaw, navItemsRaw, termsRaw] = await Promise.all([
            readFile(paths.posts, 'utf-8'),
            readFile(paths.navItems, 'utf-8'),
            readFile(paths.terms, 'utf-8')
        ]);

        // 1. Cache the posts directly
        cachedPages = JSON.parse(postsRaw);
        //console.log(cachedPosts.length)

        // 2. Build the nav object and cache ONLY the final product
        const rawMenus = JSON.parse(navItemsRaw);
        const rawTerms = JSON.parse(termsRaw);
        //cachedNavObject = buildNavObject(rawMenus, rawTerms);
        cachedNavObject = navData(rawMenus, rawTerms, cachedPages);

        console.log("🚀 Cache successfully seeded!");
        console.log(`posts: ${cachedPages.length}`);
        const menuCounts = Object.entries(cachedNavObject.navMenus).reduce((acc, [key, array]) => {
            acc[key] = array.length;
            return acc;
        }, {});
        console.log(`navMenus: ${JSON.stringify(menuCounts, null, 2)}`);

    } catch (err) {
        console.error("❌ Failed to initialize app cache:", err);
        throw err;
    }
};

// Export clean getters for your helper library to safely access
export const getPages = () => {
    if (!cachedPages) throw new Error("Cache not initialized! Call initializeCache() first.");
    return cachedPages;
};

export const getNav = () => {
    if (!cachedNavObject) throw new Error("Cache not initialized! Call initializeCache() first.");
    return cachedNavObject;
};