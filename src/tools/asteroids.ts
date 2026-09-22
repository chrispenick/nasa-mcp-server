import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const NASA_API_KEY = process.env.NASA_API_KEY ?? 'DEMO_KEY';

type NeoEntry = {
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: {
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: { kilometers_per_hour: string };
    miss_distance: { kilometers: string };
  }>;
};

export function registerAsteroidsTool(server: McpServer) {
  server.registerTool(
    'search_near_earth_objects',
    {
      description:
        'Search for asteroids and comets passing near Earth. Returns size, speed, closest approach distance, and hazard status. Date window must be 7 days or less.',
      inputSchema: {
        start_date: z.string().describe('Start date in YYYY-MM-DD format'),
        end_date: z
          .string()
          .describe('End date in YYYY-MM-DD format (maximum 7 days after start_date)'),
      },
    },
    async ({ start_date, end_date }) => {
      const params = new URLSearchParams({ api_key: NASA_API_KEY, start_date, end_date });
      const res = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?${params}`);
      if (!res.ok) {
        throw new Error(`NASA NeoWs API error ${res.status}: ${await res.text()}`);
      }

      const data = (await res.json()) as {
        element_count: number;
        near_earth_objects: Record<string, NeoEntry[]>;
      };

      const all = Object.values(data.near_earth_objects).flat();
      const hazardous = all.filter((a) => a.is_potentially_hazardous_asteroid);

      const lines = [
        `**Near-Earth Objects: ${start_date} to ${end_date}**`,
        `Total: ${data.element_count} objects (${hazardous.length} potentially hazardous)`,
        '',
      ];

      for (const neo of all.slice(0, 8)) {
        const approach = neo.close_approach_data[0];
        const dMin = Math.round(neo.estimated_diameter.meters.estimated_diameter_min);
        const dMax = Math.round(neo.estimated_diameter.meters.estimated_diameter_max);
        const speed = Math.round(
          Number(approach.relative_velocity.kilometers_per_hour)
        ).toLocaleString();
        const dist = Math.round(Number(approach.miss_distance.kilometers)).toLocaleString();
        const hazard = neo.is_potentially_hazardous_asteroid ? ' ⚠️ POTENTIALLY HAZARDOUS' : '';

        lines.push(`• **${neo.name}**${hazard}`);
        lines.push(`  Size: ${dMin}–${dMax} m | Speed: ${speed} km/h | Miss distance: ${dist} km`);
        lines.push(`  Closest approach: ${approach.close_approach_date}`);
        lines.push('');
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );
}
