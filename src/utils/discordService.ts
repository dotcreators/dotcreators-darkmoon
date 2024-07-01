const { Webhook, MessageBuilder } = require('discord-webhook-node');

const hook = new Webhook(process.env.WEBHOOK_URL);
hook.setUsername('dotcreator');

export function sendDiscordMessage(
  title: string,
  message: string,
  severity: 'error' | 'info'
) {
  let embed: any = {};

  if (severity === 'error') {
    embed = new MessageBuilder()
      .setColor('#FA4545')
      .setTitle(`darkmoon-${title}`)
      .setDescription(message)
      .setTimestamp();
  } else if (severity === 'info') {
    embed = new MessageBuilder()
      .setColor('#FF902B')
      .setTitle(title)
      .setDescription(message)
      .setTimestamp();
  }

  hook.send(embed);
}
