// app/components/loader.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
            <p>Loading...</p>
            <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-blue-500 animate-spin"></div>
        </div>
    );
};

export default Loader;
