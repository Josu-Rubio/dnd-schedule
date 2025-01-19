// app/api/utils/discordBot.ts

interface Embed {
    title?: string;
    description?: string;
    color?: number;
    fields?: { name: string; value: string; inline?: boolean }[];
}

interface WebhookPayload {
    content?: string;
    embeds?: Embed[];
    username?: string;
    avatar_url?: string;
    tts?: boolean;
}
export async function sendMessageToDiscord(content: string, embed?: Embed) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        throw new Error("Discord webhook URL is not set in the environment variables.");
    }

    const payload: WebhookPayload = { content };
    if (embed) payload.embeds = [embed];

    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message to Discord: ${errorText}`);
    }
}
