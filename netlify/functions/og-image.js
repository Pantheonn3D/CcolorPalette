// netlify/functions/og-image.js
const { React } = require('react');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');

exports.handler = async (event) => {
  try {
    // 1. Parse the hex codes from the URL (e.g. ?colors=FF0000-00FF00-0000FF)
    const { colors } = event.queryStringParameters;
    
    if (!colors) {
      return { statusCode: 400, body: 'Missing colors parameter' };
    }

    const hexArray = colors.split('-');
    
// 2. Fetch a font (Satori requires a font file)
    // Using raw.githubusercontent.com avoids redirect issues
    const fontResponse = await fetch(
        'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter-Bold.ttf'
      );
      
      if (!fontResponse.ok) {
        throw new Error('Failed to fetch font file');
      }
  
      const fontData = await fontResponse.arrayBuffer();

    // 3. Define the HTML structure (using React-like object syntax for Satori)
    // We create a container with a flex row for colors and a footer for the logo
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
          // The Color Stripes
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                width: '100%',
                height: '85%', // Top 85% is color
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
          // The Footer (Brand)
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '15%', // Bottom 15% is white branding area
                backgroundColor: '#ffffff',
                borderTop: '1px solid #eaeaea',
                fontFamily: 'Inter',
                fontSize: 32,
                fontWeight: 700,
                color: '#111827',
              },
              children: [
                // You can add an SVG logo icon here if you want
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
                    children: '#' + hexArray[0], // Show the first hex code
                  },
                },
              ],
            },
          },
        ],
      },
    };

    // 4. Convert to SVG using Satori
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

    // 5. Convert SVG to PNG using Resvg
    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // 6. Return the image
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache forever
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