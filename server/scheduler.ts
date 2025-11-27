import cron from 'node-cron';
import { storage } from './storage';
import { sendCapsuleEmail } from './email';
import { generateReflectionSummary } from './ai';

export function startScheduler() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Checking for scheduled capsules...');
      const capsules = await storage.getScheduledCapsules();
      const now = new Date();

      for (const capsule of capsules) {
        if (capsule.scheduledFor <= now && !capsule.deliveredAt) {
          try {
            let reflection = '';
            if (capsule.content && capsule.title && capsule.createdAt) {
              try {
                reflection = await generateReflectionSummary(
                  capsule.content,
                  capsule.title,
                  capsule.createdAt,
                  now
                );
              } catch (error) {
                console.error('Error generating reflection:', error);
              }
            }

            const recipients = await storage.getCapsuleRecipients(capsule.id);
            let allDelivered = true;
            
            if (recipients.length > 0) {
              for (const recipient of recipients) {
                if (!recipient.deliveredAt) {
                  try {
                    await sendCapsuleEmail(
                      recipient.recipientEmail,
                      capsule.title,
                      capsule.content,
                      capsule.createdAt || new Date(),
                      capsule,
                      reflection
                    );
                    await storage.markRecipientAsDelivered(recipient.id);
                    console.log(`Capsule ${capsule.id} delivered to ${recipient.recipientEmail}`);
                  } catch (error) {
                    console.error(`Error delivering to recipient ${recipient.id}:`, error);
                    allDelivered = false;
                  }
                }
              }
              
              if (allDelivered) {
                await storage.markCapsuleAsDelivered(capsule.id);
              }
            } else {
              const recipientEmail = capsule.recipientEmail || (await storage.getUser(capsule.userId))?.email;
              
              if (recipientEmail) {
                await sendCapsuleEmail(
                  recipientEmail,
                  capsule.title,
                  capsule.content,
                  capsule.createdAt || new Date(),
                  capsule,
                  reflection
                );
                await storage.markCapsuleAsDelivered(capsule.id);
                console.log(`Capsule ${capsule.id} delivered to ${recipientEmail}`);
              } else {
                console.error(`No email found for capsule ${capsule.id}`);
              }
            }
          } catch (error) {
            console.error(`Error delivering capsule ${capsule.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in scheduler (will retry next cycle):', error instanceof Error ? error.message : error);
    }
  });

  console.log('Scheduler started - checking every 5 minutes');
}
