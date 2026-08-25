export const queries = {
getPersonProfile: `
  MATCH (p:Person {id: $personId})

  OPTIONAL MATCH (p)-[:HAS_SKILL]->(skill:Skill)

  OPTIONAL MATCH (p)-[:WORKS_AT]->(company:Company)

  RETURN
    p.id AS id,
    p.name AS name,
    p.title AS title,
    p.location AS location,

    collect(
      DISTINCT CASE
        WHEN skill IS NOT NULL THEN {
          id: skill.id,
          name: skill.name,
          category: skill.category
        }
      END
    ) AS skills,

    collect(
      DISTINCT CASE
        WHEN company IS NOT NULL THEN {
          id: company.id,
          name: company.name,
          industry: company.industry
        }
      END
    ) AS companies
`,

  updatePersonProfile: `
  MATCH (p:Person {id: $personId})

  SET
    p.name = $name,
    p.title = $title,
    p.location = $location

  RETURN
    p.id AS id,
    p.name AS name,
    p.title AS title,
    p.location AS location
`,

getRecommendedJobs: `
  MATCH (p:Person {id: $personId})
        -[:HAS_SKILL]->
        (userSkill:Skill)

  MATCH (job:Job)
        -[:REQUIRES]->
        (requiredSkill:Skill)

  MATCH (job)-[:POSTED_BY]->(company:Company)

  WITH
    job,
    company,
    collect(DISTINCT requiredSkill.id) AS requiredSkillIds,
    collect(DISTINCT userSkill.id) AS userSkillIds

  WITH
    job,
    company,
    requiredSkillIds,
    size([
      skillId IN requiredSkillIds
      WHERE skillId IN userSkillIds
    ]) AS matchingSkills

  RETURN
    job.id AS id,
    job.title AS title,
    job.description AS description,
    job.employmentType AS employmentType,
    job.remote AS remote,
    job.salary AS salary,
    job.createdAt AS createdAt,

    company {
      .id,
      .name,
      .industry
    } AS company,

    matchingSkills,
    size(requiredSkillIds) AS totalRequiredSkills

  ORDER BY matchingSkills DESC
  LIMIT $limit
`,

  getOpportunities: `
    MATCH (j:Job)
    OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)

    WHERE
      $search = ""
      OR toLower(j.title) CONTAINS toLower($search)
      OR toLower(j.description) CONTAINS toLower($search)
      OR toLower(c.name) CONTAINS toLower($search)
      OR toLower(c.industry) CONTAINS toLower($search)

    RETURN
      j.id AS id,
      j.title AS title,
      j.description AS description,
      j.employmentType AS employmentType,
      j.remote AS remote,
      j.salary AS salary,
      toString(j.createdAt) AS createdAt,

      CASE
        WHEN c IS NULL THEN null
        ELSE {
          id: c.id,
          name: c.name,
          industry: c.industry
        }
      END AS company,

      0 AS matchingSkills,
      0 AS totalRequiredSkills

    ORDER BY j.createdAt DESC
  `,


getJobById: `
  MATCH (j:Job {id: $jobId})

  OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)

  OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)

  OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)

  RETURN
    j.id AS id,
    j.title AS title,
    j.description AS description,
    j.employmentType AS employmentType,
    j.remote AS remote,
    j.salary AS salary,
    toString(j.createdAt) AS createdAt,

    CASE
      WHEN c IS NULL THEN null
      ELSE {
        id: c.id,
        name: c.name,
        industry: c.industry
      }
    END AS company,

    CASE
      WHEN l IS NULL THEN null
      ELSE {
        city: l.city,
        country: l.country
      }
    END AS location,

    [
      skill IN collect(s)
      WHERE skill IS NOT NULL
      | {
          id: skill.id,
          name: skill.name,
          category: skill.category
        }
    ] AS requiredSkills
`,


addPersonSkill: `
  MATCH (p:Person {id: $personId})
  MATCH (s:Skill {id: $skillId})

  MERGE (p)-[r:HAS_SKILL]->(s)

  SET
    r.level = $level,
    r.yearsOfExperience = $yearsOfExperience

  RETURN
    p.id AS personId,
    s.id AS skillId,
    s.name AS skillName,
    s.category AS category,
    r.level AS level,
    r.yearsOfExperience AS yearsOfExperience
`,

updatePersonSkill: `
  MATCH (p:Person {id: $personId})
  MATCH (s:Skill {id: $skillId})
  MATCH (p)-[r:HAS_SKILL]->(s)

  SET
    r.level = $level,
    r.yearsOfExperience = $yearsOfExperience

  RETURN
    p.id AS personId,
    s.id AS skillId,
    s.name AS skillName,
    s.category AS category,
    r.level AS level,
    r.yearsOfExperience AS yearsOfExperience
`,

getSkillProfile: `
  MATCH (p:Person {id: $personId})

  OPTIONAL MATCH (p)-[r:HAS_SKILL]->(skill:Skill)

  WITH
    collect(
      DISTINCT CASE
        WHEN skill IS NOT NULL THEN {
          id: skill.id,
          name: skill.name,
          category: skill.category,
          level: r.level,
          yearsOfExperience: coalesce(r.yearsOfExperience, 0)
        }
      END
    ) AS rawSkills

  WITH
    [skill IN rawSkills WHERE skill IS NOT NULL] AS userSkills

  RETURN
    size(userSkills) AS totalSkills,

    size([
      skill IN userSkills
      WHERE skill.level IN ["Advanced", "Expert"]
    ]) AS strongSkills,

    size([
      skill IN userSkills
      WHERE skill.level IS NULL
        OR skill.level = "Beginner"
        OR skill.level = "Intermediate"
    ]) AS skillsToImprove,

    userSkills
`,

deletePersonSkill: `
  MATCH (p:Person {id: $personId})
  MATCH (s:Skill {id: $skillId})
  MATCH (p)-[r:HAS_SKILL]->(s)

  DELETE r

  RETURN
    p.id AS personId,
    s.id AS skillId,
    s.name AS skillName
`,

createConnection: `
  MATCH (person:Person {id: $personId})
  MATCH (connection:Person {id: $connectionId})

  MERGE (person)-[:KNOWS]->(connection)

  RETURN
    person.id AS personId,
    connection.id AS connectionId
`,

  findConnectionPath: `
    MATCH path =
      (p:Person {id: $personId})
      -[:KNOWS*1..3]->
      (connection:Person)
      -[:WORKS_AT]->
      (company:Company)
      <-[:POSTED_BY]-
      (job:Job {id: $jobId})

    RETURN path
    LIMIT 1
  `,

  deleteConnection: `
  MATCH (person:Person {id: $personId})
  MATCH (connection:Person {id: $connectionId})
  MATCH (person)-[r:KNOWS]->(connection)

  DELETE r

  RETURN
    person.id AS personId,
    connection.id AS connectionId,
    connection.name AS connectionName
`,

  getCareerInsights: `
  MATCH (p:Person {id: $personId})

  OPTIONAL MATCH (p)-[r:HAS_SKILL]->(skill:Skill)

  WITH
    p,
    collect(
      DISTINCT {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        level: r.level,
        yearsOfExperience: coalesce(
          r.yearsOfExperience,
          0
        )
      }
    ) AS userSkills

  OPTIONAL MATCH (job:Job)
    -[:REQUIRES]->
    (requiredSkill:Skill)

  OPTIONAL MATCH (job)-[:POSTED_BY]->(company:Company)

  WITH
    p,
    userSkills,
    job,
    company,
    collect(
      DISTINCT requiredSkill
    ) AS requiredSkills

  WITH
    p,
    userSkills,
    job,
    company,
    requiredSkills,

    size([
      skill IN requiredSkills
      WHERE skill.id IN [
        userSkill IN userSkills |
        userSkill.id
      ]
    ]) AS matchingSkills

  RETURN
    userSkills,

    collect(
      DISTINCT CASE
        WHEN job IS NOT NULL THEN {
          id: job.id,
          title: job.title,
          company: CASE
            WHEN company IS NULL THEN null
            ELSE {
              id: company.id,
              name: company.name,
              industry: company.industry
            }
          END,
          requiredSkills: [
            skill IN requiredSkills |
            {
              id: skill.id,
              name: skill.name,
              category: skill.category
            }
          ],
          matchingSkills: matchingSkills,
          totalRequiredSkills: size(requiredSkills)
        }
      END
    ) AS careerRoles
`,

createJobApplication: `
  MATCH (person:Person {id: $personId})
  MATCH (job:Job {id: $jobId})

  MERGE (person)-[application:APPLIED_TO]->(job)

  ON CREATE SET
    application.status = "Applied",
    application.appliedAt = datetime()

  RETURN
    person.id AS personId,
    job.id AS jobId,
    job.title AS jobTitle,
    application.status AS status,
    toString(application.appliedAt) AS appliedAt
`,


getJobApplications: `
  MATCH (person:Person {id: $personId})
    -[application:APPLIED_TO]->
    (job:Job)

  OPTIONAL MATCH (job)-[:POSTED_BY]->(company:Company)

  OPTIONAL MATCH (job)-[:LOCATED_IN]->(location:Location)

  RETURN
    job.id AS jobId,
    job.title AS jobTitle,
    job.description AS description,

    application.status AS status,

    CASE
      WHEN application.appliedAt IS NULL
      THEN null
      ELSE toString(application.appliedAt)
    END AS appliedAt,

    CASE
      WHEN company IS NULL THEN null
      ELSE {
        id: company.id,
        name: company.name,
        industry: company.industry
      }
    END AS company,

    CASE
      WHEN location IS NULL THEN null
      ELSE {
        city: location.city,
        country: location.country
      }
    END AS location

  ORDER BY application.appliedAt DESC
`,

updateJobApplicationStatus: `
  MATCH (person:Person {id: $personId})
    -[application:APPLIED_TO]->
    (job:Job {id: $jobId})

  SET application.status = $status

  RETURN
    person.id AS personId,
    job.id AS jobId,
    job.title AS jobTitle,
    application.status AS status,
    toString(application.appliedAt) AS appliedAt
`,
deleteJobApplication: `
  MATCH (person:Person {id: $personId})
    -[application:APPLIED_TO]->
    (job:Job {id: $jobId})

  DELETE application

  RETURN
    person.id AS personId,
    job.id AS jobId,
    job.title AS jobTitle
`,

};


