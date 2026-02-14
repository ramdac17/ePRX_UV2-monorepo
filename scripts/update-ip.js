const fs = require("fs");
const os = require("os");
const path = require("path");

function updateIP() {
  const networkInterfaces = os.networkInterfaces();
  let currentIp = "localhost";

  // prioritize Wi-Fi and Ethernet over VirtualBox/VPN adapters
  const priorityNames = ["wifi", "en0", "eth", "wlan"];

  const allInterfaces = Object.keys(networkInterfaces).sort((a, b) => {
    const aScore = priorityNames.some((name) => a.toLowerCase().includes(name))
      ? 0
      : 1;
    const bScore = priorityNames.some((name) => b.toLowerCase().includes(name))
      ? 0
      : 1;
    return aScore - bScore;
  });

  for (const name of allInterfaces) {
    for (const iface of networkInterfaces[name]) {
      if ((iface.family === "IPv4" || iface.family === 4) && !iface.internal) {
        currentIp = iface.address;
        break;
      }
    }
    if (currentIp !== "localhost") break;
  }

  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, ""); // Create if missing
  }

  let envContent = fs.readFileSync(envPath, "utf8");
  const lines = envContent.split("\n");

  const vars = {
    NEXT_PUBLIC_API_URL: `http://${currentIp}:3001/api`,
    NEXT_PUBLIC_STATIC_URL: `http://${currentIp}:3001`,
  };

  // Replace or Append logic
  Object.keys(vars).forEach((key) => {
    const index = lines.findIndex((line) => line.startsWith(`${key}=`));
    if (index !== -1) {
      lines[index] = `${key}=${vars[key]}`;
    } else {
      lines.push(`${key}=${vars[key]}`);
    }
  });

  fs.writeFileSync(envPath, lines.join("\n").trim() + "\n");
  console.log(`📡 [ePRX UV1]: Network Sync -> ${currentIp}`);
}

updateIP();
