export default async (request, context) => {
    const userAgent = request.headers.get("user-agent") || "Unknown";
    
    // LOG EVERYTHING (Temporary Debugging)
    console.log(`DEBUG HIT: ${userAgent} visited ${request.url}`);
  
    return context.next();
  };