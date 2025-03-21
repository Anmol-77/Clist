const axios = require("axios");
const { Platform, Contest } = require("./db/schema.js");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

class ContestFetcher {
    constructor(platform) {
        this.platform = platform;
    }

    async fetchContests() {
        throw new Error("Not implemented");
    }

    async updateContestsStatus() {
        const now = new Date();
        await Contest.updateMany(
            { platform: this.platform._id, endDate: { $lt: now }, status: { $ne: "finished" } },
            { $set: { status: "finished" } }
        );
        await Contest.updateMany(
            { platform: this.platform._id, startDate: { $gt: now }, status: { $ne: "upcoming" } },
            { $set: { status: "upcoming" } }
        );
        await Contest.updateMany(
            { platform: this.platform._id, startDate: { $lte: now }, endDate: { $gte: now }, status: { $ne: "ongoing" } },
            { $set: { status: "ongoing" } }
        );
    }

    async fetchSolutionFromYoutube(contestId) {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
            });
            
            const page = await browser.newPage();
            
            const searchQuery = `"tle eliminator" "${this.platform.name}" "${contestId}"`.replace(/ /g, "+");
            await page.goto(`https://www.youtube.com/results?search_query=${searchQuery}`);
            
            // Wait for the video results to load
            await page.waitForSelector('ytd-video-renderer', { timeout: 5000 }).catch(() => null);
            
            // Get the first video's data
            const videoData = await page.evaluate(() => {
                const videoElement = document.querySelector('ytd-video-renderer');
                if (!videoElement) return null;
                
                const videoTitle = videoElement.querySelector('#video-title')?.textContent?.trim() || '';
                const videoHref = videoElement.querySelector('#video-title')?.getAttribute('href') || '';
                const videoUrl = videoHref ? 'https://www.youtube.com' + videoHref : '';
                
                return { videoTitle, videoUrl };
            });
            
            await browser.close();
            
            return videoData?.videoUrl || '';
        } catch (error) {
            console.error(`Error fetching YouTube solution for ${contestId}:`, error);
            return '';
        }
    }
}

class CodeforcesFetcher extends ContestFetcher {
    constructor(platform) {
        super(platform);
    }
    
    async fetchContests() {
        try {
            console.log("Fetching Codeforces contests...");
            const response = await axios.get("https://codeforces.com/api/contest.list");
            
            if (!response.data || !response.data.result) {
                console.error("Invalid response from Codeforces API:", response.data);
                return;
            }
            
            const contests = response.data.result;
            console.log(`Found ${contests.length} contests from Codeforces`);
            
            let newCount = 0;
            let updatedCount = 0;
            
            for (const contest of contests) {
                let status;
                switch (contest.phase) {
                    case "BEFORE":
                        status = "upcoming";
                        break;
                    case "CODING":
                        status = "ongoing";
                        break;
                    default:
                        status = "finished";
                }
                
                const startDate = new Date(contest.startTimeSeconds * 1000);
                const endDate = new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000);
                
                // Only fetch solution for finished contests to save resources
                let solution = "";
                if (status === "finished") {
                    try {
                        solution = await this.fetchSolutionFromYoutube(contest.name);
                    } catch (error) {
                        console.error(`Error fetching solution for ${contest.name}:`, error);
                    }
                }
                
                // Check if contest already exists
                const existingContest = await Contest.findOne({
                    platform: this.platform._id,
                    name: contest.name,
                    startDate: startDate
                });
                
                if (!existingContest) {
                    // Create new contest
                    await Contest.create({
                        name: contest.name,
                        startDate: startDate,
                        endDate: endDate,
                        status: status,
                        url: `https://codeforces.com/contest/${contest.id}`,
                        platform: this.platform._id,
                        solution: solution
                    });
                    newCount++;
                } else {
                    // Update existing contest
                    existingContest.endDate = endDate;
                    existingContest.status = status;
                    existingContest.url = `https://codeforces.com/contest/${contest.id}`;
                    if (solution) {
                        existingContest.solution = solution;
                    }
                    await existingContest.save();
                    updatedCount++;
                }
            }
            
            console.log(`Codeforces: Added ${newCount} new contests, updated ${updatedCount} existing contests`);
            
            // Update statuses after all contests are processed
            await this.updateContestsStatus();
        } catch (error) {
            console.error("Error fetching Codeforces contests:", error);
            throw error;
        }
    }
}

class Atcoder extends ContestFetcher {
    constructor(platform) {
        super(platform);
    }

    async fetchContests() {
        try {
            console.log("Fetching AtCoder contests...");
            
            // AtCoder doesn't have a public API, so we need to scrape the website
            const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
            });
            
            const page = await browser.newPage();
            await page.goto("https://atcoder.jp/contests");
            
            // Wait for the contests table to load
            await page.waitForSelector('.table-responsive', { timeout: 10000 });
            
            // Extract contest data from the page
            const contestsData = await page.evaluate(() => {
                const contests = [];
                const upcomingContestRows = document.querySelectorAll('#contest-table-upcoming tbody tr');
                const ongoingContestRows = document.querySelectorAll('#contest-table-action tbody tr');
                const finishedContestRows = Array.from(document.querySelectorAll('#contest-table-history tbody tr')).slice(0, 20); // Limit to 20 past contests
                
                function extractContestData(row, status) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 3) {
                        const startTimeStr = cells[0].innerText.trim();
                        const durationStr = cells[2].innerText.trim();
                        const titleElement = cells[1].querySelector('a');
                        
                        if (titleElement) {
                            const title = titleElement.innerText.trim();
                            const href = titleElement.getAttribute('href');
                            const contestId = href.split('/').pop();
                            
                            // Parse start time and duration
                            const startDate = new Date(startTimeStr);
                            
                            // Parse duration (format: "01:30" or "2:00:00")
                            let durationMinutes = 0;
                            const durationParts = durationStr.split(':').map(part => parseInt(part));
                            if (durationParts.length === 2) {
                                durationMinutes = durationParts[0] * 60 + durationParts[1];
                            } else if (durationParts.length === 3) {
                                durationMinutes = durationParts[0] * 60 * 60 + durationParts[1] * 60 + durationParts[2];
                            }
                            
                            const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
                            
                            return {
                                name: title,
                                startDate: startDate.toISOString(),
                                endDate: endDate.toISOString(),
                                status: status,
                                url: `https://atcoder.jp${href}`,
                                contestId: contestId
                            };
                        }
                    }
                    return null;
                }
                
                upcomingContestRows.forEach(row => {
                    const contest = extractContestData(row, "upcoming");
                    if (contest) contests.push(contest);
                });
                
                ongoingContestRows.forEach(row => {
                    const contest = extractContestData(row, "ongoing");
                    if (contest) contests.push(contest);
                });
                
                finishedContestRows.forEach(row => {
                    const contest = extractContestData(row, "finished");
                    if (contest) contests.push(contest);
                });
                
                return contests;
            });
            
            await browser.close();
            
            console.log(`Found ${contestsData.length} contests from AtCoder`);
            
            let newCount = 0;
            let updatedCount = 0;
            
            for (const contestData of contestsData) {
                // Only fetch solution for finished contests
                let solution = "";
                if (contestData.status === "finished") {
                    try {
                        solution = await this.fetchSolutionFromYoutube(contestData.name);
                    } catch (error) {
                        console.error(`Error fetching solution for ${contestData.name}:`, error);
                    }
                }
                
                // Check if contest already exists
                const existingContest = await Contest.findOne({
                    platform: this.platform._id,
                    name: contestData.name,
                    startDate: new Date(contestData.startDate)
                });
                
                if (!existingContest) {
                    // Create new contest
                    await Contest.create({
                        name: contestData.name,
                        startDate: new Date(contestData.startDate),
                        endDate: new Date(contestData.endDate),
                        status: contestData.status,
                        url: contestData.url,
                        platform: this.platform._id,
                        solution: solution
                    });
                    newCount++;
                } else {
                    // Update existing contest
                    existingContest.endDate = new Date(contestData.endDate);
                    existingContest.status = contestData.status;
                    existingContest.url = contestData.url;
                    if (solution) {
                        existingContest.solution = solution;
                    }
                    await existingContest.save();
                    updatedCount++;
                }
            }
            
            console.log(`AtCoder: Added ${newCount} new contests, updated ${updatedCount} existing contests`);
            
            // Update statuses after all contests are processed
            await this.updateContestsStatus();
        } catch (error) {
            console.error("Error fetching AtCoder contests:", error);
            throw error;
        }
    }
}

const createFetcher = async (platformName) => {
    console.log(`Creating fetcher for platform: ${platformName}`);
    const platform = await Platform.findOne({ name: platformName });
    
    if (!platform) {
        throw new Error(`Platform ${platformName} not found`);
    }
    
    console.log(`Found platform ${platformName} with ID ${platform._id}`);
    
    switch (platformName) {
        case "Codeforces":
            return new CodeforcesFetcher(platform);
        case "AtCoder":
            return new Atcoder(platform);
        default:
            throw new Error(`Platform ${platformName} not supported`);
    }
}

module.exports = createFetcher;