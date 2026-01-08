const { React } = require('react');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');

const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

exports.handler = async (event) => {
  try {
    const { colors, aspect } = event.queryStringParameters;

    if (!colors) {
      return { statusCode: 400, body: 'Missing colors parameter' };
    }

    const hexArray = colors.split('-');
    const isVertical = aspect === 'vertical';

    // 1. SET DIMENSIONS based on Aspect Ratio
    // Pinterest = 1000x1500 (2:3), Standard = 1200x630
    const width = isVertical ? 1000 : 1200;
    const height = isVertical ? 1500 : 630;

    // This dynamically gets your site's URL (works in localhost AND production)
    const siteUrl = new URL(event.rawUrl).origin;
        
    // Make sure the filename matches exactly what you put in the public folder!
    const fontUrl = `${siteUrl}/ElmsSans-Bold.ttf`; 

    const fontResponse = await fetch(fontUrl);

    if (!fontResponse.ok) {
      // Fallback to a standard font if the file isn't found
      console.log("Font not found, falling back");
      const fallbackUrl = 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff';
      const fallback = await fetch(fallbackUrl);
      var fontData = await fallback.arrayBuffer();
    } else {
      var fontData = await fontResponse.arrayBuffer();
    }

    // 3. DEFINE LAYOUT
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
          // A. Color Stripes (Takes up more space in vertical mode)
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: isVertical ? 'column' : 'row', // Stack vertically on Pinterest? 
                // Actually, vertical stripes look better on tall images for palettes
                // Let's keep them as columns (row direction) but tall, 
                // OR stack them as rows (column direction).
                // Let's stick to vertical bars (row) as it's your brand style.
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
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    paddingBottom: isVertical ? 40 : 24, // More padding on tall images
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Elms Sans', // Satori uses the name defined below
                          fontSize: isVertical ? 40 : 26, // Bigger text on tall images
                          fontWeight: 700,
                          letterSpacing: '-0.02em',
                          color: getContrastColor(hex),
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
          // B. Footer
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
                borderTop: '1px solid #f0f0f0',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontFamily: 'Elms Sans',
                      fontSize: isVertical ? 64 : 48, // Bigger branding
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: '#161616',
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

    // 4. GENERATE SVG
    const svg = await satori(element, {
      width,
      height,
      fonts: [
        {
          name: 'Elms Sans', // Maps to the font data we fetched
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    });

    // 5. RENDER PNG
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
      body: JSON.stringify({ error: 'Failed to generate image' }),
    };
  }
};