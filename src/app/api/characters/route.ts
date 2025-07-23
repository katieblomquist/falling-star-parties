import { NextResponse } from "next/server";
import { getDBConnection } from "@/db/connection";
import { Characters } from "@/db/entities/characters";

export async function GET() {
    try {
        const connection = await getDBConnection();
        const characters = await connection.getRepository(Characters).find();
        console.log(characters)
        return NextResponse.json(characters);
    } catch (error){
        console.error("Error fetching characters:", error);
        return NextResponse.json({ error: "Failed to get Characters" }, { status: 500 });
    }
    
}