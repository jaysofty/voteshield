import dotenv from "dotenv";
import neo4j from "neo4j-driver";

dotenv.config({ path: ".env.local" });

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error(
    "Missing COGNODB_URI, COGNODB_USERNAME or COGNODB_PASSWORD",
  );
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password),
);

async function seed() {
  const session = driver.session();

  try {
    console.log("Clearing existing VoteShield graph...");

    await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);

    // ---------------------------------------------------------
    // CONSTRAINTS
    // ---------------------------------------------------------

    console.log("Creating constraints...");

    await session.run(`
      CREATE CONSTRAINT voter_id IF NOT EXISTS
      FOR (v:Voter)
      REQUIRE v.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT voter_card_id IF NOT EXISTS
      FOR (c:VoterCard)
      REQUIRE c.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT polling_unit_id IF NOT EXISTS
      FOR (p:PollingUnit)
      REQUIRE p.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT attempt_id IF NOT EXISTS
      FOR (a:VotingAttempt)
      REQUIRE a.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT device_id IF NOT EXISTS
      FOR (d:Device)
      REQUIRE d.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT alert_id IF NOT EXISTS
      FOR (a:Alert)
      REQUIRE a.id IS UNIQUE
    `);

    // ---------------------------------------------------------
    // POLLING UNITS
    // ---------------------------------------------------------

    console.log("Creating polling units...");

    await session.run(
      `
      UNWIND $pollingUnits AS unit

      MERGE (p:PollingUnit {id: unit.id})

      SET
        p.name = unit.name,
        p.ward = unit.ward
      `,
      {
        pollingUnits: [
          {
            id: "PU-001",
            name: "Community Primary School",
            ward: "Ward 1",
          },
          {
            id: "PU-002",
            name: "Central Community Hall",
            ward: "Ward 2",
          },
          {
            id: "PU-003",
            name: "Unity Secondary School",
            ward: "Ward 3",
          },
          {
            id: "PU-004",
            name: "Town Hall",
            ward: "Ward 4",
          },
          {
            id: "PU-005",
            name: "Community Civic Centre",
            ward: "Ward 5",
          },
          {
            id: "PU-006",
            name: "St. Mary's Community School",
            ward: "Ward 6",
          },
        ],
      },
    );

    // ---------------------------------------------------------
    // VOTERS
    // ---------------------------------------------------------

    console.log("Creating voters...");

    await session.run(
      `
      UNWIND $voters AS voter

      MERGE (v:Voter {id: voter.id})

      SET
        v.name = voter.name,
        v.status = voter.status
      `,
      {
        voters: [
          {
            id: "V-001",
            name: "Ada Okafor",
            status: "REGISTERED",
          },
          {
            id: "V-002",
            name: "Daniel Johnson",
            status: "REGISTERED",
          },
          {
            id: "V-003",
            name: "Chiamaka Eze",
            status: "REGISTERED",
          },
          {
            id: "V-004",
            name: "Ibrahim Musa",
            status: "REGISTERED",
          },
          {
            id: "V-005",
            name: "Grace Williams",
            status: "REGISTERED",
          },
          {
            id: "V-006",
            name: "Emeka Nwosu",
            status: "REGISTERED",
          },
          {
            id: "V-007",
            name: "Fatima Bello",
            status: "REGISTERED",
          },
          {
            id: "V-008",
            name: "David Okoro",
            status: "REGISTERED",
          },
          {
            id: "V-009",
            name: "Blessing Adeyemi",
            status: "REGISTERED",
          },
          {
            id: "V-010",
            name: "Samuel Ibrahim",
            status: "REGISTERED",
          },
        ],
      },
    );

    // ---------------------------------------------------------
    // VOTER CARDS
    // ---------------------------------------------------------

    console.log("Creating voter cards...");

    await session.run(
      `
      UNWIND $cards AS card

      MATCH (v:Voter {id: card.voterId})

      MERGE (c:VoterCard {id: card.id})

      SET
        c.status = card.status

      MERGE (v)-[:OWNS]->(c)
      `,
      {
        cards: [
          {
            id: "VC-1001",
            voterId: "V-001",
            status: "ACTIVE",
          },
          {
            id: "VC-1002",
            voterId: "V-002",
            status: "ACTIVE",
          },
          {
            id: "VC-1003",
            voterId: "V-003",
            status: "ACTIVE",
          },
          {
            id: "VC-1004",
            voterId: "V-004",
            status: "ACTIVE",
          },
          {
            id: "VC-1005",
            voterId: "V-005",
            status: "ACTIVE",
          },
          {
            id: "VC-1006",
            voterId: "V-006",
            status: "ACTIVE",
          },
          {
            id: "VC-1007",
            voterId: "V-007",
            status: "ACTIVE",
          },
          {
            id: "VC-1008",
            voterId: "V-008",
            status: "ACTIVE",
          },
          {
            id: "VC-1009",
            voterId: "V-009",
            status: "ACTIVE",
          },
          {
            id: "VC-1010",
            voterId: "V-010",
            status: "ACTIVE",
          },
        ],
      },
    );

    // ---------------------------------------------------------
    // VOTER → POLLING UNIT
    // ---------------------------------------------------------

    console.log("Assigning voters to polling units...");

    await session.run(`
      MATCH (v1:Voter {id: "V-001"})
      MATCH (p1:PollingUnit {id: "PU-001"})
      MERGE (v1)-[:ASSIGNED_TO]->(p1)

      MATCH (v2:Voter {id: "V-002"})
      MATCH (p2:PollingUnit {id: "PU-002"})
      MERGE (v2)-[:ASSIGNED_TO]->(p2)

      MATCH (v3:Voter {id: "V-003"})
      MATCH (p3:PollingUnit {id: "PU-003"})
      MERGE (v3)-[:ASSIGNED_TO]->(p3)

      MATCH (v4:Voter {id: "V-004"})
      MATCH (p4:PollingUnit {id: "PU-004"})
      MERGE (v4)-[:ASSIGNED_TO]->(p4)

      MATCH (v5:Voter {id: "V-005"})
      MATCH (p1:PollingUnit {id: "PU-001"})
      MERGE (v5)-[:ASSIGNED_TO]->(p1)

      MATCH (v6:Voter {id: "V-006"})
      MATCH (p5:PollingUnit {id: "PU-005"})
      MERGE (v6)-[:ASSIGNED_TO]->(p5)

      MATCH (v7:Voter {id: "V-007"})
      MATCH (p6:PollingUnit {id: "PU-006"})
      MERGE (v7)-[:ASSIGNED_TO]->(p6)

      MATCH (v8:Voter {id: "V-008"})
      MATCH (p2:PollingUnit {id: "PU-002"})
      MERGE (v8)-[:ASSIGNED_TO]->(p2)

      MATCH (v9:Voter {id: "V-009"})
      MATCH (p3:PollingUnit {id: "PU-003"})
      MERGE (v9)-[:ASSIGNED_TO]->(p3)

      MATCH (v10:Voter {id: "V-010"})
      MATCH (p4:PollingUnit {id: "PU-004"})
      MERGE (v10)-[:ASSIGNED_TO]->(p4)
    `);

    // ---------------------------------------------------------
    // DEVICES
    // ---------------------------------------------------------

    console.log("Creating devices...");

    await session.run(
      `
      UNWIND $devices AS device

      MERGE (d:Device {id: device.id})

      SET
        d.name = device.name
      `,
      {
        devices: [
          {
            id: "DEV-001",
            name: "Polling Device 001",
          },
          {
            id: "DEV-002",
            name: "Polling Device 002",
          },
          {
            id: "DEV-003",
            name: "Polling Device 003",
          },
          {
            id: "DEV-004",
            name: "Polling Device 004",
          },
          {
            id: "DEV-005",
            name: "Polling Device 005",
          },
        ],
      },
    );

    // ---------------------------------------------------------
    // NORMAL VOTING ATTEMPTS
    // ---------------------------------------------------------

    console.log("Creating normal voting attempts...");

    await session.run(`
      MATCH (c1:VoterCard {id: "VC-1001"})
      MATCH (p1:PollingUnit {id: "PU-001"})
      MATCH (d1:Device {id: "DEV-001"})

      CREATE (a1:VotingAttempt {
        id: "VA-001",
        status: "COMPLETED",
        timestamp: datetime("2026-08-25T08:30:00Z")
      })

      MERGE (c1)-[:USED_IN]->(a1)
      MERGE (a1)-[:OCCURRED_AT]->(p1)
      MERGE (a1)-[:MADE_FROM]->(d1)


      MATCH (c2:VoterCard {id: "VC-1002"})
      MATCH (p2:PollingUnit {id: "PU-002"})
      MATCH (d2:Device {id: "DEV-002"})

      CREATE (a2:VotingAttempt {
        id: "VA-002",
        status: "COMPLETED",
        timestamp: datetime("2026-08-25T08:45:00Z")
      })

      MERGE (c2)-[:USED_IN]->(a2)
      MERGE (a2)-[:OCCURRED_AT]->(p2)
      MERGE (a2)-[:MADE_FROM]->(d2)
    `);

    // ---------------------------------------------------------
    // DUPLICATE CARD ATTEMPT
    // ---------------------------------------------------------

    console.log("Creating suspicious duplicate attempt...");

    await session.run(`
      MATCH (c:VoterCard {id: "VC-1001"})
      MATCH (p:PollingUnit {id: "PU-001"})
      MATCH (d:Device {id: "DEV-003"})

      CREATE (a:VotingAttempt {
        id: "VA-003",
        status: "FLAGGED",
        timestamp: datetime("2026-08-25T10:43:00Z")
      })

      MERGE (c)-[:USED_IN]->(a)
      MERGE (a)-[:OCCURRED_AT]->(p)
      MERGE (a)-[:MADE_FROM]->(d)

      CREATE (alert:Alert {
        id: "ALERT-001",
        type: "DUPLICATE_CARD_USAGE",
        severity: "HIGH",
        status: "OPEN",
        message: "Voter card has already been associated with a completed voting attempt.",
        createdAt: datetime("2026-08-25T10:43:00Z")
      })

      MERGE (a)-[:TRIGGERED]->(alert)
    `);

    // ---------------------------------------------------------
    // SUSPICIOUS DEVICE PATTERN
    // ---------------------------------------------------------

    console.log("Creating suspicious device pattern...");

    await session.run(`
      MATCH (c:VoterCard {id: "VC-1003"})
      MATCH (p:PollingUnit {id: "PU-003"})
      MATCH (d:Device {id: "DEV-003"})

      CREATE (a:VotingAttempt {
        id: "VA-004",
        status: "FLAGGED",
        timestamp: datetime("2026-08-25T11:05:00Z")
      })

      MERGE (c)-[:USED_IN]->(a)
      MERGE (a)-[:OCCURRED_AT]->(p)
      MERGE (a)-[:MADE_FROM]->(d)

      CREATE (alert:Alert {
        id: "ALERT-002",
        type: "UNUSUAL_DEVICE_ACTIVITY",
        severity: "MEDIUM",
        status: "OPEN",
        message: "Device has been associated with multiple voter identities.",
        createdAt: datetime("2026-08-25T11:05:00Z")
      })

      MERGE (a)-[:TRIGGERED]->(alert)
    `);

    // ---------------------------------------------------------
    // ADDITIONAL CLEAN VOTING ATTEMPTS
    //
    // These give us data that can be used to test additional
    // voter IDs without immediately generating alerts.
    // ---------------------------------------------------------

    console.log("Creating additional clean voting attempts...");

    await session.run(`
      MATCH (c6:VoterCard {id: "VC-1006"})
      MATCH (p6:PollingUnit {id: "PU-005"})
      MATCH (d6:Device {id: "DEV-004"})

      CREATE (a6:VotingAttempt {
        id: "VA-005",
        status: "COMPLETED",
        timestamp: datetime("2026-08-25T11:20:00Z")
      })

      MERGE (c6)-[:USED_IN]->(a6)
      MERGE (a6)-[:OCCURRED_AT]->(p6)
      MERGE (a6)-[:MADE_FROM]->(d6)


      MATCH (c7:VoterCard {id: "VC-1007"})
      MATCH (p7:PollingUnit {id: "PU-006"})
      MATCH (d7:Device {id: "DEV-005"})

      CREATE (a7:VotingAttempt {
        id: "VA-006",
        status: "COMPLETED",
        timestamp: datetime("2026-08-25T11:35:00Z")
      })

      MERGE (c7)-[:USED_IN]->(a7)
      MERGE (a7)-[:OCCURRED_AT]->(p7)
      MERGE (a7)-[:MADE_FROM]->(d7)
    `);

    // ---------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------

    const summary = await session.run(`
      MATCH (v:Voter)
      WITH count(v) AS voters

      MATCH (c:VoterCard)
      WITH voters, count(c) AS cards

      MATCH (a:VotingAttempt)
      WITH voters, cards, count(a) AS attempts

      MATCH (alert:Alert)
      RETURN
        voters,
        cards,
        attempts,
        count(alert) AS alerts
    `);

    const record = summary.records[0];

    console.log("");
    console.log("======================================");
    console.log("VoteShield seed completed successfully");
    console.log("======================================");
    console.log(`Voters:          ${record.get("voters")}`);
    console.log(`Voter cards:     ${record.get("cards")}`);
    console.log(`Voting attempts: ${record.get("attempts")}`);
    console.log(`Alerts:          ${record.get("alerts")}`);
    console.log("======================================");
  } finally {
    await session.close();
    await driver.close();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});