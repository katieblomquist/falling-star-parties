

import { NextRequest, NextResponse } from "next/server";

import { ClientInfo } from "@/db/entities/clientInfo";
import { Events } from "@/db/entities/events";
import { EventsAddOns } from "@/db/entities/eventsAddOns";
import { EventsCharacters } from "@/db/entities/eventsCharacters";
import { DateTime } from "luxon";
import { getDBConnection } from "@/db/connection";

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      dateTime,
      address,
      packageId,
      childName,
      childAge,
      orgName,
      numGuests,
      outdoor,
      photoRelease,
      additionalInfo,
      addOnIds = [],
      costumeIds = [],
    } = body;

    // Initialize DataSource if not initialized
    const connection = await getDBConnection();

    const clientRepository = connection.getRepository(ClientInfo);
    const eventsRepository = connection.getRepository(Events);
    const eventsAddOnsRepository = connection.getRepository(EventsAddOns);
    const eventsCostumesRepository = connection.getRepository(EventsCharacters);

    // 1. Check if client exists
    let client = await clientRepository.findOne({
      where: { firstName, lastName, email },
    });

    // 2. Create new client if needed
    if (!client) {
      client = clientRepository.create({
        firstName,
        lastName,
        email,
        phone,
      });
      await clientRepository.save(client);
    }

    // 3. Create new event
    const event = eventsRepository.create({
      dateTime: DateTime.fromISO(dateTime),
      address,
      packageId,
      childName: childName ?? null,
      childAge: childAge ?? null,
      orgName: orgName ?? null,
      numGuests,
      outdoor,
      photoRelease,
      additionalInfo: additionalInfo ?? null,
      clientId: client.id,
    });

    await eventsRepository.save(event);

    // 4. Link add-ons
    for (const addOnId of addOnIds) {
      const eventAddOn = eventsAddOnsRepository.create({
        eventId: event.id,
        addOnId,
      });
      await eventsAddOnsRepository.save(eventAddOn);
    }

    // 5. Link costumes
    for (const costumeId of costumeIds) {
      const eventCostume = eventsCostumesRepository.create({
        eventId: event.id,
        costumeId,
      });
      await eventsCostumesRepository.save(eventCostume);
    }

    return NextResponse.json(
      {
        message: "Event request successfully created",
        eventId: event.id,
        clientId: client.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
