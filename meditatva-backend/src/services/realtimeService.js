/**
 * Real-time Service using Server-Sent Events (SSE)
 * Provides inventory updates to connected clients
 */

class RealtimeService {
  constructor() {
    this.clients = new Set();
    console.log('🔄 Realtime Service initialized');
  }

  /**
   * Add a new SSE client connection
   */
  addClient(res) {
    this.clients.add(res);
    console.log(`✅ SSE client connected. Total clients: ${this.clients.size}`);
    
    // Remove client on disconnect
    res.on('close', () => {
      this.clients.delete(res);
      console.log(`❌ SSE client disconnected. Total clients: ${this.clients.size}`);
    });
  }

  /**
   * Remove a client connection
   */
  removeClient(res) {
    this.clients.delete(res);
    console.log(`🔌 SSE client removed. Total clients: ${this.clients.size}`);
  }

  /**
   * Broadcast inventory update to all connected clients
   */
  broadcastInventoryUpdate(data) {
    if (this.clients.size === 0) {
      console.log('⚠️ No SSE clients connected, skipping broadcast');
      return;
    }

    const message = JSON.stringify({
      type: 'inventory-update',
      timestamp: new Date().toISOString(),
      data
    });

    console.log(`📡 Broadcasting to ${this.clients.size} clients:`, data);

    // Send to all connected clients
    this.clients.forEach(client => {
      try {
        client.write(`data: ${message}\n\n`);
      } catch (error) {
        console.error('Failed to send to client:', error);
        this.clients.delete(client);
      }
    });
  }

  /**
   * Send initial inventory data to a new client
   */
  async sendInitialInventory(res, Inventory) {
    try {
      const inventoryItems = await Inventory.find({ current_stock: { $gt: 0 } })
        .populate('medicine')
        .lean();

      const message = JSON.stringify({
        type: 'initial-inventory',
        timestamp: new Date().toISOString(),
        data: inventoryItems
      });

      res.write(`data: ${message}\n\n`);
      console.log('✅ Sent initial inventory to new client');
    } catch (error) {
      console.error('Failed to send initial inventory:', error);
    }
  }

  /**
   * Get current connection count
   */
  getClientCount() {
    return this.clients.size;
  }
}

// Singleton instance
const realtimeService = new RealtimeService();

module.exports = realtimeService;
