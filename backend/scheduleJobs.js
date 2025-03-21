const cron = require("node-cron");
const createFetcher=require("./data_collection.js");
const {Platform}=require("./db/schema.js");


const setupContestUpdater=()=>{
    cron.schedule("0 * * * *" ,async () =>{
        try{
            const platforms=await Platform.find({enabled:true});
            for(const platform of platforms){
                // if(platform.name==="Codeforces")continue
                try{
                const fetcher=await createFetcher(platform.name);
                await fetcher.fetchContests();
                }catch(error){
                    console.error(`Error updating contests for platform ${platform.name}:`,error);
                }
            }
        }catch(error){
            console.error("Error updating contests:",error);
        }
    });

    (async()=>{
        try{
        const platforms=await Platform.find({enabled:true});
        for(const platform of platforms){
            try{
            const fetcher=await createFetcher(platform.name);
            await fetcher.fetchContests();
            }catch(error){
                console.error(`Error updating contests for platform ${platform.name}:`,error);
            }
        }
    }catch(error){
        console.error("Error updating contests:",error);
    }
    })();

}

module.exports={
    setupContestUpdater
}


