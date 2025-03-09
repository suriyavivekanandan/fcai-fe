import mqtt from 'mqtt';

export const MQTT_CONFIG = {
  // Using the same broker as your ESP8266 code
  brokerUrl: 'wss://test.mosquitto.org:8081',
  // Alternative WebSocket URL if TCP port is blocked
  // brokerUrl: 'ws://test.mosquitto.org:8080',
  clientId: 'WebAppMQTTClient-' + Math.random().toString(16).substring(2, 8),
  topics: {
    weight: 'weight-sensor-FCAI/data'
  }
};

class MQTTClient {
  constructor() {
    this.client = null;
    this.lastWeight = 0;
    this.connected = false;
    this.connecting = false;
    this.connectionAttempts = 0;
    this.onWeightUpdateCallbacks = [];
    this.connect();
  }

  connect() {
    if (this.connecting) return;
    
    this.connecting = true;
    // console.log('Connecting to MQTT broker...');
    
    this.client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
      clientId: MQTT_CONFIG.clientId,
      connectTimeout: 10000, // 10 seconds timeout
      reconnectPeriod: 5000, // 5 seconds between reconnection attempts
      clean: true
    });

    this.client.on('connect', () => {
      // console.log('Connected to MQTT broker');
      this.connected = true;
      this.connecting = false;
      this.connectionAttempts = 0;
      
      // Subscribe to the weight sensor topic
      this.client.subscribe(MQTT_CONFIG.topics.weight, (err) => {
        if (!err) {
          // console.log(`Subscribed to ${MQTT_CONFIG.topics.weight}`);
        } else {
          // console.error('Subscription error:', err);
        }
      });
    });

    this.client.on('message', (topic, message) => {
      if (topic === MQTT_CONFIG.topics.weight) {
        try {
          const data = JSON.parse(message.toString());
          if (data && typeof data.weight === 'number') {
            this.lastWeight = data.weight;
            
            // Log current weight to console
            // console.log('Current weight from MQTT:', this.lastWeight, 'g');
            
            // Notify all registered callbacks
            this.onWeightUpdateCallbacks.forEach(callback => callback(this.lastWeight));
          }
        } catch (error) {
          // console.error('Error parsing MQTT message:', error);
        }
      }
    });

    this.client.on('error', (err) => {
      // console.error('MQTT client error:', err);
      this.connected = false;
    });

    this.client.on('close', () => {
      // console.log('MQTT connection closed');
      this.connected = false;
      this.connecting = false;
      
      // Maximum reconnection attempts
      if (this.connectionAttempts < 5) {
        this.connectionAttempts++;
        // console.log(`Reconnection attempt ${this.connectionAttempts}/5 in 5 seconds...`);
        // Try to reconnect after a delay
        setTimeout(() => this.connect(), 5000);
      } else {
        // console.log('Maximum reconnection attempts reached. Please check your connection.');
      }
    });
    
    // Add a specific handler for connection timeout
    this.client.on('disconnect', () => {
      console.log('MQTT broker disconnected');
      this.connected = false;
      this.connecting = false;
    });
  }

  getLastWeight() {
    return this.lastWeight;
  }

  isConnected() {
    return this.connected;
  }
  
  isConnecting() {
    return this.connecting;
  }

  onWeightUpdate(callback) {
    this.onWeightUpdateCallbacks.push(callback);
    return () => {
      // Return a function to unregister the callback
      const index = this.onWeightUpdateCallbacks.indexOf(callback);
      if (index !== -1) {
        this.onWeightUpdateCallbacks.splice(index, 1);
      }
    };
  }

  resetConnectionAttempts() {
    this.connectionAttempts = 0;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.connected = false;
      this.connecting = false;
    }
  }
}

// Create singleton instance
const mqttClient = new MQTTClient();

export const getMQTTClient = () => mqttClient;

// For compatibility with your existing code
export const fetchWeightFromESP = async () => {
  // If not connected, try to establish a connection
  if (!mqttClient.isConnected()) {
    if (!mqttClient.isConnecting()) {
      // Start a new connection attempt
      mqttClient.resetConnectionAttempts();
      mqttClient.connect();
    }
    
    // Wait for connection for up to 5 seconds
    let attempts = 0;
    while (!mqttClient.isConnected() && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      attempts++;
    }
    
    if (!mqttClient.isConnected()) {
      throw new Error("Failed to establish MQTT connection. Please check your network.");
    }
  }
  
  // If we get here, we should be connected
  // Get the last known weight from the MQTT client
  // const weight = mqttClient.getLastWeight();
  
  if (weight === 0 && !mqttClient.client.connected) {
    throw new Error("MQTT client is not receiving data. Check the broker connection.");
  }
  
  // console.log('Fetched weight from MQTT:', weight, 'g');
  return weight;
};

// New function to get weight updates via callbacks
export const subscribeToWeightUpdates = (callback) => {
  return mqttClient.onWeightUpdate(callback);
};

// Initialize continuous logging
subscribeToWeightUpdates((weight) => {
  // This will log every weight update received from MQTT
  // console.log('Weight update:', weight, 'g');
});

// console.log('MQTT weight monitoring started');