import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { api, myChannel, token } from './main';
import { IVoteList } from './typings';
import {
  block,
  getBodyInfo,
  getRegisterBlock,
  getUserProfile,
  getVoteBlock,
} from './utils/slack';
const redis = new Redis();

const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

dayjs.extend(localizedFormat);
dayjs().format('LL');
dayjs().format();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Lunch!';
  }
  async getResult(body) {
    const { channel, input, option, restaurants, userId } = await getBodyInfo(
      body,
    );

    if (body.actions[0].action_id.includes('vote-')) {
      const selectedRestaurantValue = body.actions[0].action_id.split('-')[1];
      const votedUserProfile = await getUserProfile(userId);
      const blocks: any = await getVoteBlock(
        channel,
        selectedRestaurantValue,
        userId,
        votedUserProfile,
      );

      await api.chat.update({
        channel,
        token,
        ts: body.message.ts,
        as_user: true,
        blocks,
      });
    }

    if (body.actions[0].action_id === 'submit_lunch') {
      const date = new Date();
      const { userImage, userName } = await getUserProfile(userId);

      const want: IVoteList = await (async function () {
        if (input && input.trim()) {
          return {
            value: 'opinion',
            text: input,
            userId,
          };
        }
        if (restaurants?.length > 0) {
          const target = restaurants.sort(() => Math.random() - 0.5)[0];
          return {
            ...target,
            voted: [{ name: userName, image: userImage, userId }],
          };
        }
        if (option === 'random') {
          const allRestaurantJSON = await redis.get(`${channel}_restaurants`);
          const allRestaurant: IVoteList[] = JSON.parse(allRestaurantJSON);
          const target = allRestaurant.sort(() => Math.random() - 0.5)[0];
          return {
            ...target,
            voted: [{ name: userName, image: userImage, userId }],
          };
        } else {
          return {
            value: `delegation`,
            text: '?????? ?????? (??????)',
            userId,
            userImage,
            userName,
          };
        }
      })();

      const votesKey = `${channel}_votes`;
      const votesJSON = await redis.get(votesKey);
      const votes: IVoteList[] = votesJSON ? JSON.parse(votesJSON) : [];
      if (votes.find(({ value }) => value === want.value)) {
        // MEMO: if someone already regiested list
        const temp: IVoteList[] = votes.map((v) => {
          if (v.value === want.value) {
            return {
              ...v,
              voted: [
                ...v.voted,
                {
                  image: userImage,
                  name: userName,
                  userId,
                },
              ],
            };
          } else {
            return v;
          }
        });
        await redis.set(votesKey, JSON.stringify(temp));
      } else {
        // MEMO: register new list to vote list
        votes.push(want);
        await redis.set(votesKey, JSON.stringify(votes));
      }

      await api.chat.update({
        channel,
        token,
        ts: body.message.ts,
        as_user: true,
        text: '?????? ????????? ??????????????????!',
        blocks: [
          {
            type: 'header',
            text: block.plain(':tada: ?????? ????????? ??????????????????! :tada:'),
          },
          {
            type: 'context',
            elements: [
              block.mrkdwn(`*${dayjs(date).format('LL')}*  |  ?????? ?????????`),
            ],
          },
          block.divider,
          {
            type: 'section',
            text: block.mrkdwn(
              '*????????? ?????? ???????????????!* \n????????? 11??? 30????????? ??????????????? :laughing:',
            ),
          },
          {
            type: 'context',
            elements: [
              {
                type: 'image',
                image_url: userImage,
                alt_text: 'user_profile_image',
              },
              block.mrkdwn(`*${userName}* ?????? ?????? : ${want.text}`),
            ],
          },
          block.divider,
        ],
      });
    }
  }
  async sendRegisterMessage() {
    const blocks = await getRegisterBlock(myChannel);
    await api.chat.postMessage({
      token,
      text: '?????? ?????? ??? ?????????????',
      channel: myChannel,
      blocks,
    });
  }
  async sendVoteMessage() {
    const blocks = await getVoteBlock(myChannel);
    await api.chat.postMessage({
      token,
      text: '?????? ????????? ???????????????!',
      channel: myChannel,
      blocks,
    });
  }
}
