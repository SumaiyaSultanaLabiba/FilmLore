import { sql } from "../config/db.js";
import { notifyAllUsersOnNewMedia, congratulateSubmitter, rejectSubmission } from "../emailService.js";


export const submit = async (req, res) => {
  try {
    await sql`BEGIN`;

    console.log("Incoming submission:", req.body);

    const {
      UserName,
      Title,
      Overview,
      Poster,
      Language,
      Rating,
      Trailer,
      ReleaseYear,
      Country,
      Type,
      Duration,
      isOngoing
    } = req.body;

    // Validate required fields
    if (!UserName || !Title || !Overview || !ReleaseYear) {
      await sql`ROLLBACK`;
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ongoing_check = isOngoing && isOngoing.toLowerCase() === 'yes'? true : null;
    const durationValue = Duration !== '' ? parseInt(Duration) : null;

    // Insert into database
    const result = await sql`
      INSERT INTO Submission (
        UserName,
        Title,
        Overview,
        Poster,
        Language,
        Rating,
        Trailer,
        ReleaseYear,
        Country,
        Type,
        Duration,
        isOngoing
      )
      VALUES (
        ${UserName},
        ${Title},
        ${Overview},
        ${Poster},
        ${Language},
        ${Rating},
        ${Trailer},
        ${ReleaseYear},
        ${Country},
        ${Type},
        ${durationValue},
        ${ongoing_check}
      )
      RETURNING *;
    `;

    await sql`COMMIT`;

    res.status(201).json({
      message: "Submission created successfully",
      submission: result[0],
    });
  } catch (error) {
    await sql`ROLLBACK`;
    console.error("Error creating submission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




export const approve = async (req, res) => {
  try {
    await sql`BEGIN`;

    const { submissionId, adminUserName, decision } = req.body;

    if (!submissionId || !adminUserName || !decision) {
      await sql`ROLLBACK`;
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch submission details
    const submission = await sql`
      SELECT * FROM Submission WHERE SubmissionID = ${submissionId};
    `;

    if (submission.length === 0) {
      await sql`ROLLBACK`;
      return res.status(404).json({ error: "Submission not found" });
    }

    const sub = submission[0];
    let approval;

      if (decision === "Approved") {
        // Insert into Media table
        const media = await sql`
          INSERT INTO Media (Title, OverView, Poster, Language, Rating, Trailer, ReleaseYear, Country, Type)
          VALUES (${sub.title}, ${sub.overview}, ${sub.poster}, ${sub.language}, ${sub.rating}, ${sub.trailer}, ${sub.releaseyear}, ${sub.country}, ${sub.type})
          RETURNING *;
        `;

        const med = media[0];

        // If type is Movie or Series, insert into respective table
        if (sub.type.toLowerCase() === "movie") {
          await sql`
            INSERT INTO Movie (MediaID, Duration)
            VALUES (${med.mediaid}, ${sub.duration});
          `;
        } else if (sub.type.toLowerCase() === "series") {
          await sql`
            INSERT INTO Series (MediaID, isOngoing)
            VALUES (${med.mediaid}, ${sub.isongoing});
          `;
        }
      }

      // Update submission status
      await sql`
        UPDATE Submission SET Status = ${decision} WHERE SubmissionID = ${submissionId};
      `;

      // Record approval decision
      const result = await sql`
        INSERT INTO Approval (SubmissionID, AdminUserName, Decision)
        VALUES (${submissionId}, ${adminUserName}, ${decision})
        RETURNING *;
      `;

      const users = await sql`
      SELECT Email FROM SystemUser;
    `;

    const submitterEmail=await sql`
    SELECT Email
    FROM Submission JOIN SystemUser
    ON Submission.UserName=SystemUser.UserName
    WHERE SubmissionID = ${submissionId};
    `;

      // send emails
      if(decision==="Approved")
      {
        await notifyAllUsersOnNewMedia(users, sub.title);
        await congratulateSubmitter(submitterEmail[0].email, sub.title);
      }

      if(decision==="Rejected")
      {
        await rejectSubmission(submitterEmail[0].email, sub.title);
      }

      approval = result[0];
    

      await sql`COMMIT`;

    res.status(200).json({
      message: `Submission ${decision.toLowerCase()} successfully`,
      approval,
    });

  } catch (error) {
    await sql`ROLLBACK`;
    console.error("Error approving submission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await sql`
      SELECT * FROM Submission WHERE Status = 'Pending' ORDER BY SubmissionDate DESC;
    `;
    res.status(200).json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const approvedMedia = async (req, res) => {
  try {
    const {UserName}=req.body;
    const media = await sql`
      SELECT * 
      FROM Submission s JOIN Approval a
      ON s.SubmissionID=a.SubmissionID
      WHERE a.AdminUserName= ${UserName} AND a.Decision='Approved';
    `;
    res.status(200).json({ media });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const rejectedMedia = async (req, res) => {
  try {
    const {UserName}=req.body;
    const media = await sql`
      SELECT * 
      FROM Submission s JOIN Approval a
      ON s.SubmissionID=a.SubmissionID
      WHERE a.AdminUserName= ${UserName} AND a.Decision='Rejected';
    `;
    res.status(200).json({ media });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const addSeries = async (req, res) => {
  try {
    await sql`BEGIN`;

    console.log("Incoming series:", req.body);

    const {
      Title,
      Overview,
      Poster,
      Language,
      Rating,
      Trailer,
      ReleaseYear,
      Country,
      Type,
      IsOnGoing
    } = req.body;

    // Validate required fields
    if (!Title || !Overview || !ReleaseYear) {
      await sql`ROLLBACK`;
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert into database
    const result = await sql`
      INSERT INTO Media (
        Title,
        Overview,
        Poster,
        Language,
        Rating,
        Trailer,
        ReleaseYear,
        Country,
        Type
      )
      VALUES (
        ${Title},
        ${Overview},
        ${Poster},
        ${Language},
        ${Rating},
        ${Trailer},
        ${ReleaseYear},
        ${Country},
        ${Type}
      )
      RETURNING *;
    `;

    await sql`
    INSERT INTO Series (MediaID, isOngoing)
    VALUES (${result[0].mediaid}, ${IsOnGoing});
    `;

    const users = await sql`
    SELECT Email FROM SystemUser;
    `;
    await notifyAllUsersOnNewMedia(users, Title);

    await sql`COMMIT`;

    res.status(201).json({
      message: "Series added successfully",
      addition: result[0],
    });
  } catch (error) {
    await sql`ROLLBACK`;
    console.error("Error adding series:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const addMovie = async (req, res) => {
  try {
    await sql`BEGIN`;

    console.log("Incoming movie:", req.body);

    const {
      Title,
      Overview,
      Poster,
      Language,
      Rating,
      Trailer,
      ReleaseYear,
      Country,
      Type,
      Duration
      
    } = req.body;

    // Validate required fields
    if (!Title || !Overview || !ReleaseYear) {
      await sql`ROLLBACK`;
      return res.status(400).json({ error: "Missing required fields" });
    }

    const durationValue = Duration !== '' ? parseInt(Duration) : null;

    // Insert into database
    const result = await sql`
      INSERT INTO Media (
        Title,
        Overview,
        Poster,
        Language,
        Rating,
        Trailer,
        ReleaseYear,
        Country,
        Type
      )
      VALUES (
        ${Title},
        ${Overview},
        ${Poster},
        ${Language},
        ${Rating},
        ${Trailer},
        ${ReleaseYear},
        ${Country},
        ${Type}
      )
      RETURNING *;
    `;

    await sql`
    INSERT INTO Movie (MediaID, Duration)
    VALUES (${result[0].mediaid}, ${durationValue});
    `;

    const users = await sql`
    SELECT Email FROM SystemUser;
    `;
    await notifyAllUsersOnNewMedia(users, Title);

    await sql`COMMIT`;

    res.status(201).json({
      message: "Movie added successfully",
      addition: result[0],
    });
  } catch (error) {
    await sql`ROLLBACK`;
    console.error("Error adding movie:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


