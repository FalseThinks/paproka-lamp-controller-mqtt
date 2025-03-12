import React, { useEffect, useState } from "react";
import {
  useRootNavigationState,
  Tabs,
  useRouter,
  usePathname,
} from "expo-router";
import { useMQTT } from "../../context/MQTTContext";
import { FontAwesome } from "@expo/vector-icons";

export default function TabsLayout() {
  const { isConnected } = useMQTT();
  const rootNavigationState = useRootNavigationState();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Make sure rootNavigationState is valid and has a key
    if (!rootNavigationState?.key) return;

    const timer = setTimeout(() => {
      //if (!isConnected) {
      // Use replace instead of push to avoid stacking navigations
      //router.replace("/(tabs)/main");
      router.replace("/connect");
      //}
    }, 100);

    return () => clearTimeout(timer);
  }, [rootNavigationState, isConnected]); // Add isConnected as a dependency

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="main"
        options={{
          title: "Control",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="sliders" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: "Connect",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="wifi" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
