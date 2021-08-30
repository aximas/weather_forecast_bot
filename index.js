const {Telegraf, Markup} = require('telegraf');
require('dotenv').config();
const text = require('./const');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const weatherAPItoken = process.env.WEATHER_API_TOKEN;

bot.start((ctx) => ctx.reply(`Hello ${ctx.message.from.first_name ? ctx.message.from.first_name : ctx.message.from.username}`));
bot.help((ctx) => ctx.reply(`${text.commads}`));

bot.command('weather', async (ctx) => {
    try {
        ctx.replyWithHTML('<b>Choose by</b>', Markup.inlineKeyboard(
            [
                [Markup.button.callback('City', 'btn_city'), Markup.button.callback('Geo', 'btn_geo')],
                [Markup.button.callback('Zip', 'btn_zip')]
            ]
        ))
    } catch (e) {
        console.error(e);
    }
});

bot.action('btn_city', async (ctx) => {
    try {
        await ctx.answerCbQuery();
        await ctx.reply('Input your city');

    } catch (e) {
        console.error(e);
    }
})

bot.on('text', async (ctx) => {
    const city = await ctx.message.text
    try {
        const weather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPItoken}`).then(response => response.data);
        await ctx.reply((weather.main.temp - 273.15).toFixed(0));
        console.log(weather.main.temp - 273.15);
    }
    catch (e) {
        ctx.reply('Sorry this city is not found');
        console.error(e.config.url, ctx.message.from.username);
    }


});


bot.launch();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))