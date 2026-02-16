import { sql } from "../config/db.js";

export const getAllMovies=async(req,res)=>
{
    try{
        const movieQuery=
        await sql
        `
        SELECT * FROM media
        WHERE type='Movie'

        `;
        
        return res.status(200).json({success:true,data:movieQuery});


          
    }
    catch(error)
    
    {
        return res.status(500).json({success:false,message:error.message})

    }
}

export const getAllSeries=async(req,res)=>
{
    try{ 
         const seriesQuery=
        await sql
        `
        SELECT * FROM media
        WHERE type='Series'

        `;
        
        return res.status(200).json({success:true,data:seriesQuery});
    }

    catch(error)
    {
        return res.status(500).json({success:false,message:error.message})  
    }
}

export const getMovieByID=async(req,res)=>
{
    try
    {
        const movieid=Number(req.params.movieId);
        const movieQuery=
        await sql
        `
        SELECT M.* ,MO.duration
        FROM media M
        JOIN movie MO ON m.mediaid=mo.mediaid
        WHERE M.mediaid=${Number(req.params.movieId)}
        `;

        const movieActorsQuery=
         await sql`
         SELECT A.*
         FROM actor A
         JOIN mediaactor MA ON A.actorid=MA.actorid
         WHERE MA.mediaid=${movieid}
         
         `;

        const movieStudioQuery=
        await sql`
        SELECT S.*
        FROM studio S
        JOIN mediastudio MS ON S.studioid=MS.studioid
        WHERE MS.mediaid = ${movieid}
         
        `;

        const movieGenreQuery=
        await sql`
        SELECT G.*
        FROM genre G
        JOIN mediagenre MG ON G.genreid=MG.genreid
        WHERE MG.mediaid =${movieid}
         
        `;


        const movieDirectorQuery=
        await sql`
        SELECT D.*
        FROM director D
        JOIN mediadirector MD ON D.directorid=MD.directorid
        WHERE MD.mediaid =${movieid}
         
        `;

        const movieAwardQuery=
        await sql`
        SELECT A.*
        FROM award A
        JOIN mediaaward MA ON A.awardid=MA.awardid
        WHERE MA.mediaid=${movieid}
         
        `;

        const movieData=movieQuery[0];
        if(movieData)
        {
            movieData.actors=movieActorsQuery;
            movieData.studios=movieStudioQuery;
            movieData.genres=movieGenreQuery;
            movieData.directors=movieDirectorQuery;
            movieData.awards=movieAwardQuery;
        }
        return res.status(200).json({success:true,data:movieData});


    }
    catch(error)
    {
        return res.status(500).json({success:false,message:error.message})

    }
}


export const getSeriesByID=async(req,res)=>
{
    try
    {
        const seriesid=Number(req.params.seriesId);
        const seriesQuery=
          await sql
          `
           SELECT M.*, S.isongoing
           FROM media M
           JOIN series S ON M.mediaid=S.mediaid
           WHERE S.seriesid=${Number(req.params.seriesId)}  

          `;

        const seriesActorsQuery=
            await sql` 
            SELECT A.*
            FROM actor A
            JOIN mediaactor MA ON A.actorid=MA.actorid
            WHERE MA.mediaid IN (
                SELECT mediaid FROM series WHERE seriesid=${seriesid}
            )
            `;

        const seriesStudioQuery=
        await sql`
        SELECT S.*
        FROM studio S
        JOIN mediastudio MS ON S.studioid=MS.studioid
        WHERE MS.mediaid IN (
        SELECT mediaid FROM series WHERE seriesid=${seriesid}
            )
        `;

        const seriesGenreQuery=
        await sql`
        SELECT G.*
        FROM genre G
        JOIN mediagenre MG ON G.genreid=MG.genreid
        WHERE MG.mediaid IN (
        SELECT mediaid FROM series WHERE seriesid=${seriesid}
            )
        `;

        const seriesDirectorQuery=
        await sql`
        SELECT D.*
        FROM director D
        JOIN mediadirector MD ON D.directorid=MD.directorid
        WHERE MD.mediaid IN (
        SELECT mediaid FROM series WHERE seriesid=${seriesid}
            )
        `;

        const seriesAwardQuery=
        await sql`
        SELECT A.*
        FROM award A
        JOIN mediaaward MA ON A.awardid=MA.awardid
        WHERE MA.mediaid IN (
        SELECT mediaid FROM series WHERE seriesid=${seriesid}
            )
        `;

        
        const seasonQuery=
        await sql`
        SELECT *, COUNT(*) OVER() AS total_seasons
        FROM season
        WHERE seriesid=${seriesid}
        `;

        const episodeQuery=
        await sql`
        SELECT E.*
        FROM episode E
        JOIN season S ON E.seasonid=S.seasonid
        WHERE S.seriesid=${seriesid}
        `;

        const seriesData=seriesQuery[0];
        if(seriesData)
        {
            seriesData.actors=seriesActorsQuery;
            seriesData.studios=seriesStudioQuery;
            seriesData.genres=seriesGenreQuery;
            seriesData.directors=seriesDirectorQuery;
            seriesData.awards=seriesAwardQuery;
            seriesData.seasons=seasonQuery;
            seriesData.episodes=episodeQuery;
        }
        return res.status(200).json({success:true,data:seriesData});



    }
    catch(error)
    {
        return res.status(500).json({success:false,message:error.message})

    }

}

export const topRatedMovies=async(req,res)=>
{
    try{
        const movieQuery=
        await sql
        `
        SELECT * FROM media
        WHERE type='Movie'
        ORDER BY rating DESC
        LIMIT 10

        `;
        
        return res.status(200).json({success:true,data:movieQuery});
       

          
    }
    catch(error)
    
    {
        return res.status(500).json({success:false,message:error.message})

    }
}
