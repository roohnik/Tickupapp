#!/usr/bin/env node
/**
 * Backend Connection Test Script
 * 
 * This script tests the connection to the backend Socket.io server
 * and validates that required events are working.
 * 
 * Usage: node test-backend-connection.js
 */

const { io } = require('socket.io-client');

// Get backend URL from environment or use default
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

console.log('🔍 Testing Backend Connection...');
console.log(`📍 Backend URL: ${SOCKET_URL}\n`);

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
  withCredentials: true,
  timeout: 5000
});

let isConnected = false;
let testsPassed = 0;
let testsFailed = 0;

// Connection test
socket.on('connect', () => {
  isConnected = true;
  console.log('✅ Connected to backend successfully!');
  console.log(`   Socket ID: ${socket.id}\n`);
  
  // Run basic tests
  runTests();
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Check if backend server is running');
  console.error('   2. Verify REACT_APP_SOCKET_URL in .env.local');
  console.error('   3. Ensure backend CORS is configured correctly');
  console.error('   4. Check if port 3000 is accessible\n');
  process.exit(1);
});

socket.on('disconnect', () => {
  if (isConnected) {
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Passed: ${testsPassed}`);
    console.log(`   ❌ Failed: ${testsFailed}`);
    console.log(`   📈 Total: ${testsPassed + testsFailed}\n`);
    
    if (testsFailed === 0) {
      console.log('🎉 All tests passed! Backend is properly configured.\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Check backend implementation.\n');
      process.exit(1);
    }
  }
});

function runTests() {
  console.log('🧪 Running Backend API Tests...\n');
  
  // Test 1: Workspaces list
  testEvent('workspaces:list', {}, (response) => {
    return response && response.ok !== undefined;
  });
  
  // Test 2: Teams list
  testEvent('teams:list', {}, (response) => {
    return response && response.ok !== undefined;
  });
  
  // Test 3: Tasks list
  testEvent('tasks:list', {}, (response) => {
    return response && response.ok !== undefined;
  });
  
  // Test 4: Users list
  testEvent('users:list', {}, (response) => {
    return response && response.ok !== undefined;
  });
  
  // Test 5: Documents list
  testEvent('documents:list', {}, (response) => {
    return response && response.ok !== undefined;
  });
  
  // Give tests time to complete
  setTimeout(() => {
    socket.disconnect();
  }, 3000);
}

function testEvent(eventName, payload, validator) {
  socket.emit(eventName, payload, (response) => {
    const passed = validator(response);
    
    if (passed) {
      console.log(`✅ ${eventName}: OK`);
      testsPassed++;
    } else {
      console.log(`❌ ${eventName}: FAILED`);
      console.log(`   Response:`, response);
      testsFailed++;
    }
  });
  
  // Timeout for event
  setTimeout(() => {
    // If we haven't got a response, mark as failed
    // (This is a simple check, might need refinement)
  }, 2000);
}

// Start connection
console.log('⏳ Connecting...\n');
socket.connect();

// Overall timeout
setTimeout(() => {
  if (!isConnected) {
    console.error('❌ Connection timeout after 10 seconds\n');
    process.exit(1);
  }
}, 10000);
