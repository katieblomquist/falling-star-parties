import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

/**
 * Health check endpoint to verify environment configuration
 * GET /api/health
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  
  // Check environment variables
  const notionKey = process.env.NOTION_KEY;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;
  const emailUser = process.env.EMAIL_USER;
  const nodeEnv = process.env.NODE_ENV;
  
  const checks = {
    timestamp,
    environment: nodeEnv,
    notionKey: {
      exists: !!notionKey,
      length: notionKey?.length || 0,
      prefix: notionKey?.substring(0, 4) || 'none',
    },
    notionDatabaseId: {
      exists: !!notionDatabaseId,
      length: notionDatabaseId?.length || 0,
      prefix: notionDatabaseId?.substring(0, 4) || 'none',
    },
    emailUser: {
      exists: !!emailUser,
      value: emailUser || 'none',
    },
    totalEnvVars: Object.keys(process.env).length,
  };

  console.log('[HEALTH CHECK]', JSON.stringify(checks, null, 2));

  // Try to initialize Notion client
  let notionStatus = 'unchecked';
  if (notionKey) {
    try {
      const notion = new Client({ auth: notionKey });
      // Test connection by attempting to retrieve the database
      if (notionDatabaseId) {
        await notion.databases.retrieve({ database_id: notionDatabaseId });
        notionStatus = 'connected';
      } else {
        notionStatus = 'missing_database_id';
      }
    } catch (error) {
      notionStatus = error instanceof Error ? error.message : 'connection_failed';
    }
  } else {
    notionStatus = 'missing_key';
  }

  return NextResponse.json({
    status: notionStatus === 'connected' ? 'healthy' : 'degraded',
    checks: {
      ...checks,
      notionConnection: notionStatus,
    },
  });
}
