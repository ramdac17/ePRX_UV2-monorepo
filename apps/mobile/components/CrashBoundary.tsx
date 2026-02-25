import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { logCrash } from "@/utils/crashLogger";

export class CrashBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  async componentDidCatch(error: any) {
    await logCrash(error);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
          }}
        >
          <Text style={{ color: "#0ff", fontSize: 18 }}>SYSTEM FAILURE</Text>
          <TouchableOpacity onPress={() => this.setState({ hasError: false })}>
            <Text style={{ color: "#fff", marginTop: 10 }}>Restart UI</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
