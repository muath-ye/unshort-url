#!/usr/bin/env node

const axios = require('axios');
const { program } = require('commander');

async function getOriginalUrl(shortenedUrl) {
    try {
        // Make a request without following redirects and include a user-agent header
        const response = await axios.get(shortenedUrl, {
            maxRedirects: 0,
            headers: {
                // This because the URL shortening service might require a user-agent or other headers to mimic a real browser request. By default, some shortening services (like TinyURL) may block requests without a proper user-agent header.
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            },
            validateStatus: (status) => status >= 200 && status < 400
        });

        if (response.status === 301 || response.status === 302) {
            // Get the 'Location' header, which contains the original URL
            const originalUrl = response.headers.location;
            console.log(`Original URL: ${originalUrl}`);
        } else {
            console.log(`No redirect, status code: ${response.status}`);
        }
    } catch (error) {
        if (error.response && (error.response.status === 301 || error.response.status === 302)) {
            // Handle redirect if error was due to maxRedirects being set to 0
            console.log(`Original URL: ${error.response.headers.location}`);
        } else {
            console.error(`Error: ${error.message}`);
        }
    }
}

// Set up CLI using commander
program
    .version('1.0.0')
    .description('Unshorten a shortened URL to reveal the original URL')
    .usage('<shortened-url>')
    .arguments('<shortenedUrl>')
    .action((shortenedUrl) => {
        if (!shortenedUrl) {
            console.error('Please provide a shortened URL.');
            program.help();
        } else {
            getOriginalUrl(shortenedUrl);
        }
    });

program.parse(process.argv);
