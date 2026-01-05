const { React } = require('react');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');

exports.handler = async (event) => {
  try {
    const { colors } = event.queryStringParameters;
    
    if (!colors) {
      return { statusCode: 400, body: 'Missing colors parameter' };
    }

    const hexArray = colors.split('-');
    
    // 1. FETCH FONT (Using Unpkg which is more stable for bots)
    const fontUrl = 'https://unpkg.com/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff';
    const fontResponse = await fetch(fontUrl);

    if (!fontResponse.ok) {
      throw new Error(`Failed to fetch font: ${fontResponse.statusText}`);
    }

    const fontData = await fontResponse.arrayBuffer();

    // 2. DEFINE LAYOUT
    const element = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
        },
        children: [
          // Color Stripes
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                width: '100%',
                height: '85%',
              },
              children: hexArray.map((hex) => ({
                type: 'div',
                props: {
                  style: {
                    flex: 1,
                    height: '100%',
                    backgroundColor: '#' + hex,
                  },
                },
              })),
            },
          },
          // Footer
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '15%',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #eaeaea',
                fontFamily: 'Inter', 
                fontSize: 32,
                fontWeight: 700,
                color: '#111827',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    children: 'CColorPalette',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { marginLeft: 12, color: '#9CA3AF', fontWeight: 400 },
                    children: '#' + hexArray[0],
                  },
                },
              ],
            },
          },
        ],
      },
    };

    // 3. GENERATE SVG
    const svg = await satori(element, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    });

    // 4. RENDER PNG
    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      body: pngBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate image', details: error.message }),
    };
  }
};