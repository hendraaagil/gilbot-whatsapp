import puppeteer, { Browser } from 'puppeteer';
import { InstaResult } from '../types/insta';

export const instaSave = async (
  link: string
): Promise<{
  isValid: boolean;
  data?: InstaResult[];
}> => {
  let browser: Browser | null = null;

  try {
    const matchLink = link.match(/\/([^\s\?]+)/);
    if (!matchLink) {
      return { isValid: false };
    }

    const linkArr = matchLink[1].split('/');
    const allowedDomains = ['instagram.com', 'www.instagram.com'];
    const allowedTypes = ['p', 'reel'];
    const domain = linkArr[1];
    const type = linkArr[2];
    const identifier = linkArr[3];
    if (
      !allowedDomains.includes(domain) ||
      !allowedTypes.includes(type) ||
      !identifier
    ) {
      return { isValid: false };
    }

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox'],
      protocolTimeout: 360000,
    });
    const page = await browser.newPage();

    await page.goto('https://snapsave.app/download-video-instagram', {
      waitUntil: 'networkidle0',
    });

    await page.focus('input[name=url]');
    await page.keyboard.type(link);
    await page.click('button[type="submit"]');

    await page.waitForSelector(
      '#download-section .download-items .download-items__btn > a',
      { timeout: 60000 }
    );

    const items: InstaResult[] = [];
    const elements = await page.$$(
      '#download-section .download-items .download-items__btn > a'
    );

    let count = 1;
    for (const element of elements) {
      const href = await page.evaluate((el) => el.href, element);

      const matchHref = href.match(/\/([^\s\?]+)/) as RegExpMatchArray;
      const domain = matchHref[1].split('/')[1];
      const type = domain === 'snapxcdn.com' ? 'video' : 'image';

      items.push({
        name: identifier + '_' + count,
        type: type,
        url: href,
      });

      count++;
    }
    // console.log('instaSave() items >>', items);

    await browser.close();

    return { isValid: true, data: items };
  } catch (error) {
    console.error(error);

    if (browser) {
      await browser.close();
    }
    throw error;
  }
};
