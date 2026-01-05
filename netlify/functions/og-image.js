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
    
    // 1. FETCH FONT (Using Unpkg for stability)
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
          flexDirection: 'column', // Vertical stack: Colors on top, Footer on bottom
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
        },
        children: [
          // A. Color Stripes Section (Top 85%)
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '85%', 
              },
              children: hexArray.map((hex) => ({
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flex: 1,
                    height: '100%',
                    backgroundColor: '#' + hex,
                    flexDirection: 'column',
                    justifyContent: 'flex-end', // Push hex code to bottom of stripe
                    alignItems: 'center',
                    paddingBottom: 24,          // Padding above the footer
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Inter',
                          fontSize: 26,
                          fontWeight: 700,
                          letterSpacing: '-0.02em',
                          color: getContrastColor(hex), // Dynamic contrast
                          textTransform: 'uppercase',
                        },
                        children: '#' + hex,
                      },
                    }
                  ],
                },
              })),
            },
          },
          // B. Footer Watermark Section (Bottom 15%)
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
                borderTop: '1px solid #f0f0f0', // Subtle separation line
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontFamily: 'Inter',
                      fontSize: 32,
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: '#161616', // The requested color
                    },
                    children: 'ccolorpalette.com',
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