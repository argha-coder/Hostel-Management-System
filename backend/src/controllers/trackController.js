import axios from 'axios';
import { UAParser } from 'ua-parser-js';

export const trackVisitor = async (req, res) => {
  try {
    const { 
      resolution, timezone, language, cookies, touchPoints, 
      pixelRatio, colorDepth, referrer, cores, ram, 
      networkType, batteryLevel, isCharging, localTime 
    } = req.body;

    // 1. IP Detection
    let ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.socket.remoteAddress || 
             'Unknown';
    
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    
    const isLocal = ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.');
    const queryIp = isLocal ? '8.8.8.8' : ip;

    // 2. Browser/OS Parsing
    const parser = new UAParser(req.headers['user-agent']);
    const uaResults = parser.getResult();
    
    const browser = `${uaResults.browser.name || 'Unknown'} ${uaResults.browser.version || ''}`.trim();
    const os = `${uaResults.os.name || 'Unknown'} ${uaResults.os.version || ''}`.trim();
    
    // Improve device detection (don't hardcode Apple/Macintosh)
    let device = 'Unknown Device';
    if (uaResults.device.vendor || uaResults.device.model) {
      device = `${uaResults.device.vendor || ''} ${uaResults.device.model || ''}`.trim();
    } else {
      // Fallback for desktops/laptops which often don't have vendor/model in UA
      device = `${uaResults.os.name || 'PC'} (${uaResults.device.type || 'Desktop'})`;
    }

    // 3. Geolocation & ISP
    let geoData = { country_name: 'Unknown', city: 'Unknown', region: 'Unknown', org: 'Unknown' };
    try {
      const response = await axios.get(`https://ipapi.co/${queryIp}/json/`);
      if (!response.data.error) {
        geoData = response.data;
      }
    } catch (e) {}

    const locationString = `${geoData.city}, ${geoData.region}, ${geoData.country_name}`;

    // 4. Create Detailed Discord Embed
    const webhookPayload = {
      username: 'Portfolio Analytics Bot',
      embeds: [
        {
          title: '🛡️ Detailed Visitor Analytics',
          color: 0x2b2d31,
          fields: [
            { name: '🌐 IP Address', value: `\`${ip}\``, inline: true },
            { name: '📍 Location', value: locationString, inline: true },
            { name: '🏢 ISP', value: geoData.org || 'Unknown', inline: true },
            { name: '💻 OS', value: os, inline: true },
            { name: '📱 Device', value: device, inline: true },
            { name: '🧭 Browser', value: browser, inline: true },
            { name: '🖥️ Resolution', value: resolution || 'Unknown', inline: true },
            { name: '⏱️ Timezone', value: timezone || 'Unknown', inline: true },
            { name: '🧠 CPU Cores', value: String(cores), inline: true },
            { name: '💾 RAM Estimate', value: ram || 'Unknown', inline: true },
            { name: '🗣️ Language', value: language || 'Unknown', inline: true },
            { name: '🍪 Cookies', value: cookies || 'Unknown', inline: true },
            { name: '🔋 Battery', value: batteryLevel || 'Unknown', inline: true },
            { name: '⚡ Charging', value: isCharging || 'Unknown', inline: true },
            { name: '🎨 Color Depth', value: colorDepth || 'Unknown', inline: true },
            { name: '🔍 Pixel Ratio', value: String(pixelRatio), inline: true },
            { name: '👆 Touch Points', value: String(touchPoints), inline: true },
            { name: '📶 Network', value: networkType || 'Unknown', inline: true },
            { name: '🔗 Referrer', value: referrer || 'Direct', inline: false },
            { name: '⏰ Visit Time (Local)', value: `\`${localTime}\``, inline: false },
            { name: '🕵️ User-Agent', value: `\`${req.headers['user-agent']}\``, inline: false }
          ],
          footer: { text: 'Bot provided by Spidy Bot' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    if (process.env.DISCORD_WEBHOOK_URL) {
      await axios.post(process.env.DISCORD_WEBHOOK_URL, webhookPayload);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};
