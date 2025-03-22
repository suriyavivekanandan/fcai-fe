import mqtt from 'mqtt';

// MQTT configuration
export const MQTT_CONFIG = {
  brokerUrl: 'wss://test.mosquitto.org:8081',
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

    this.connect(); // Start connection on creation
  }

  connect() {
    if (this.connecting) return;

    this.connecting = true;
    this.client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
      clientId: MQTT_CONFIG.clientId,
      connectTimeout: 10000,
      reconnectPeriod: 5000,
      clean: true
    });

    this.client.on('connect', () => {
      this.connected = true;
      this.connecting = false;
      this.connectionAttempts = 0;

      this.client.subscribe(MQTT_CONFIG.topics.weight, (err) => {
        if (err) {
          console.error('Subscription error:', err);
        }
      });
    });

    this.client.on('message', (topic, message) => {
      if (topic === MQTT_CONFIG.topics.weight) {
        try {
          const data = JSON.parse(message.toString());
          if (data && typeof data.weight === 'number') {
            this.lastWeight = data.weight;

            // Notify all registered callbacks
            this.onWeightUpdateCallbacks.forEach(callback =>
              callback(this.lastWeight)
            );
          }
        } catch (error) {
          console.error('Error parsing MQTT message:', error);
        }
      }
    });

    this.client.on('error', (err) => {
      console.error('MQTT client error:', err);
      this.connected = false;
    });

    this.client.on('close', () => {
      this.connected = false;
      this.connecting = false;

      if (this.connectionAttempts < 5) {
        this.connectionAttempts++;
        setTimeout(() => this.connect(), 5000);
      } else {
        console.error('Max reconnection attempts reached.');
      }
    });

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

  onWeightUpdate(callback) {
    this.onWeightUpdateCallbacks.push(callback);
    return () => {
      const index = this.onWeightUpdateCallbacks.indexOf(callback);
      if (index !== -1) {
        this.onWeightUpdateCallbacks.splice(index, 1);
      }
    };
  }
}

// Singleton instance
const mqttClient = new MQTTClient();
export const getMQTTClient = () => mqttClient;

/**
 * Fetch latest weight from the MQTT client.
 */
export const fetchWeightFromESP = async () => {
  if (!mqttClient.isConnected()) {
    if (!mqttClient.isConnecting()) {
      mqttClient.resetConnectionAttempts();
      mqttClient.connect();
    }

    // Wait for MQTT to connect (max 5 seconds)
    let attempts = 0;
    while (!mqttClient.isConnected() && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    if (!mqttClient.isConnected()) {
      throw new Error("Failed to establish MQTT connection.");
    }
  }

  // ✅ Properly assign weight here
  const weight = mqttClient.getLastWeight();

  if (weight === 0 && !mqttClient.client.connected) {
    throw new Error("MQTT client not receiving data. Please check broker.");
  }

  return weight;
};

/**
 * Subscribe to real-time weight updates
 */
export const subscribeToWeightUpdates = (callback) => {
  return mqttClient.onWeightUpdate(callback);
};

// ✅ Start listening to live updates (optional logging)
subscribeToWeightUpdates((weight) => {
  console.log('Live Weight Update:', weight, 'g');
});
