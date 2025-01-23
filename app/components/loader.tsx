// app/components/loader.tsx

'use client';


const Loader = () => {

    return (
        <div className="flex flex-col items-center justify-center w-full h-full space-y-8">
            {/* Welcome Section */}
            <div className="text-center" style={{ textShadow: "2px 2px #000000" }}>
                <h2 className="text-white text-3xl mb-8 font-bold">Bienvenido!</h2>
                <p className="text-white text-3xl mb-8 font-bold">Espere por favor, sólo tomará un segundo</p>
            </div>

            {/* Loading Spinner */}
            <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-violet-600 animate-spin"></div>

        </div>


    );
};

export default Loader;
