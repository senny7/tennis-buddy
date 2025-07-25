import axios from 'axios';
import * as cheerio from 'cheerio';

const SCRAPE_URL = 'https://www.sudarena.ro/rezervari';

/**
 * Scrapes the Sud Arena website to find available tennis courts.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of available court objects.
 */
export async function getAvailableCourts() {
  console.log(`Scraping ${SCRAPE_URL}...`);
  const { data: htmlContent } = await axios.get(SCRAPE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
    timeout: 25000,
  });

  const $ = cheerio.load(htmlContent);
  const availableCourts = [];

  // This selector is based on the n8n workflow's logic. It's broad and might need
  // refinement if the website structure is consistent.
  $('table tr').each((rowIndex, row) => {
    const courtName = $(row).find('td').first().text().trim();
    if (!courtName) return;

    $(row).find('td').each((cellIndex, cell) => {
      const cellText = $(cell).text().trim().toLowerCase();

      if (cellText.includes('liber')) {
        // Try to get the time from the table header corresponding to the cell's column
        const timeSlot = $(row).closest('table').find('thead th').eq(cellIndex).text().trim();

        if (timeSlot) {
          availableCourts.push({
            courtName: courtName,
            timeSlot: timeSlot,
          });
        }
      }
    });
  });

  // Remove duplicates
  const uniqueCourts = availableCourts.filter((court, index, self) =>
    index === self.findIndex(c => c.courtName === court.courtName && c.timeSlot === court.timeSlot)
  );

  console.log(`Found ${uniqueCourts.length} available court slots.`);
  return uniqueCourts;
}