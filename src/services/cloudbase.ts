// CloudBase 服务封装 - Mock Implementation for Development
// TODO: Replace with actual @cloudbase/adaptor in production

// Mock implementation for development
async function callFunction(name: string, data: Record<string, unknown>) {
  // Return mock data based on function name
  console.log(`Mock cloud function called: ${name}`, data);
  
  // For now, return empty data to allow app to load
  // Each service file has its own mock data fallbacks
  throw new Error('Cloud function not available in development mode');
}

export { callFunction };
