// app/utils/discordBot.ts
import { WebhookClient } from 'discord.js';

export async function sendMessageToDiscord(message: string) {
    if (typeof window === "undefined") {
        // Check to ensure this code runs only on the server-side (Node.js environment)
        const webhookClient = new WebhookClient({
            id: process.env.DISCORD_WEBHOOK_ID!,   // Get Webhook ID from environment variable
            token: process.env.DISCORD_WEBHOOK_TOKEN!,   // Get Webhook Token from environment variable
        });

        try {
            await webhookClient.send(message);   // Send message to Discord webhook
        } catch (error) {
            console.error("Error sending message to Discord:", error);
        }
    }
}
