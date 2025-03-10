import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useMQTT } from '../context/MQTTContext';
import { useRouter } from 'expo-router';
 
export default function ConnectScreen() {
  const { connect, isConnected } = useMQTT();
  const router = useRouter();
  const [address, setAddress] = useState<string>('');
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
 
  const handleConnect = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an MQTT server address');
      return;
    }
 
    // Cambiar `mqtt://` a `ws://`
    let formattedAddress = address.replace("mqtt://", "ws://");
 
    if (!/^ws:\/\/[\d.]+:\d+$/.test(formattedAddress)) {
      Alert.alert('Error', 'Invalid MQTT address format. Use ws://IP:PORT');
      return;
    }
 
    if (requiresAuth && (!username || !password)) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }
 
    setIsConnecting(true);
 
    try {
      const response = await connect({
        address: formattedAddress,
        requiresAuth,
        username,
        password
      });
 
      Alert.alert('✅ Connection Successful', 'Successfully connected to the MQTT server.');
 
      if (response) {
        console.log("Cambiando la ventana")
        router.replace('/(tabs)/main');
      }
    } catch (error: unknown) {
      console.error("❌ Connection error:", error);
      Alert.alert('❌ Connection Failed', 'Could not connect to the MQTT server. Please check your settings.');
    } finally {
      setIsConnecting(false);
    }
  };
 
  return (
<View style={styles.container}>
<Text style={styles.title}>Connect to MQTT Server</Text>
 
      <View style={styles.inputContainer}>
<Text style={styles.label}>Server Address:</Text>
<TextInput
          style={styles.input}
          placeholder="e.g., mqtt://192.168.1.100:1883"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
        />
</View>
 
      <View style={styles.switchContainer}>
<Text style={styles.label}>Requires Authentication:</Text>
<Switch
          value={requiresAuth}
          onValueChange={setRequiresAuth}
        />
</View>
 
      {requiresAuth && (
<>
<View style={styles.inputContainer}>
<Text style={styles.label}>Username:</Text>
<TextInput
              style={styles.input}
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
</View>
<View style={styles.inputContainer}>
<Text style={styles.label}>Password:</Text>
<TextInput
              style={styles.input}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
</View>
</>
      )}
 
      <TouchableOpacity 
        style={[styles.connectButton, isConnecting && styles.connectingButton]} 
        onPress={handleConnect}
        disabled={isConnecting}
>
<Text style={styles.connectButtonText}>
          {isConnecting ? 'Connecting...' : 'Connect'}
</Text>
</TouchableOpacity>
</View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  connectingButton: {
    backgroundColor: '#7faad5',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});