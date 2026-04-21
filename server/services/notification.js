/**
 * Mock Notification Service
 * In a real-world scenario, this would interface with WebSockets (Socket.io) 
 * or a push notification service (Firebase FCM / Apple APNs) and calculate 
 * geospatial radii using PostGIS/MySQL spatial data.
 */

class NotificationService {
  static async broadcastToNearbyUsers(alertId, userId, lat, lng) {
    console.log(`\n======================================================`);
    console.log(`🚨 [BROADCAST SYSTEM] SOS DISPATCHED: Alert #${alertId}`);
    console.log(`Origin User: ${userId}`);
    console.log(`Coordinates: Lat ${lat}, Lng ${lng}`);
    console.log(`Action: Scanning radius for available volunteers/responders...`);
    console.log(`Status: 8 users found in 2km radius. Push notification dispatched.`);
    console.log(`======================================================\n`);
    
    // Simulate async network latency
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}

module.exports = NotificationService;
