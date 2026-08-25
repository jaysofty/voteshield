import { runQuery } from "@/lib/cognodb/session";
import {
  CreateVotingAttemptInput,
  CreateVotingAttemptResult,
} from "@/types/vote-attempts";
import { VoterCardListItem, VotingReferenceData } from "@/types/voterscard";
import type {
  Alert,
  DashboardStats,
  Investigation,
  VotingAttempt,
} from "@/types/voteshield";

export async function getDashboardStats(): Promise<DashboardStats> {
  const result = await runQuery<{
    voters: number;
    votingAttempts: number;
    suspiciousAttempts: number;
    activeAlerts: number;
    duplicateCardAlerts: number;
    deviceAlerts: number;
    resolvedAlerts: number;
  }>(`
    MATCH (v:Voter)
    WITH count(v) AS voters

    MATCH (attempt:VotingAttempt)
    WITH voters, count(attempt) AS votingAttempts

    MATCH (flagged:VotingAttempt {status: "FLAGGED"})
    WITH voters, votingAttempts, count(flagged) AS suspiciousAttempts

    OPTIONAL MATCH (alert:Alert)

    RETURN
      voters,
      votingAttempts,
      suspiciousAttempts,

      count(
        CASE
          WHEN alert.status IN ["OPEN", "INVESTIGATING"]
          THEN alert
        END
      ) AS activeAlerts,

      count(
        CASE
          WHEN alert.type = "DUPLICATE_CARD_USAGE"
          THEN alert
        END
      ) AS duplicateCardAlerts,

      count(
        CASE
          WHEN alert.type = "UNUSUAL_DEVICE_ACTIVITY"
          THEN alert
        END
      ) AS deviceAlerts,

      count(
        CASE
          WHEN alert.status = "RESOLVED"
          THEN alert
        END
      ) AS resolvedAlerts
  `);

  const row = result[0];

  return {
    voters: Number(row?.voters ?? 0),
    votingAttempts: Number(row?.votingAttempts ?? 0),
    suspiciousAttempts: Number(row?.suspiciousAttempts ?? 0),
    activeAlerts: Number(row?.activeAlerts ?? 0),
    duplicateCardAlerts: Number(row?.duplicateCardAlerts ?? 0),
    deviceAlerts: Number(row?.deviceAlerts ?? 0),
    resolvedAlerts: Number(row?.resolvedAlerts ?? 0),
  };
}

export async function getRecentAttempts(): Promise<VotingAttempt[]> {
  return runQuery<VotingAttempt>(`
    MATCH (v:Voter)-[:OWNS]->(card:VoterCard)
          -[:USED_IN]->(attempt:VotingAttempt)
          -[:OCCURRED_AT]->(pollingUnit:PollingUnit)

    OPTIONAL MATCH (attempt)-[:MADE_FROM]->(device:Device)

    RETURN
      attempt.id AS id,
      attempt.status AS status,
      toString(attempt.timestamp) AS timestamp,
      v.name AS voterName,
      card.id AS voterCardId,
      pollingUnit.name AS pollingUnit,
      device.id AS deviceId

    ORDER BY attempt.timestamp DESC
    LIMIT 10
  `);
}

export async function getAlerts(): Promise<Alert[]> {
  return runQuery<Alert>(`
    MATCH (attempt:VotingAttempt)-[:TRIGGERED]->(alert:Alert)
    MATCH (v:Voter)-[:OWNS]->(card:VoterCard)
          -[:USED_IN]->(attempt)
    MATCH (attempt)-[:OCCURRED_AT]->(pollingUnit:PollingUnit)

    WHERE alert.status IN ["OPEN", "INVESTIGATING"]

    RETURN
      alert.id AS id,
      alert.type AS type,
      alert.severity AS severity,
      alert.message AS message,
      alert.status AS status,
      toString(alert.createdAt) AS createdAt,
      attempt.id AS attemptId,
      v.name AS voterName,
      card.id AS voterCardId,
      pollingUnit.name AS pollingUnit

    ORDER BY alert.createdAt DESC
  `);
}

export async function updateAlertStatus(
  alertId: string,
  status: "OPEN" | "INVESTIGATING" | "RESOLVED",
): Promise<Alert | null> {
  const result = await runQuery<Alert>(
    `
      MATCH (alert:Alert {id: $alertId})
      SET alert.status = $status

      RETURN
        alert.id AS id,
        alert.type AS type,
        alert.severity AS severity,
        alert.message AS message,
        alert.status AS status,
        toString(alert.createdAt) AS createdAt
    `,
    {
      alertId: alertId.trim(),
      status,
    },
  );

  return result[0] ?? null;
}

export async function getInvestigation(
  attemptId: string,
): Promise<Investigation | null> {
  console.log("[getInvestigation] attemptId:", JSON.stringify(attemptId));

  const result = await runQuery<Investigation>(
    `
      MATCH (attempt:VotingAttempt {id: $attemptId})

      OPTIONAL MATCH (v:Voter)-[:OWNS]->(card:VoterCard)
        -[:USED_IN]->(attempt)

      OPTIONAL MATCH (attempt)-[:OCCURRED_AT]->(pollingUnit:PollingUnit)

      OPTIONAL MATCH (attempt)-[:MADE_FROM]->(device:Device)

      OPTIONAL MATCH (attempt)-[:TRIGGERED]->(alert:Alert)

      RETURN
        {
          id: v.id,
          name: v.name,
          status: v.status
        } AS voter,

        {
          id: card.id,
          status: card.status
        } AS voterCard,

        {
          id: attempt.id,
          status: attempt.status,
          timestamp: toString(attempt.timestamp)
        } AS attempt,

        {
          id: pollingUnit.id,
          name: pollingUnit.name
        } AS pollingUnit,

        CASE
          WHEN device IS NULL THEN null
          ELSE {
            id: device.id,
            name: device.name
          }
        END AS device,

        CASE
          WHEN alert IS NULL THEN null
          ELSE {
            id: alert.id,
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            status: alert.status
          }
        END AS alert
    `,
    {
      attemptId: attemptId.trim(),
    },
  );

  console.log("[getInvestigation] result:", JSON.stringify(result, null, 2));

  return result[0] ?? null;
}

export async function createVotingAttempt(
  input: CreateVotingAttemptInput,
): Promise<CreateVotingAttemptResult> {
  const { voterCardId, pollingUnitId, deviceId } = input;

  /*
   * ---------------------------------------------------------
   * 1. Verify voter card
   * ---------------------------------------------------------
   */

  const cardResult = await runQuery<{
    cardId: string;
    cardStatus: string;
    voterId: string;
    voterName: string;
  }>(
    `
    MATCH (v:Voter)-[:OWNS]->(c:VoterCard {id: $voterCardId})

    RETURN
      c.id AS cardId,
      c.status AS cardStatus,
      v.id AS voterId,
      v.name AS voterName
    `,
    {
      voterCardId,
    },
  );

  if (cardResult.length === 0) {
    throw new Error(`Voter card ${voterCardId} not found.`);
  }

  const card = cardResult[0];

  if (card.cardStatus !== "ACTIVE") {
    throw new Error(`Voter card ${voterCardId} is not active.`);
  }

  /*
   * ---------------------------------------------------------
   * 2. Verify polling unit
   * ---------------------------------------------------------
   */

  const pollingUnitResult = await runQuery<{
    id: string;
    name: string;
  }>(
    `
    MATCH (p:PollingUnit {id: $pollingUnitId})

    RETURN
      p.id AS id,
      p.name AS name
    `,
    {
      pollingUnitId,
    },
  );

  if (pollingUnitResult.length === 0) {
    throw new Error(`Polling unit ${pollingUnitId} not found.`);
  }

  /*
   * ---------------------------------------------------------
   * 3. Verify device
   * ---------------------------------------------------------
   */

  const deviceResult = await runQuery<{
    id: string;
    name: string;
  }>(
    `
    MATCH (d:Device {id: $deviceId})

    RETURN
      d.id AS id,
      d.name AS name
    `,
    {
      deviceId,
    },
  );

  if (deviceResult.length === 0) {
    throw new Error(`Device ${deviceId} not found.`);
  }

  /*
   * ---------------------------------------------------------
   * 4. Detect duplicate card usage
   *
   * If this voter card has already been used in a completed
   * or flagged attempt, the new attempt becomes suspicious.
   * ---------------------------------------------------------
   */

  const previousAttempts = await runQuery<{
    id: string;
    status: string;
  }>(
    `
    MATCH (c:VoterCard {id: $voterCardId})-[:USED_IN]->(a:VotingAttempt)

    RETURN
      a.id AS id,
      a.status AS status

    ORDER BY a.timestamp DESC
    `,
    {
      voterCardId,
    },
  );

  const hasPreviousCompletedAttempt = previousAttempts.some(
    (attempt) => attempt.status === "COMPLETED",
  );

  /*
   * ---------------------------------------------------------
   * 5. Detect unusual device activity
   *
   * Find the number of different voter cards previously
   * associated with this device.
   * ---------------------------------------------------------
   */

  const deviceUsageResult = await runQuery<{
    voterIds: string[];
  }>(
    `
  MATCH (d:Device {id: $deviceId})
        <-[:MADE_FROM]-(a:VotingAttempt)
        <-[:USED_IN]-(c:VoterCard)
        <-[:OWNS]-(v:Voter)

  RETURN collect(DISTINCT v.id) AS voterIds
  `,
    {
      deviceId,
    },
  );

  const existingVoterIds = deviceUsageResult[0]?.voterIds ?? [];

  const hasUnusualDeviceActivity =
    existingVoterIds.length > 0 && !existingVoterIds.includes(card.voterId);
  /*
   * The duplicate rule has priority.
   */

  let flagged = false;

  let alertType: "DUPLICATE_CARD_USAGE" | "UNUSUAL_DEVICE_ACTIVITY" | null =
    null;

  let severity: "HIGH" | "MEDIUM" | null = null;

  let message: string | null = null;

  if (hasPreviousCompletedAttempt) {
    flagged = true;
    alertType = "DUPLICATE_CARD_USAGE";
    severity = "HIGH";

    message =
      "Voter card has already been associated with a completed voting attempt.";
  } else if (hasUnusualDeviceActivity) {
    flagged = true;
    alertType = "UNUSUAL_DEVICE_ACTIVITY";
    severity = "MEDIUM";

    message = "Device has been associated with multiple voter identities.";
  }

  /*
   * ---------------------------------------------------------
   * 6. Generate a new attempt ID
   * ---------------------------------------------------------
   */

  const attemptIdResult = await runQuery<{
    nextId: string;
  }>(
    `
    MATCH (a:VotingAttempt)
    WITH
      max(
        CASE
          WHEN a.id STARTS WITH "VA-"
          THEN toInteger(substring(a.id, 3))
          ELSE 0
        END
      ) AS maxId

    RETURN
      "VA-" + toString(coalesce(maxId, 0) + 1) AS nextId
    `,
  );

  const attemptId = attemptIdResult[0]?.nextId ?? "VA-001";

  /*
   * ---------------------------------------------------------
   * 7. Create the voting attempt
   * ---------------------------------------------------------
   */

  const attemptResult = await runQuery<{
    id: string;
    status: string;
    timestamp: string;
  }>(
    `
    MATCH (c:VoterCard {id: $voterCardId})
    MATCH (p:PollingUnit {id: $pollingUnitId})
    MATCH (d:Device {id: $deviceId})

    CREATE (a:VotingAttempt {
      id: $attemptId,
      status: $status,
      timestamp: datetime()
    })

    MERGE (c)-[:USED_IN]->(a)
    MERGE (a)-[:OCCURRED_AT]->(p)
    MERGE (a)-[:MADE_FROM]->(d)

    RETURN
      a.id AS id,
      a.status AS status,
      toString(a.timestamp) AS timestamp
    `,
    {
      voterCardId,
      pollingUnitId,
      deviceId,
      attemptId,
      status: flagged ? "FLAGGED" : "COMPLETED",
    },
  );

  if (attemptResult.length === 0) {
    throw new Error("Failed to create voting attempt.");
  }

  const attempt = attemptResult[0];

  /*
   * ---------------------------------------------------------
   * 8. Create alert if necessary
   * ---------------------------------------------------------
   */

  let alert: CreateVotingAttemptResult["alert"] = null;

  if (flagged && alertType && severity && message) {
    const alertIdResult = await runQuery<{
      nextId: string;
    }>(
      `
      MATCH (a:Alert)
      WITH
        max(
          CASE
            WHEN a.id STARTS WITH "ALERT-"
            THEN toInteger(substring(a.id, 6))
            ELSE 0
          END
        ) AS maxId

      RETURN
        "ALERT-" + toString(coalesce(maxId, 0) + 1) AS nextId
      `,
    );

    const alertId = alertIdResult[0]?.nextId ?? "ALERT-001";

    const alertResult = await runQuery<{
      id: string;
      type: string;
      severity: string;
      message: string;
      status: string;
    }>(
      `
      MATCH (a:VotingAttempt {id: $attemptId})

      CREATE (alert:Alert {
        id: $alertId,
        type: $type,
        severity: $severity,
        status: "OPEN",
        message: $message,
        createdAt: datetime()
      })

      MERGE (a)-[:TRIGGERED]->(alert)

      RETURN
        alert.id AS id,
        alert.type AS type,
        alert.severity AS severity,
        alert.message AS message,
        alert.status AS status
      `,
      {
        attemptId,
        alertId,
        type: alertType,
        severity,
        message,
      },
    );

    alert = alertResult[0] ?? null;
  }

  return {
    attempt,
    flagged,
    alert,
  };
}

export async function getVoterCards(): Promise<VoterCardListItem[]> {
  return runQuery<VoterCardListItem>(`
    MATCH (v:Voter)-[:OWNS]->(card:VoterCard)

    OPTIONAL MATCH (v)-[:ASSIGNED_TO]->(pollingUnit:PollingUnit)

    OPTIONAL MATCH (card)-[:USED_IN]->(attempt:VotingAttempt)

    RETURN
      v.id AS voterId,
      v.name AS voterName,
      v.status AS voterStatus,

      card.id AS voterCardId,
      card.status AS voterCardStatus,

      pollingUnit.id AS pollingUnitId,
      pollingUnit.name AS pollingUnitName,
      pollingUnit.ward AS pollingUnitWard,

      count(attempt) AS votingAttempts

    ORDER BY v.name ASC
  `);
}

export async function getVotingReferenceData(): Promise<VotingReferenceData> {
  const [pollingUnits, devices] = await Promise.all([
    runQuery<{
      id: string;
      name: string;
      ward: string;
    }>(`
      MATCH (p:PollingUnit)

      RETURN
        p.id AS id,
        p.name AS name,
        p.ward AS ward

      ORDER BY p.id ASC
    `),

    runQuery<{
      id: string;
      name: string;
    }>(`
      MATCH (d:Device)

      RETURN
        d.id AS id,
        d.name AS name

      ORDER BY d.id ASC
    `),
  ]);

  return {
    pollingUnits,
    devices,
  };
}

export async function getDevices() {
  return runQuery<{
    id: string;
    name: string;
  }>(`
    MATCH (d:Device)
    RETURN
      d.id AS id,
      d.name AS name
    ORDER BY d.id
  `);
}