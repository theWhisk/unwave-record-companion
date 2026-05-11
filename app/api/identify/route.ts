import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SYSTEM_PROMPT =
  'You are a vinyl record identification and condition assessment assistant.\n' +
  'When shown an image of a record sleeve, respond with a single JSON object\n' +
  'and nothing else — no markdown fences, no commentary.\n\n' +
  'The object must have exactly two keys:\n' +
  '  "query": the artist and album title in the format "Artist - Album Title",\n' +
  '            or the string "UNKNOWN" if you cannot identify the record.\n' +
  '  "condition": one of the following exact strings if sleeve wear is visible\n' +
  '               and assessable, otherwise null:\n' +
  '    "Mint (M)"\n' +
  '    "Near Mint (NM or M-)"\n' +
  '    "Very Good Plus (VG+)"\n' +
  '    "Very Good (VG)"\n' +
  '    "Good Plus (G+)"\n' +
  '    "Good (G)"\n' +
  '    "Fair (F)"\n' +
  '    "Poor (P)"\n\n' +
  'Base the condition estimate on visible sleeve wear: writing, ring wear,\n' +
  'seam splits, staining, and creasing. If the image does not show enough\n' +
  'of the sleeve to assess condition, set "condition" to null.';

export async function POST(req: Request) {
  const formData = await req.formData();
  const image = formData.get('image');

  if (!image || !(image instanceof File)) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  try {
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mediaType = (image.type || 'image/jpeg') as Anthropic.Base64ImageSource['media_type'];

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text') as Anthropic.TextBlock | undefined;
    const raw = textBlock ? textBlock.text.trim() : null;

    let query = 'UNKNOWN';
    let condition: string | null = null;

    if (raw) {
      try {
        const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(stripped) as { query?: unknown; condition?: unknown };
        if (typeof parsed.query === 'string') query = parsed.query.trim();
        if (typeof parsed.condition === 'string') condition = parsed.condition;
      } catch {
        query = 'UNKNOWN';
      }
    }

    return NextResponse.json({ query, condition });
  } catch (error) {
    console.error('Failed to identify record:', error);
    return NextResponse.json({ error: 'Failed to identify record' }, { status: 500 });
  }
}
