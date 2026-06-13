import { writeFile, mkdir } from 'fs/promises';
import { readFile, existsSync } from 'fs';
import path from 'path';
// This script reads the WordPress export JSON, groups entries by post_type, and saves each group to a separate file.

const dataFilePath = 'output.json';

const fileData = async () => {
    return new Promise((resolve, reject) => {
        readFile(dataFilePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

const jsonData = async () => {
    return JSON.parse(await fileData());
}

const splitJson = async() => {
  //try {
    // 1. Load the data
    const data = await jsonData();
    const items = data.channel.item || [];
       
    // 2. Group entries by post_type
    const groupedItems = items.reduce((acc, item) => {
      const type = item['wp:post_type'] || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {});

    // 3. Create output directory
    const outputDir = './split_output';
    if (!existsSync(outputDir)) {
      await mkdir(outputDir);
    }

    // 4. Write files asynchronously
    const saveItems = Object.entries(groupedItems).map(([type, data]) => {
      const filePath = path.join(outputDir, `${type}.json`);
      return writeFile(filePath, JSON.stringify(data, null, 2));
    });

    
    const {
        "wp:category": category,
        "wp:tag": tag,
        "wp:term": term,
        "item":item,
        "generator": generator,
        "image": image,
        ...cleanChannel
    } = data?.channel || {};
    
    const saveChannel = async () => {
        const filePath = path.join(outputDir, `channel.json`);
        return writeFile(filePath, JSON.stringify(cleanChannel, null, 2));
    }
    
    await saveChannel();

    const categoryData = data?.channel?.['wp:category'] || [];
    const saveCategory = async () => {
        const filePath = path.join(outputDir, `categories.json`);
        return writeFile(filePath, JSON.stringify(categoryData, null, 2));
    }

    const tagData = data?.channel?.['wp:tag'] || [];
    const saveTag = async () => {
        const filePath = path.join(outputDir, `tags.json`);
        return writeFile(filePath, JSON.stringify(tagData, null, 2));
    }

    const termData = data?.channel?.['wp:term'] || [];
    const saveTerm = async () => {
        const filePath = path.join(outputDir, `terms.json`);
        return writeFile(filePath, JSON.stringify(termData, null, 2));
    }

    await Promise.all(saveItems);
    await Promise.all([saveCategory(), saveTag(), saveTerm()]);
    
    console.log(`✅ Success! Created`);
  //} catch (err) {
  //  console.error('❌ Error processing JSON:', err);
  //}
}

splitJson();