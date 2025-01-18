// import NextAuth from "next-auth";
// import DiscordProvider from "next-auth/providers/discord";

// export const authOptions = {
//     providers: [
//         DiscordProvider({
//             clientId: process.env.DISCORD_CLIENT_ID!,
//             clientSecret: process.env.DISCORD_CLIENT_SECRET!,
//             authorization: {
//                 params: {
//                     scope: "identify email", // Add the necessary Discord API scopes
//                 },
//             },
//         }),
//     ],
//     callbacks: {
//         async session({ session, token }) {
//             if (token) {
//                 session.user.id = token.id;
//                 session.user.username = token.username;
//                 session.user.avatar = token.avatar;
//                 session.user.email = token.email;
//             }
//             return session;
//         },
//         async jwt({ token, account, profile }) {
//             if (account && profile) {
//                 token.id = profile.id;
//                 token.username = profile.username;
//                 token.avatar = profile.avatar;
//                 token.email = profile.email;
//             }
//             return token;
//         },
//     },
// };

// export default NextAuth(authOptions);
