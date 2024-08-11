const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchData() {
    const response = await fetch('https://dummyjson.com/posts?limit=300&sortBy=id&order=desc');
    const data = await response.json();
    return data;
}

async function printPdf(data) {
    let htmlContent = fs.readFileSync('index.html', 'utf-8');
    let tableRows = '';
    data.posts.forEach(post => {
        tableRows += `
            <tr>
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.body}</td>
                <td>${post.tags.join(', ')}</td>
                <td>${post.reactions}</td>
                <td>${post.views}</td>
                <td>${post.userId}</td>
            </tr>
        `;
    });

    htmlContent = htmlContent.replace('{{#each assets}}', '').replace('{{/each}}', '').replace('<tbody>', `<tbody>${tableRows}`);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Download the PDF
    const pdf = await page.pdf({
        path: 'posts.pdf',
        printBackground: true,
        format: 'A2',
    });

    await browser.close();
};

async function main() {
    const data = await fetchData();
    await printPdf(data);
}

main();