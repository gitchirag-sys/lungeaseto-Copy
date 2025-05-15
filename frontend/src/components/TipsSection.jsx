import React from 'react';
import LungsModel from './LungsModel'; 

const TipsSection = () => (
  <section className="p-10 bg-gradient-to-r from-green-50 via-teal-50 to-green-100 flex flex-col md:flex-row items-center rounded-xl shadow-lg">
    <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
      <h2 className="text-3xl font-extrabold text-blue-700 flex items-center space-x-2">
        <span role="img" aria-label="lightbulb">💡</span>
        <span>Tips for Healthy Lungs</span>
      </h2>
      {/* Shift bullet points slightly to the right using pl-8 */}
      <ul className="list-disc pl-8 text-gray-800 space-y-3 text-lg mt-4">
        <li><strong>Don't smoke or vape.</strong></li>
        <li><strong>Exercise regularly</strong> and stay active.</li>
        <li><strong>Avoid exposure</strong> to air pollution.</li>
        <li><strong>Get regular health check-ups.</strong></li>
        <li><strong>Maintain good indoor air quality.</strong></li>
      </ul>
    </div>
    <div className="md:w-1/2 h-64 flex justify-center items-center">
      <LungsModel />
    </div>
  </section>
);

export default TipsSection;
