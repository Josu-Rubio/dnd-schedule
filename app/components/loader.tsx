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
        <div className="h-screen flex flex-col items-center justify-center">
            <div className="h-1/4 flex flex-col items-center justify-between">
                <h2>Bienvenido!</h2>
                <p>Si tarda demasiado en cargar, por favor vuelve a loguearte</p>

                <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-violet-600 animate-spin"></div>

                <Link className="text-white bg-violet-900 px-4 py-2 rounded hover:bg-violet-950" href="/">Home</Link>

            </div>
        </div>
    );
};

export default Loader;
