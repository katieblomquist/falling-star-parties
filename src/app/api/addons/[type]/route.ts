import { NextRequest, NextResponse } from "next/server";
import { getDBConnection } from "@/db/connection";
import { AddOns } from "@/db/entities/addOns";

export async function GET(_: NextRequest,
    { params }: { params: { type: string } }) {
    try {
        const connection = await getDBConnection();
        const addOns = await connection.getRepository(AddOns).find({where: {type: params.type}});
        console.log(addOns);
        return NextResponse.json(addOns);
    } catch (error){
        console.error("Error fetching characters:", error);
        return NextResponse.json({ error: "Failed to get Characters" }, { status: 500 });
    }
    
}