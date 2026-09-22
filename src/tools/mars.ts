import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const NASA_API_KEY = process.env.NASA_API_KEY ?? 'DEMO_KEY';

type MarsPhoto = {
  id: number;
  img_src: string;
  earth_date: string;
  camera: { full_name: string };
  rover: { name: string };
};

const ROVERS = ['curiosity', 'opportunity', 'spirit'] as const;

export function registerMarsTool(server: McpServer) {
  server.registerTool(
    'get_mars_photos',
    {
      description:
        "Get photos taken by NASA's Mars rovers. Returns up to 5 photo URLs with camera and date info. Curiosity is still active with 4000+ sols of photos.",
      inputSchema: {
        rover: z
          .enum(ROVERS)
          .default('curiosity')
          .describe('Which Mars rover to query'),
        sol: z
          .number()
          .int()
          .min(0)
          .default(1000)
          .describe('Martian sol (day) since landing. Try different values to explore.'),
      },
    },
    async ({ rover, sol }) => {
      const params = new URLSearchParams({ api_key: NASA_API_KEY, sol: String(sol) });
      const res = await fetch(
        `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?${params}`
      );
      if (!res.ok) {
        throw new Error(`NASA Mars API error ${res.status}: ${await res.text()}`);
      }

      const { photos } = (await res.json()) as { photos: MarsPhoto[] };

      if (photos.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No photos found for ${rover} on sol ${sol}. Try a different sol number.`,
            },
          ],
        };
      }

      const sample = photos.slice(0, 5);
      const lines = [
        `**${rover.charAt(0).toUpperCase() + rover.slice(1)} Mars Photos — Sol ${sol}**`,
        `Found ${photos.length} photos. Showing first ${sample.length}:`,
        '',
        ...sample.map((p, i) => `${i + 1}. ${p.camera.full_name} (${p.earth_date})\n   ${p.img_src}`),
      ];

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );
}
