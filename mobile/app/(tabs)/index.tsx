import { View, Text, Pressable } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>CampusQuest</Text>
      <Text style={{ fontSize: 16, opacity: 0.7, textAlign: "center", marginBottom: 18 }}>
        Your real-life RPG for URI students.
      </Text>

      <View style={{ width: "100%", gap: 10 }}>
        <Pressable
          style={{ padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
          onPress={() => {}}
        >
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Start a Quest</Text>
        </Pressable>

        <Pressable
          style={{ padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
          onPress={() => {}}
        >
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Log XP</Text>
        </Pressable>
      </View>
    </View>
  );
}
