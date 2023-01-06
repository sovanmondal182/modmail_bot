const discord = require("discord.js");
const client = new discord.Client()
prefix = "//"
ServerID = "855731731545718794"
const keepAlive = require('./server.js')

client.on("ready", () => {

    console.log("Bot online")
    client.user.setActivity("My DMs for Help ", { type: "WATCHING"})
})


client.on("message", async message => {
    if (message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();

    if (message.guild) {

        if (command == "setup") {
            if (!message.content.startsWith(prefix)) return;
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("You need Admin Permissions to setup the modmail system!")
            }

            if (!message.guild.me.hasPermission('MANAGE_CHANNELS','EMBED_LINKS','ATTACH_FILES','READ_MESSAGE_HISTORY','MANAGE_ROLES','SEND_MESSAGES','VIEW_CHANNEL')) {
                return message.channel.send("Bot need MANAGE_CHANNELS,EMBED_LINKS,ATTACH_FILES,READ_MESSAGE_HISTORY,MANAGE_ROLES,SEND_MESSAGES,VIEW_CHANNEL Permissions to setup the modmail system!")
            }


            let role = message.guild.roles.cache.find((x) => x.name == "Support Team")
            let role2 = message.guild.roles.cache.find((x) => x.name == "dm me for help")
            let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

            if (!role) {
                role = await message.guild.roles.create({
                    data: {
                        name: "Support Team",
                        color: "YELLOW"
                    },
                    reason: "Role needed for ModMail System"
                })
            }

            await message.guild.channels.create("MODMAIL", {
                type: "category",
                topic: "All the mail will be here",
                permissionOverwrites: [
                    {
                        id: role.id,
                        allow: ['MANAGE_CHANNELS','EMBED_LINKS','ATTACH_FILES',"VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    },
                    {
                        id: everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    },
                    {
                        id: role2.id,
                        allow: ['MANAGE_CHANNELS','EMBED_LINKS','ATTACH_FILES','READ_MESSAGE_HISTORY','SEND_MESSAGES','VIEW_CHANNEL']
                    }
                ]
            })


            return message.channel.send("Setup is Completed ✅")

        } else if (command == "close") {
            if (!message.content.startsWith(prefix)) return;
            if (!message.member.roles.cache.find((x) => x.name == "Support Team")) {
                return message.channel.send("You need Support Team role to use this command")
            }
            if (message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {

                const person = message.guild.members.cache.get(message.channel.name)

                if (!person) {
                    return message.channel.send("I am Unable to close the channel and this error is coming because probaly channel name is changed.")
                }

                await message.channel.delete()

                let yembed = new discord.MessageEmbed()
                    .setAuthor("MAIL CLOSED", client.user.displayAvatarURL())
                    .setColor("RED")
                    .setFooter("Mail is closed by a Staff. Thanks for contacting us.")
                if (args[0]) yembed.setDescription(`Reason: ${args.join(" ")}`)

                return person.send(yembed)

            }
        } else if (command == "open") {
            if (!message.content.startsWith(prefix)) return;
            const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

            if (!category) {
                return message.channel.send("Moderation system is not setuped in this server, use " + prefix + "setup")
            }

            if (!message.member.roles.cache.find((x) => x.name == "Support Team")) {
                return message.channel.send("You need `Support Team` role to use this command")
            }

            const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            const category2 = message.guild.channels.cache.find((x) => x.name == target.id)
            if(category2.name==target.id){
                await category2.delete()
            }
            if (!target) {
                return message.channel.send("Please mention an user.")
            }


            const channel = await message.guild.channels.create(target.id, {
                type: "text",
                parent: category.id,
                topic: "Mail is Direct Opened by **" + message.author.username + "** to make contact with " + message.author.tag
            })

            let nembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", target.user.displayAvatarURL({ dynamic: true }))
                .setColor("BLUE")
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setDescription('**Message:-** '+message.content)
                .addField("Name", `<@${target.user.id}>`)
                .addField("User ID", target.id)
                .addField("Account Creation Date", target.user.createdAt)
                .addField("Direct Contact", "Yes(it means this mail is opened by a Staff)");

            channel.send(nembed)

            let uembed = new discord.MessageEmbed()
                .setAuthor("MAIL OPENED")
                .setColor("GREEN")
                .setDescription("You have been contacted by Staff of **" + message.guild.name + "**, Please wait until he send another message to you!");


            target.send(uembed);

            let newEmbed = new discord.MessageEmbed()
                .setDescription("Opened The Mail: <#" + channel + ">")
                .setColor("GREEN");

            return message.channel.send(newEmbed);
        } else if (command == "help") {
            if (!message.content.startsWith(prefix)) return;
            let embed = new discord.MessageEmbed()
                .setAuthor('BeerBiceps') 
                .addField("//setup", "Setup the modmail system", true)
                .addField("//open", 'Let you open the mail to contact anyone (Please mention the user).', true)
                .addField("//close", "Close the mail in which you use this command.", true);

            return message.channel.send(embed)

        }
    }

    if (message.channel.parentID) {

        const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

        if (message.channel.parentID == category.id) {
            let member = message.guild.members.cache.get(message.channel.name)

            if (!member){ 
                return message.channel.send('Unable To Send Message')
            }
            let lembed = message.content
            member.send('**Staff:** '+lembed)

        }


    }

    if (!message.guild) {
        const guild = await client.guilds.cache.get(ServerID) || await client.guilds.fetch(ServerID).catch(m => { })
        if (!guild) return;
        const category = guild.channels.cache.find((x) => x.name == "MODMAIL")
        if (!category) return;
        const main = guild.channels.cache.find((x) => x.name == message.author.id)


        if (!main) {
            

            let sembed = new discord.MessageEmbed()
                .setAuthor("MAIL OPENED")
                .setColor("GREEN")
                .setDescription("__**Please read this carefully first**__\nThanks for contacting ***BeerBiceps Staff Support***\n\nPlease read <#855752329281929217> and <#855761314512371712> before creating a support thread. If you have already read, please react with ✅ to your message.\n\n<:greenarrow:860408829120217108>  __*If you want to ask questions about the server or Discord in general, please ask it directly.*__\n\n<:greenarrow:860408829120217108>:  __*If you want to report someone*__\n> 1. Their username and tag, like: User#1234 or his/her Discord ID\n> 2. The rule they broke or the offence they made;\n> 3. After sending these, the concerned staff will tell you to DM the proof (screenshot/recording) You will be told whom to DM\n\n<:greenarrow:860408829120217108>  __*If you want to give a suggestion*__\n1. Use this format\n> ```\n> Your Suggestion : \n> Reason : \n> How will it help the server :  ```")

            message.author.send(sembed).then(r => {
                            message.react('✅')
                            message.react('❎');
                    });

                    // First argument is a filter function
                    message.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❎'),
                            { max: 1, time: 30000 }).then(async collected => {
                                    if (collected.first().emoji.name == '✅') {
                                            message.reply('Mail send successfully');
                                            let mx = await guild.channels.create(message.author.id, {
                                              type: "text",
                                              parent: category.id,
                                              topic: "This mail is created for helping  **" + message.author.tag + " **"
                                          })
                                          mx.send('<@&856045274791280640>')
                                          mx.send(message.author.id)
                                          let eembed = new discord.MessageEmbed()
                                          .setAuthor("DETAILS", message.author.displayAvatarURL({ dynamic: true }))
                                          .setColor("BLUE")
                                          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                                          .setDescription('**Message:-** '+message.content)
                                          .addField("Name", `<@${message.author.id}>`)
                                          .addField("User ID", message.author.id)
                                          .addField("Account Creation Date", message.author.createdAt)
                                          .addField("Direct Contact", "No(it means this mail is opened by person not a staff)")


                                      return mx.send(eembed)
                                    }
                                    else
                                            message.reply('Operation canceled.');
                            }).catch(() => {
                                    message.reply('Timed out! Operation canceled.');
                            });


            
        }


        main.send(`**${message.author.username}**: `+message.content)

    }





})

keepAlive()
client.login("Nzc5NDM2OTA0OTk4MjQwMjg2.X7ghLw.dL_1xXFazt1ZMdoS-GNKcp6WEZw");