"use client"

import { useRouter } from "next/navigation";

const BackButton = () => {
    const router = useRouter(); // Initialize the router

    return (
        <button className='bg-gray-900 px-4 py-2 rounded hover:bg-gray-950 pointer'
            onClick={(e) => {
                e.preventDefault();
                router.back(); // Navigate back
            }}

        >
            {"< Back"}
        </button>
    );
};

export default BackButton