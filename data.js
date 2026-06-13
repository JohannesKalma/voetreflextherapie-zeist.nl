import fs from 'fs';

//const dataFileBasePath = process.env.DATA_FILE_BASEPATH;
//const dataFilePath = `${dataFileBasePath}post.json`;

const postsFilePath = './wp-export/split_output/page.json';

const postsData = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile(postsFilePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

const jsonData = async () => {
    const posts = await Promise.all([postsData()]);
    return { posts: JSON.parse(posts)};
}

export { jsonData }
