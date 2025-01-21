// app/components/loader.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Loader = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect after 2 seconds
        const timer = setTimeout(() => {
            router.push('/calendar');
        }, 2000); // Wait for 2 seconds before redirecting

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
            <div className="h-1/4 flex flex-col items-center justify-between space-y-8">
                {/* Welcome Section */}
                <div className="text-center" style={{ textShadow: "2px 2px #000000" }}>
                    <h2 className="text-white text-3xl mb-8 font-bold">Bienvenido!</h2>
                    <p className="text-white text-3xl mb-8 font-bold">Si tarda demasiado en cargar, por favor vuelve a loguearte</p>
                </div>

                {/* Loading Spinner */}
                <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-violet-600 animate-spin"></div>
                {/* Home Link */}
                <Link
                    className="text-white bg-violet-900 px-6 py-3 rounded hover:bg-violet-950 transition duration-200"
                    href="/"
                >
                    Home
                </Link>
            </div>
        </div>

    );
};

export default Loader;
