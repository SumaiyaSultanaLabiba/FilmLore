import { sql } from "../config/db.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
//import UAParser from "ua-parser-js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();



const generateToken=(user)=>
{
  const payload=
  {
    
    userName:user.username,
    email:user.email,
    role:user.role
  }
  return jwt.sign(payload,process.env.TOKEN_SECRET,{expiresIn:"60m"});
};



//editFullname
    export const editFullname=async(req,res)=>
    {
        try
        {
            await sql`BEGIN`;

            const {UserName,FullName}=req.body;
            console.log("Edit request body:", req.body);

            if(!UserName || ! FullName)
            {
                await sql`ROLLBACK`;
                return res.status(400).json({message:"Missing data"});
            }

            const row = await sql`
            UPDATE SystemUser 
            SET fullname = ${FullName} 
            WHERE username = ${UserName}
            RETURNING username, fullname, email, role, dateofbirth, profilepicture;
            `;

            console.log("Updated row:", row[0]);

            if (row.length === 0) {
            await sql`ROLLBACK`;
            return res.status(404).json({ message: "User not found" });
            }

            await sql`COMMIT`;
            const updatedUser = row[0];
            const newToken = generateToken(updatedUser);
            return res.status(200).json({
            success: true,
            message: "Full name updated successfully",
            user: updatedUser,
            token: newToken 
            });
        }
        
        catch(error)
        {
            await sql`ROLLBACK`;
            console.log("edit error");
            return res.status(500).json({message:"server error"});
        }
    };



//editEmail
    export const editEmail=async(req,res)=>
    {
        try
        {
            await sql`BEGIN`;

            const {UserName,Email}=req.body;
            console.log("Edit request body:", req.body);

            if(!UserName || ! Email)
            {
                await sql`ROLLBACK`;
                return res.status(400).json({message:"Missing data"});
            }

            const row = await sql`
            UPDATE SystemUser 
            SET email = ${Email} 
            WHERE username = ${UserName}
            RETURNING username, email;
            `;

            console.log("Updated row:", row[0]);
            
            if (row.length === 0) {
            await sql`ROLLBACK`;
            return res.status(404).json({ message: "User not found" });
            }

            await sql`COMMIT`;

            const updatedUser = row[0];
            const newToken = generateToken(updatedUser);

            return res.status(200).json({
            success: true,
            message: "Email updated successfully",
            user: updatedUser,
            token: newToken 
            });
        }
        
        catch(error)
        {
            await sql`ROLLBACK`;
            console.log("edit error");
            return res.status(500).json({message:"server error"});
        }
    };


//editDOB
    export const editDOB=async(req,res)=>
    {
        try
        {
            await sql`BEGIN`;

            const {UserName,DateOfBirth}=req.body;
            console.log("Edit request body:", req.body);

            if(!UserName || ! DateOfBirth)
            {
                await sql`ROLLBACK`;
                return res.status(400).json({message:"Missing data"});
            }

            const row = await sql`
            UPDATE SystemUser 
            SET dateofbirth = ${DateOfBirth} 
            WHERE username = ${UserName}
            RETURNING username, dateofbirth;
            `;

            console.log("Updated row:", row[0]);
            
            if (row.length === 0) {
            await sql`ROLLBACK`;    
            return res.status(404).json({ message: "User not found" });
            }

            await sql`COMMIT`;

            const updatedUser = row[0];
            const newToken = generateToken(updatedUser);

            return res.status(200).json({
            success: true,
            message: "Date of birth updated successfully",
            user: updatedUser,
            token: newToken 
            });
        }
        
        catch(error)
        {
            await sql`ROLLBACK`;
            console.log("edit error");
            return res.status(500).json({message:"server error"});
        }
    };


//editProfilePicture
    export const editProfilePicture=async(req,res)=>
    {
        try
        {
            await sql`BEGIN`;

            const {UserName,ProfilePicture}=req.body;
            console.log("Edit request body:", req.body);

            if(!UserName || ! ProfilePicture)
            {
                await sql`ROLLBACK`;
                return res.status(400).json({message:"Missing data"});
            }

            const row = await sql`
            UPDATE SystemUser 
            SET profilepicture = ${ProfilePicture} 
            WHERE username = ${UserName}
            RETURNING username, profilepicture;
            `;

            console.log("Updated row:", row[0]);
            
            if (row.length === 0) {
            await sql`ROLLBACK`;    
            return res.status(404).json({ message: "User not found" });
            }

            await sql`COMMIT`;

            const updatedUser = row[0];
            const newToken = generateToken(updatedUser);

            return res.status(200).json({
            success: true,
            message: "ProfilePicture updated successfully",
            user: updatedUser,
            token: newToken 
            });
        }
        
        catch(error)
        {
            await sql`ROLLBACK`;
            console.log("edit error");
            return res.status(500).json({message:"server error"});
        }
    };







//signUp

export const signUp=async(req,res)=>
{
    try{
        await sql`BEGIN`;

        const{UserName,Password,FullName,Role,DOB,Email,ProfilePicture}=req.body;
        if(!FullName|| !UserName || !Email || !Password )
        {
            await sql`ROLLBACK`;
            return res.status(400).json({message:"Missing required fields"});
        }
    

    const existing=await sql`
       SELECT username
       FROM systemuser
       WHERE username=${UserName}
    `;
    if(existing.length)
    {
        await sql`ROLLBACK`;
        return res.status(409).json({message:"user already exists!"});
    }

    const created=await sql`
     INSERT INTO SystemUser (username,password,fullname,role,dateofbirth,email,profilepicture)
     VALUES (${UserName},${Password},${FullName},'user',${DOB},${Email},${ProfilePicture})
     RETURNING username,email,role
    `;
    const user=created[0];
    const token=generateToken(user);

    await sql`COMMIT`;

    return res.status(200).json({message:"User created",
                                token,
                                user:
                                {
                                   userName:user.username,
                                   email:user.email,
                                   role:user.role
                                }
    });
}

     catch(error)
     {
        await sql`ROLLBACK`;
        console.log("sign up error!");
        return res.status(500).json({message:"server error"});
     }
};

//LogIN
    export const login=async(req,res)=>
    {
        try
        {
            const {UserName,Password}=req.body;
            if(!UserName || ! Password)
            {
                return res.status(400).json({message:"Missing credentials"});
            }

            const row=await sql`
            SELECT username,email,role
            FROM systemuser
            WHERE username=${UserName} AND password=${Password}
            `;
            
            if(!row.length)
            {
                return res.status(401).json({ message:"Invalid Credentials "});
            }

            const user=row[0];
     

            const token=generateToken(user);

            return res.status(200).json({
                message:"Login successful",token,
                user:
                {
                    UserName:user.username,
                    Email:user.email,
                    Role:user.role
                }
            });


        }
        
        catch(error)
        {
            console.log("login error");
            return res.status(500).json({message:"server error"});
        }
    };


export const getStatistics = async (req, res) => {
  try {
    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM Movie) AS movie,
        (SELECT COUNT(*) FROM Series) AS series,
        (SELECT COUNT(*) FROM Actor) AS actor,
        (SELECT COUNT(*) FROM Director) AS director,
        (SELECT COUNT(*) FROM Genre) AS genre,
        (SELECT COUNT(*) FROM SystemUser) AS users,
        (SELECT COUNT(*) FROM Studio) AS studio,
        (SELECT COUNT(*) FROM Blog) AS blog
    `;

    res.status(200).json(stats[0]);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMyBlogs = async (req, res) => {
  try {
    const {UserName}=req.body;
    const myBlogs = await sql`
      SELECT * 
      FROM Blog b
      WHERE b.UserName= ${UserName};
    `;
    console.log("Blogs: ", myBlogs[0]);
    res.status(200).json({ myBlogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMyComments = async (req, res) => {
  try {
    const {UserName}=req.body;
    const comments = await sql`
      SELECT * 
      FROM Blog b JOIN BlogComment c
      ON b.BlogID=c.BlogID
      WHERE c.UserName= ${UserName};
    `;
    console.log("Comments: ", comments[0]);
    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const getSuggestions = async (req, res) => {
  try {
    const { UserName } = req.body;

    const suggestions = await sql`
    WITH UserGenres AS(
    SELECT DISTINCT mg.GenreID
    FROM MovieReview mr
    JOIN Movie m ON mr.MovieID = m.MovieID
    JOIN MediaGenre mg ON m.MediaID = mg.MediaID
    WHERE mr.UserName = ${UserName}
    UNION
    SELECT DISTINCT mg.GenreID
    FROM EpisodeReview er
    JOIN Episode e ON er.EpisodeID = e.EpisodeID
    JOIN Season se ON e.SeasonID = se.SeasonID
    JOIN Series s ON se.SeriesID = s.SeriesID
    JOIN MediaGenre mg ON s.MediaID = mg.MediaID
    WHERE er.UserName = ${UserName}
    )
    SELECT * FROM Media m
    WHERE m.MediaID IN
    (SELECT DISTINCT(me.MediaID) AS mid
    FROM Media me
    JOIN MediaGenre mg ON me.MediaID=mg.MediaID
    WHERE mg.GenreID IN (SELECT GenreID FROM UserGenres)
    GROUP BY me.MediaID)
    ORDER BY m.Rating DESC
    LIMIT 10;
    `;

    console.log("Length: ", suggestions.length);
    console.log("Suggestions: ", suggestions[0]);
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


