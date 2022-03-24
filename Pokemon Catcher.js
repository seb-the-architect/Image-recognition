//Packages
const Discord = require("discord.js");
const puppeteer = require("puppeteer");
const download = require('image-downloader')
const fs = require("fs");

//Normal variables
stealthMode = true;
full_url = "";
cPrefix = "p!";
//Guild and channel server name
gServerName = "Terminal";

//Declare the discord account
var bot = new Discord.Client;

bot.on("ready", () => console.log(`Ay we logged in as ${bot.user.tag}!`));

//MessageDelete
bot.on("message", msg => {

    let path = "C:\\Users\\USER\\Desktop\\Discord Bots\\Pokemon Farm\\Deleted Images\\"

    if (msg.channel.type == "text") {
        data = `${msg.author.tag} : ${msg.guild.name}@${msg.channel.name} : ${msg.content} : ${msg.createdAt}\n`
        fs.appendFile("logged.txt", data, (err) => {
            if (err) console.log(err);
            console.log(`\x1b[1m\x1b[31mDeletion Detected: ${msg.guild.name} from ${msg.author.tag} in ${msg.channel.name} at ${msg.createdAt} with ${msg.content}\x1b[0m`);
        });
    }
    if(msg.channel.type == "dm")
    {
        data = `${msg.author.tag} : ${msg.content} : ${msg.createdAt}\n`
        fs.appendFile("logged.txt", data, (err) => {
            if (err) console.log(err);
            console.log(`\x1b[1m\x1b[31mDeletion Detected: From ${msg.author.tag} at ${msg.createdAt} with ${msg.content}\x1b[0m`);
        });
    }

    if (msg.attachments.size != 0) {
        msg.attachments.forEach(attach => {

            const options = {
                url: attach.url/*.replace("//cdn", "//media").replace(".com", ".net")*/,
                dest: 'Deleted Images'
            }

            const options2 = {
                url: attach.url.replace("//cdn", "//media").replace(".com", ".net"),
                dest: 'Deleted Images'
            }

            //console.log(attach.url.replace("//cdn", "//media"));
            download.image(options)
                .then(({ filename, image }) => {
                    console.log('Saved to', filename)  // Saved to /path/to/dest/image.jpg
                })
                .catch((err) => {
                    download.image(options2)
                        .then(({ filename, image }) => {
                            console.log('Saved to', filename)  // Saved to /path/to/dest/image.jpg
                        })
                        .catch((err) => { console.log(`Failed but got link: ${attach.url}`) });
                })
        })
    }
})

//When a message is sent anywhere
bot.on("message", msg => {
    //If pokecord sends a message, read it.
    if (msg.author.username === "Pokécord") {
        //Grabbing the text-channel of the message that pokecord sent
        var msgChannel = msg.channel;
        //console.log(msg.embeds[0]);
        //If the message contains an embed.
        if (msg.embeds[0] !== undefined) {
            for (bed in msg.embeds) {
                //console.log("Got an embed from pokecord...");
                //If the Embed is an [ENCOUNTER]
                if (msg.embeds[bed].title === "‌‌A wild pokémon has аppeаred!") {
                    if (stealthMode === true) { console.log('\u0007') }
                    picURL = msg.embeds[bed].image.url
                    console.log("\x1b[33m%s\x1b[0m", "[ENCOUNTER]", "A wild pokemon has appeared!");
                    //Grabbing the final google image search URL
                    full_url = "https://www.google.com/searchbyimage?&image_url=" + picURL
                    picChannel = msg.channel;
                    if (stealthMode == false) {
                        //Grabbing the pokemon name
                        (async () => {
                            //Launches the browser
                            var browser = await puppeteer.launch();
                            //Opens up a new page (a tab perhaps)
                            var page = await browser.newPage();
                            await page.goto(full_url);

                            pName = await page.evaluate(() => {
                                var fullString = document.querySelector('div [class = "LC20lb DKV0Md"]').innerText;
                                var pName = fullString.split(" ")[0];
                                console.log(`Found ${pName}...`);
                                return pName;
                            })
                            //THE BELOW LINE IS A TEST, MAYBE UNCOMMENT IT
                            await browser.close()
                            pName = pName.toLowerCase();
                            //Sending the catch message
                            msgChannel.send(cPrefix + `catch ${pName}`);
                        })();
                        full_url == "";
                    }

                }
                //If the Embed is a [LVLUP]
                if (msg.embeds[bed].title === `Congratulations ${bot.user.username}!`) {
                    console.log("\x1b[1;35m%s\x1b[0m", "[LVLUP]", msg.embeds[bed].description);
                }
                //If the Embed is an [EVOLVE]
                if (msg.embeds[bed].title.includes("is evolving!")) {
                    console.log("\x1b[1;32m%s\x1b[0m", "[EVOLVE]", msg.embeds[bed].description);
                }
            }
        }
        else {
            //console.log("Got a message from pokecord...");
            //If the Message is a [CATCH]
            if (msg.content.includes("You caught")) {
                var newString = msg.content.split("!");
                console.log("\x1b[1;36m%s\x1b[0m", "[CATCH]", `Congratulations! ${newString[1].trim()}!`);
            }
            //If the Message is a [FAIL]
            if (msg.content === "This is the wrong pokémon!") {
                console.log("\x1b[31m%s\x1b[0m", "[FAIL]", `Failed: ${picURL}`)
                fs.appendFile("failed.txt", picURL + "\n", (err) => {
                    if (err) { throw err };
                })
            }
        }
    }
    //If the user sends a message
    try {
        if (msg.author.username === bot.user.username && msg.guild.name === gServerName) {
            //If the user sends a catch command
            if (msg.content === "catchit") {
                if (full_url !== "") {
                    console.log("\x1b[1;31m%s\x1b[0m", "[COMMAND]", "Catchit");
                    msgChannel = picChannel;
                    (async () => {
                        //Launches the browser
                        var browser = await puppeteer.launch();
                        //Opens up a new page (a tab perhaps)
                        var page = await browser.newPage();
                        await page.goto(full_url);

                        pName = await page.evaluate(() => {
                            var fullString = document.querySelector('div [class = "LC20lb DKV0Md"]').innerText;
                            var pName = fullString.split(" ")[0];
                            console.log(`Found ${pName}...`);
                            return pName;
                        })
                        await browser.close();
                        pName = pName.toLowerCase();
                        //Sending the catch message
                        msgChannel.send(cPrefix + `catch ${pName}`);
                    })();
                    full_url == "";
                }
            }
            //If the user sends a stealth change
            else if (msg.content.includes("stealth")) {
                if (msg.content.split(" ")[1] === "false") {
                    stealthMode = false;
                    console.log("\x1b[1;31m%s\x1b[0m", "[COMMAND]", "Stealth = false");
                }
                else if (msg.content.split(" ")[1] === "true") {
                    stealthMode = true;
                    console.log("\x1b[1;31m%s\x1b[0m", "[COMMAND]", "Stealth = true");
                    msg.reply("Stealth set to true");
                }
            }

            else if (msg.content.includes("spambot")) {
                /*if (msg.content.split(" ")[1] === "start") {
                    msg.reply("Spambot started!");
                    console.log("\x1b[1;31m%s\x1b[0m", "[COMMAND]", "Spambot = true");
                    spamming = true;
                    let svChannel = bot.guilds.find(sv => sv.name === sName).channels.find(ch => ch.name === cName);
                    function spam() {
                        return new Promise((resolve) => {
                            // send message on spam channel
                            svChannel.send(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
                                .then(msg => {
                                    // wait 100 ms until sending next spam message
                                    setTimeout(() => {
                                        // continue spamming if spamming variable is true
                                        if (spamming) {
                                            spam()
                                                .then(resolve) // not entirely necessary, but good practice
                                                .catch(console.log); // log error to console in case one shows up
                                        }

                                        // otherwise, just resolve promise to end this looping
                                        else {
                                            resolve();
                                        }
                                    }, 1500)
                                })
                                .catch(console.log);

                        });
                    }
                    spam();
                }
                if (msg.content.split(" ")[1] === "stop") {
                    console.log("\x1b[1;31m%s\x1b[0m", "[COMMAND]", "Spambot = false");
                    msg.reply("Spambot stopped!");
                    spamming = false;
                }*/
            }

            else if (msg.content.includes("-userinfo")) {
                console.log("\x1b[1;31m%s\x1b[0m", "[COMMAND]", "UserInfo");
                let idToSteal = msg.content.split(" ")[1];
                bot.users.forEach(function (element) {
                    if (element.id == idToSteal) {
                        newEmbed = new discord.RichEmbed();
                        newEmbed.setImage(element.avatarURL)
                        newEmbed.addField("Name", element.username)
                        newEmbed.addField("Date joined Discord", element.createdAt)
                        newEmbed.setColor([0, 255, 255]);
                        msg.channel.send("", newEmbed);
                    }
                })
            }

            else if (msg.content.includes("-serverinfo")) {
                console.log("\x1b[1;31m%s\x1b[0m", "[COMMAND]", "ServerInfo");
                let idToSteal = msg.content.split(" ")[1];
                bot.guilds.forEach(function (element) {
                    if (element.id == idToSteal) {
                        newEmbed = new discord.RichEmbed();
                        newEmbed.setImage(element.iconURL);
                        newEmbed.addField("Name", element.name);
                        newEmbed.addField("Date joined Discord", element.createdAt);
                        newEmbed.addField("Memmber count", element.memberCount);
                        newEmbed.setColor([0, 255, 255]);
                        msg.channel.send("", newEmbed);
                    }
                })
            }

        }
    }
    catch (e) {
        //console.log(e);
    }
})

bot.login("TOKEN");