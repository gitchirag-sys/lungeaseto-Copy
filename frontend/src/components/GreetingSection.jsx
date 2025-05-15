import React from 'react';

const GreetingSection = () => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <section className="p-10 bg-gradient-to-r from-green-50 via-teal-50 to-green-100 rounded-xl shadow-lg">
      <div className="pl-14">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{greeting}</h1>
        <p className="text-lg text-gray-700 mb-6">Do you want to run a test?</p>
        <div className="flex space-x-4">
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md transition">
            Yes
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition">
            No
          </button>
        </div>
      </div>
    </section>
  );
};

export default GreetingSection;
