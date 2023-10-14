import { CronJob } from 'cron';
import { Client } from 'whatsapp-web.js';

import { checkUnreplyChats } from './chat';

export const checkUnreplyChatsCron = (client: Client) => {
  return new CronJob(
    '0 */15 * * * *',
    () => {
      console.info('Running cron job checkUnreplyChats()');
      checkUnreplyChats(client);
    },
    null,
    true,
    'Asia/Jakarta'
  );
};
