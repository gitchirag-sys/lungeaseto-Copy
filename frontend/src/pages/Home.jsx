import React from 'react';
import Navbar from '../components/Navbar';
import GreetingSection from '../components/GreetingSection';
import TestRunSection from '../components/TestRunSection';
import HistorySection from '../components/HistorySection';
import TipsSection from '../components/TipsSection';

const Home = ({ user }) => (
  <div>
    
    <GreetingSection />
    <TestRunSection user={user} />
    <HistorySection user={user} />
    <TipsSection />
  </div>
);

export default Home;