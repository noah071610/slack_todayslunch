import { Injectable } from '@nestjs/common';
import { Block, KnownBlock } from '@slack/web-api';
import { IVoteList } from '@typings/index';
import { block } from '@utils/slack';
import Redis from 'ioredis';
import { api, myChannel, token } from 'src/main';
const redis = new Redis();

@Injectable()
export class HookService {
  async sendRestaurantList(body) {
    const listJSON = await redis.get(`${body.channel_id}_restaurants`);
    const list = JSON.parse(listJSON);
    const blocks: (Block | KnownBlock)[] = [
      {
        type: 'header',
        text: block.plain('식당 리스트'),
      },
      {
        type: 'divider',
      },
    ];
    list?.length > 0
      ? list.forEach(({ title, selected }) => {
          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${title}* (${selected}번 채택)`,
            },
          });
        })
      : blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `현재 등록된 식당이 없습니다.`,
          },
        });
    blocks.push({
      type: 'section',
      text: block.plain(' '),
    });
    blocks.push(block.divider);

    await api.chat.postMessage({
      token,
      text: '오늘 점심 뭐 먹을까요?',
      channel: myChannel,
      blocks,
    });
  }

  async addRestaurant(body) {
    const { text, channel_id: channel } = body;
    const [key, ...res] = text.split(' ');
    const commend = res?.join(' ');
    const redisKey = `${channel}_restaurants`;
    if (!commend) return false;

    if (key === 'add' && commend) {
      const restaurantsJSON = await redis.get(redisKey);
      const restaurants = JSON.parse(restaurantsJSON);
      const obj: IVoteList = {
        text: commend,
        userId: body.user_id,
        value: `restaurant0`,
        voted: [],
      };
      if (restaurants?.length > 0) {
        obj.value = `restaurant${
          restaurants[restaurants.length - 1].number + 1
        }`;
        restaurants.push(obj);
        await redis.set(redisKey, JSON.stringify(restaurants));
      } else {
        await redis.set(redisKey, JSON.stringify([obj]));
      }
      await api.chat.postMessage({
        token,
        text: '오늘 점심 뭐 먹을까요?',
        channel,
        blocks: [
          {
            type: 'header',
            text: block.plain(
              `"${commend}" 이름에 식당을 정상적으로 등록했어요!`,
            ),
          },
        ],
      });
    }
    if (key === 'delete' && commend) {
      const restaurantsJSON = await redis.get(redisKey);
      const restaurants = JSON.parse(restaurantsJSON) as IVoteList[];
      let isDeleted = false;

      await redis.set(
        redisKey,
        JSON.stringify(
          restaurants.filter(({ text }) => {
            if (text.includes(commend)) isDeleted = true;
            return !text.includes(commend);
          }),
        ),
      );
      await api.chat.postMessage({
        token,
        text: '오늘 점심 뭐 먹을까요?',
        channel,
        blocks: [
          {
            type: 'header',
            text: block.plain(
              isDeleted
                ? `"${commend}" 식당을 정상적으로 삭제하였습니다.`
                : `"${commend}" 이름에 식당을 찾지 못했습니다.`,
            ),
          },
        ],
      });
    }
    if (key === 'list') {
      await api.chat.postMessage({
        token,
        text: '오늘 점심 뭐 먹을까요?',
        channel,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'mrkdwn',
              text: '*현재 등록되어 있는 식당 리스트 입니다.*',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '<https://google.com|보러dfewf가기>',
            },
          },
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: ' ',
              emoji: true,
            },
          },
          {
            type: 'divider',
          },
        ],
      });
    }
  }
}
