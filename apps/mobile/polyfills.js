import { Buffer } from "buffer";
import { TextEncoder, TextDecoder } from "text-encoding";

// 1. Set Globals
global.Buffer = Buffer;

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

// 2. Apply URL Polyfill (Depends on TextDecoder being ready)
import "react-native-url-polyfill/auto";

console.log("🚀 ePRX UV1: All Globals Initialized");
