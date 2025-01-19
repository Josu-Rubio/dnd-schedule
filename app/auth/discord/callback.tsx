// pages/auth/discord/callback.tsx (or app/auth/discord/callback/page.tsx for the App Router)
import { useEffect } from "react";
import { useRouter } from "next/router";

const DiscordAuthCallbackPage = () => {
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get("code");

            if (code) {
                const response = await fetch(`/api/auth/discord/callback?code=${code}`);
                const userData = await response.json();

                console.log("userData", userData)

                if (userData && !userData.error) {
                    // Save user data to localStorage
                    localStorage.setItem("user", JSON.stringify(userData));

                    // Redirect to the calendar page
                    router.push("/calendar");
                } else {
                    console.error("Error fetching user data:", userData);
                }
            } else {
                console.error("Authorization code is missing.");
            }
        };

        fetchUserData();
    }, [router]);

    return <div>Loading...</div>; // Show loading while processing
};

export default DiscordAuthCallbackPage;
