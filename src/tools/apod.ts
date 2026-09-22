import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const NASA_API_KEY = process.env.NASA_API_KEY ?? 'DEMO_KEY';

type ApodResponse = {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  date: string;
  media_type: string;
  copyright?: string;
};

export function registerApodTool(server: McpServer) {
  server.registerTool(
    'get_astronomy_picture',
    {
      description:
        "Get NASA's Astronomy Picture of the Day (APOD). Returns the title, explanation, and image URL. APOD has been published daily since 1995-06-16.",
      inputSchema: {
        date: z
          .string()
          .optional()
          .describe('Date in YYYY-MM-DD format. Defaults to today.'),
      },
    },
    async ({ date }) => {
      const params = new URLSearchParams({ api_key: NASA_API_KEY });
      if (date) params.set('date', date);

      const res = await fetch(`https://api.nasa.gov/planetary/apod?${params}`);
      if (!res.ok) {
        throw new Error(`NASA APOD API error ${res.status}: ${await res.text()}`);
      }

      const data = (await res.json()) as ApodResponse;

      const lines = [
        `**${data.title}** (${data.date})`,
        data.copyright ? `© ${data.copyright}` : 'Public domain',
        '',
        data.explanation,
        '',
        `Image: ${data.hdurl ?? data.url}`,
      ];
      if (data.media_type === 'video') lines.push("(Today's APOD is a video)");

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );
}
