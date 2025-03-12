import React, { createContext, useState, useContext, useEffect } from "react";
import mqtt from "mqtt";

const MQTTContext = createContext();

export const useMQTT = () => useContext(MQTTContext);

export const MQTTProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState({
    address: "",
    requiresAuth: false,
    username: "",
    password: "",
  });

  const connect = async (info) => {
    console.log("🔌 Connecting to MQTT...");

    return new Promise((resolve, reject) => {
      {
        setConnectionInfo(info);

        // Cambiar `mqtt://` por `ws://`
        let host = info.address.replace("mqtt://", "ws://");

        console.log(`🌍 Connecting to MQTT broker at ${host}`);

        const clientId = `mobile_client_${Math.random()
          .toString(16)
          .substring(2, 8)}`;

        const options = {
          clientId,
          username: info.requiresAuth ? info.username : undefined,
          password: info.requiresAuth ? info.password : undefined,
          clean: true,
          reconnectPeriod: 1000, // Reconexión automática cada 1 seg
          connectTimeout: 30 * 1000, // Timeout de 30 seg
        };

        const mqttClient = mqtt.connect(host, options);

        mqttClient.on("connect", () => {
          console.log("✅ Connected to MQTT broker");
          setIsConnected(true);
          setClient(mqttClient);
          resolve(true);
        });

        mqttClient.on("error", (err) => {
          console.error("❌ Connection error:", err);
          mqttClient.end();
          setIsConnected(false);
          reject(false);
        });

        mqttClient.on("close", () => {
          console.log("🔴 Connection closed");
          setIsConnected(false);
          reject(false);
        });

        mqttClient.on("message", (topic, message) => {
          console.log(`📩 Message received on ${topic}: ${message.toString()}`);
        });

        setClient(mqttClient);
      }
    });
  };

  const disconnect = () => {
    if (client) {
      try {
        client.end();
        console.log("🔌 Disconnected from MQTT broker");
      } catch (e) {
        console.error("❌ Error during disconnect:", e);
      } finally {
        setClient(null);
        setIsConnected(false);
      }
    }
  };

  const publishData = (topic, data, qos = 0, retained = false) => {
    if (client && isConnected) {
      try {
        const jsonData =
          typeof data === "object" ? JSON.stringify(data) : data.toString();
        client.publish(topic, jsonData, { qos, retain: retained });
        console.log(`📤 Published message to ${topic}: ${jsonData}`);
        return true;
      } catch (e) {
        console.error("❌ Error publishing message:", e);
        return false;
      }
    }
    console.log("⚠️ Cannot publish - client not connected");
    return false;
  };

  const subscribe = (topic, qos = 0) => {
    if (client && isConnected) {
      try {
        client.subscribe(topic, { qos });
        console.log(`📡 Subscribed to topic: ${topic}`);
        return true;
      } catch (e) {
        console.error("❌ Error subscribing to topic:", e);
        return false;
      }
    }
    console.log("⚠️ Cannot subscribe - client not connected");
    return false;
  };

  const unsubscribe = (topic) => {
    if (client && isConnected) {
      try {
        client.unsubscribe(topic);
        console.log(`🚫 Unsubscribed from topic: ${topic}`);
        return true;
      } catch (e) {
        console.error("❌ Error unsubscribing from topic:", e);
        return false;
      }
    }
    console.log("⚠️ Cannot unsubscribe - client not connected");
    return false;
  };

  useEffect(() => {
    return () => {
      if (client) {
        disconnect();
      }
    };
  }, [client]);

  return (
    <MQTTContext.Provider
      value={{
        connect,
        disconnect,
        isConnected,
        connectionInfo,
        publishData,
        subscribe,
        unsubscribe,
      }}
    >
      {children}
    </MQTTContext.Provider>
  );
};

export default MQTTContext;
