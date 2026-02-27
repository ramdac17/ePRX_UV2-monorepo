import { Buffer } from "buffer";
import { TextEncoder, TextDecoder } from "text-encoding";

global.Buffer = Buffer;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Important: setup URL polyfill after encoders are global
import "react-native-url-polyfill/auto";

console.log("🚀 ePRX UV2: Global Engine Primed");
