// app/api/utils/discordBot.ts
export async function sendMessageToDiscord(message: string) {
    const webhookUrl = "https://discord.com/api/webhooks/1330632007486668893/56oy97rnRmxxg2feLkM-DAS9TUb_ENGxyOe6jKB3_Eld9sVmaMEer_VjZNveHRNcTce_";

    if (!webhookUrl) {
        throw new Error("Discord webhook URL is not set in the environment variables.");
    }

    const payload = {
        content: message, // Message content
    };

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
