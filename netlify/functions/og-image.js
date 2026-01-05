const { React } = require('react');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');

// Helper: Calculate if text should be black or white based on background
const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

exports.handler = async (event) => {
  try {
    const { colors } = event.queryStringParameters;
    
    if (!colors) {
      return { statusCode: 400, body: 'Missing colors parameter' };
    }

    const hexArray = colors.split('-');
    
    // 1. FETCH FONT (Inter Bold)
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
          flexDirection: 'row', // Horizontal layout
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
        },
        children: hexArray.map((hex) => ({
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flex: 1, // Each color takes equal width
              height: '100%',
              backgroundColor: '#' + hex,
              flexDirection: 'column',
              justifyContent: 'flex-end', // Push text to bottom
              alignItems: 'center',       // Center text horizontally
              paddingBottom: 40,          // Space from bottom
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Inter',
                    fontSize: 28, // Large, readable font
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: getContrastColor(hex), // Dynamic text color
                    textTransform: 'uppercase',
                  },
                  children: '#' + hex,
                },
              }
            ],
          },
        })),
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