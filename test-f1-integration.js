#!/usr/bin/env node

const axios = require('axios');

const FASTF1_URL = 'http://localhost:8000';
const API_URL = 'http://localhost:3001';

async function testFastF1API() {
    console.log('🏎️ Testing FastF1 API...');
    
    try {
        // Test health endpoint
        const health = await axios.get(`${FASTF1_URL}/health`);
        console.log('✅ FastF1 API Health:', health.data);
        
        // Test drivers endpoint
        const drivers = await axios.get(`${FASTF1_URL}/drivers/2024`);
        console.log('✅ 2024 Drivers:', drivers.data.driver_count, 'drivers found');
        
        // Test race calendar
        const calendar = await axios.get(`${FASTF1_URL}/race-calendar/2024`);
        console.log('✅ 2024 Race Calendar:', calendar.data.total_events, 'events');
        
        return true;
    } catch (error) {
        console.log('❌ FastF1 API Error:', error.message);
        return false;
    }
}

async function testNestJSAPI() {
    console.log('🔧 Testing NestJS API...');
    
    try {
        // Test health endpoint
        const health = await axios.get(`${API_URL}/health`);
        console.log('✅ NestJS API Health:', health.data);
        
        // Test F1 data endpoint
        const f1Data = await axios.get(`${API_URL}/f1-data/current-season/2024`);
        console.log('✅ F1 Data Integration:', f1Data.data.year, 'season data');
        
        return true;
    } catch (error) {
        console.log('❌ NestJS API Error:', error.message);
        return false;
    }
}

async function testIntegration() {
    console.log('🚀 Testing DrivetoSurvive F1 Integration...');
    console.log('==========================================');
    
    const fastf1Working = await testFastF1API();
    console.log('');
    const nestjsWorking = await testNestJSAPI();
    
    console.log('');
    console.log('📊 Test Results:');
    console.log('================');
    console.log(`FastF1 API: ${fastf1Working ? '✅ Working' : '❌ Failed'}`);
    console.log(`NestJS API: ${nestjsWorking ? '✅ Working' : '❌ Failed'}`);
    
    if (fastf1Working && nestjsWorking) {
        console.log('');
        console.log('🎉 All services are working! Your F1 data integration is ready.');
        console.log('');
        console.log('📚 Available endpoints:');
        console.log('  FastF1 API: http://localhost:8000/docs');
        console.log('  NestJS API: http://localhost:3001/f1-data');
        console.log('');
        console.log('🔗 Try these example requests:');
        console.log('  curl http://localhost:3001/f1-data/current-season/2024');
        console.log('  curl http://localhost:3001/f1-data/driver-performance/2024');
        console.log('  curl http://localhost:3001/f1-data/team-analysis/2024');
    } else {
        console.log('');
        console.log('❌ Some services are not working. Please check the logs and try again.');
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('  1. Make sure FastF1 API is running: python3 services/fastf1-api/main.py');
        console.log('  2. Make sure NestJS API is running: cd apps/api && npm run dev');
        console.log('  3. Check if ports 8000 and 3001 are available');
    }
}

// Run the test
testIntegration().catch(console.error);
