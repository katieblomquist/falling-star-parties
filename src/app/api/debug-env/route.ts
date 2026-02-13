import { NextResponse } from "next/server";

export async function GET() {
  // Filter sensitive data - only show keys and first few characters
  const envDebug = Object.keys(process.env)
    .filter(key => 
      key.includes('NOTION') || 
      key.includes('EMAIL') || 
      key.includes('NODE_ENV') ||
      key.includes('VERCEL') ||
      key.includes('AWS') ||
      key.includes('AMPLIFY')
    )
    .reduce((acc, key) => {
      const value = process.env[key];
      acc[key] = value ? `${value.substring(0, 8)}...` : 'undefined';
      return acc;
    }, {} as Record<string, string>);

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    totalEnvVars: Object.keys(process.env).length,
    relevantEnvVars: envDebug,
    hasNotionKey: !!process.env.NOTION_KEY,
    notionKeyLength: process.env.NOTION_KEY?.length || 0,
    platform: process.env.VERCEL ? 'Vercel' : process.env.AWS_LAMBDA_FUNCTION_NAME ? 'AWS Lambda' : 'Unknown'
  });
}