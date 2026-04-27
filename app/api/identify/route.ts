import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SYSTEM_PROMPT =
  'You are a vinyl record identification assistant. When shown an image of a record album cover, ' +
  'respond with ONLY the artist name and album title in this exact format: "Artist - Album Title". ' +
  'If you cannot identify the record, respond with exactly: UNKNOWN. Do not include any other text.';

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
      max_tokens: 100,
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
    const query = textBlock ? textBlock.text.trim() : 'UNKNOWN';

    return NextResponse.json({ query });
  } catch (error) {
    console.error('Failed to identify record:', error);
    return NextResponse.json({ error: 'Failed to identify record' }, { status: 500 });
  }
}
