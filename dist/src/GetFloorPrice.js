const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// URL of the webpage to scrape
const URL = 'https://stepn-market.guide/market/dashboard#google_vignette';

// Function to fetch HTML of the webpage
async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error('Error fetching the URL:', error);
    throw error;
  }
}

// Function to parse the HTML and extract floor prices
async function getFloorPrices() {
  try {
    // Fetch the HTML content from the URL
    const html = await fetchHTML(URL);

    // Load the HTML using cheerio
    const $ = cheerio.load(html);

    // Table of interest
    const floorPrices = [];

    $('table.table.table-striped.table-bordered.mgn-btm40 tbody tr').each((_, element) => {
      const type = $(element).find('td.td-shoe').text().trim();
      const categories = ['Walker', 'Jogger', 'Runner', 'Trainer'];
      const prices = {};

      $(element).find('td').each((index, td) => {
        const price = $(td).find('b').text().trim();
        if (index > 0 && index <= categories.length) {
          prices[categories[index - 1]] = price;
        }
      });

      floorPrices.push({ type, prices });
    });

    // Output all floor prices by type
    console.log('Floor Prices:', floorPrices);

    // Save the floor prices to a JSON file in the StepnData directory
    fs.writeFileSync('../../floor_prices.json', JSON.stringify(floorPrices, null, 2));
    console.log('Floor Prices saved to ../../floor_prices.json');

    // Save the floor prices to a text file in the StepnData directory
    fs.writeFileSync('../../StepnData/output_floor.txt', floorPrices.map(fp => `${fp.type}: ${JSON.stringify(fp.prices)}`).join('\n'));
    console.log('Floor Prices saved to ../../StepnData/output_floor.txt');

    return floorPrices;
  } catch (error) {
    console.error('Error extracting floor prices:', error);
  }
}

// Run the function to get the floor prices
getFloorPrices();