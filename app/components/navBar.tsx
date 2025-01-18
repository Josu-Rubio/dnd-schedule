// import { useSession } from "next-auth/react";

// const NavBar = () => {
//     const { data: session, status } = useSession();

//     return (
//         <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
//             <h1 className="text-xl font-bold">D&D Scheduler</h1>
//             {status === "authenticated" ? (
//                 <div className="flex items-center">
//                     <img
//                         src={`https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png`}
//                         alt={session.user.username}
//                         className="rounded-full w-8 h-8 mr-2"
//                     />
//                     <span>{session.user.username}</span>
//                 </div>
//             ) : (
//                 <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Login</button>
//             )}
//         </nav>
//     );
// };

// export default NavBar;