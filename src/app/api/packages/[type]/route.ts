import { NextRequest, NextResponse } from "next/server";
import { getDBConnection } from "@/db/connection";
import { Packages } from "@/db/entities/packages";

export async function GET(_: NextRequest,
    { params }: { params: { type: string } }) {
    try {
        const connection = await getDBConnection();
        const packages = await connection.getRepository(Packages).find({where: {type: params.type}});
        console.log(packages);
        return NextResponse.json(packages);
    } catch (error){
        console.error("Error fetching characters:", error);
        return NextResponse.json({ error: "Failed to get Characters" }, { status: 500 });
    }
    
}