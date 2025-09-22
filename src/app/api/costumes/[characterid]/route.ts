import { NextRequest, NextResponse } from "next/server";
import { getDBConnection } from "@/db/connection";
import { Costumes } from "@/db/entities/costumes";

export async function GET(
    _: NextRequest,
    { params }: { params: { characterid: string } }) {
    try {
        const connection = await getDBConnection();
        const characterId = parseInt(params.characterid);
        console.log("received id: ", characterId)
        const costumes = await connection.getRepository(Costumes).find({ where: { characterid: characterId } });
        console.log(costumes)
        return NextResponse.json(costumes);
    } catch (error) {
        console.error("Error fetching characters:", error);
        return NextResponse.json({ error: "Failed to get Characters" }, { status: 500 });
    }

}