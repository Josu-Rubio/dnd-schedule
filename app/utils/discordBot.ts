// app/api/utils/discordBot.ts
export async function sendMessageToDiscord(content: string, embed?: object) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        throw new Error("Discord webhook URL is not set in the environment variables.");
    }

    const payload: any = { content };
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
