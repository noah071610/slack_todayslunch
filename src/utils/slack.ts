/* eslint-disable @typescript-eslint/no-var-requires */
import { MrkdwnElement, PlainTextElement } from '@slack/web-api';
import { IVoteList } from '@typings/index';
import Redis from 'ioredis';
import { api, token } from 'src/main';
const redis = new Redis();
const dayjs = require('dayjs');

export const block = {
  plain: (text: string): PlainTextElement => ({
    type: 'plain_text',
    text,
    emoji: true,
  }),
  mrkdwn: (text: string): MrkdwnElement => ({
    type: 'mrkdwn',
    text,
  }),
  divider: { type: 'divider' },
};

export const votes = [
  {
    text: {
      type: 'plain_text',
      text: ':curry: 1. 시골집 (한식)',
      emoji: true,
    },
    value: 'restaurant_0',
    voted: [
      'https://user-images.githubusercontent.com/74864925/195762041-c20cca45-3e3e-4f20-a7f8-c3405166ccc2.jpg',
      'https://user-images.githubusercontent.com/74864925/195762049-64548328-eafc-4d40-b681-e8b0626dc1af.jpg',
    ],
    userId: 'me',
  },
  {
    text: {
      type: 'plain_text',
      text: ':shallow_pan_of_food: 2. 가람부대찌개 (한식)',
      emoji: true,
    },
    value: 'restaurant_0',
    voted: [
      'https://user-images.githubusercontent.com/74864925/195762039-c8047d99-65c0-48a9-8c72-2c29815a1035.jpg',
    ],
    userId: 'me',
  },
  {
    text: {
      type: 'plain_text',
      text: ':broccoli: 3. 샐리오',
      emoji: true,
    },
    voted: [
      'https://user-images.githubusercontent.com/74864925/195762039-c8047d99-65c0-48a9-8c72-2c29815a1035.jpg',
      'https://user-images.githubusercontent.com/74864925/195762053-cd6c1255-31dd-4209-b529-1e6b57a747f1.jpg',
      'https://user-images.githubusercontent.com/74864925/195762047-9c0ec0eb-1e41-466b-b03f-d9bb7944fa72.jpg',
    ],
    value: 'input_me',
    userId: 'me',
  },
];

export const delegations = [
  {
    image:
      'https://user-images.githubusercontent.com/74864925/195762039-c8047d99-65c0-48a9-8c72-2c29815a1035.jpg',
    real_name: '곽도영',
  },
];

export async function getRegisterBlock(channel: string) {
  const date = new Date();
  const allRestaurantJSON = await redis.get(`${channel}_restaurants`);
  const allRestaurant: IVoteList[] = JSON.parse(allRestaurantJSON);
  if (!allRestaurant?.length) return false;

  const registerBlocks: any = [
    {
      type: 'header',
      text: block.plain('도다팀 여러분! 오늘 점심 뭐 먹을까요?'),
    },
    {
      type: 'context',
      elements: [block.mrkdwn(`*${dayjs(date).format('LL')}*  |  런치봇`)],
    },
    block.divider,
    {
      type: 'input',
      dispatch_action: false,
      block_id: 'restaurant_block',
      label: block.plain('오늘 가고 싶은 식당이 있나요? :fried_shrimp:'),
      element: {
        type: 'multi_static_select',
        action_id: 'restaurant_action',
        placeholder: block.plain('음식점 선택'),
        options: allRestaurant.map(({ text, value }) => ({
          text: block.plain(text),
          value,
        })),
      },
    },
    {
      type: 'input',
      dispatch_action: false,
      block_id: 'lunch_option_block',
      label: block.plain(
        '딱히 가고싶은 음식점이 없나요? :face_with_spiral_eyes:  *선택 음식점이 있다면 자동으로 무시되요',
      ),
      element: {
        type: 'radio_buttons',
        action_id: 'lunch_option_action',
        options: [
          {
            text: block.plain('식당을 이미 입력했어요'),
          },
          {
            text: block.plain('선택 위임 (기권)'),
            value: 'delegation',
          },
          {
            text: block.plain('랜덤'),
            value: 'random',
          },
        ],
      },
    },
    {
      type: 'input',
      dispatch_action: false,
      block_id: 'restaurant_input_block',
      element: {
        type: 'plain_text_input',
        action_id: 'restaurant_input_action',
        placeholder: block.plain('여기에 입력해주세요.'),
      },
      label: block.plain(
        '기타 의견 작성 :hamburger:  *의견을 작성하면 선택된 식당은 무시되요.',
      ),
    },
    {
      type: 'section',
      text: block.plain(' '),
    },
    block.divider,
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: block.plain('접수하기 :tada:'),
          style: 'primary',
          value: 'submit',
          action_id: 'submit_lunch',
        },
      ],
    },
  ];
  return registerBlocks;
}

export async function getVoteBlock(
  channel: string,
  selectedRestaurantValue?: string,
  userId?: string,
  votedUserProfile?: { userImage: string; userName: string },
) {
  const date = new Date();
  const votesKey = `${channel}_votes`;
  const votesJSON = await redis.get(votesKey);
  const votes: IVoteList[] = votesJSON ? JSON.parse(votesJSON) : [];
  if (!votes?.length) return false;

  const candidates: IVoteList[] = [];
  const opinions: IVoteList[] = [];
  const delegations: IVoteList[] = [];

  votes.forEach((v) => {
    if (v.value === 'opinion') {
      opinions.push(v);
      return;
    }
    if (v.value === 'delegation') {
      delegations.push(v);
      return;
    }
    candidates.push(v);
  });

  const candidateBlocks = candidates.map(({ text, value, voted }) => {
    const temp = [...voted];
    if (value === selectedRestaurantValue && votedUserProfile && userId) {
      temp.push({
        userId,
        image: votedUserProfile.userImage,
        name: votedUserProfile.userName,
      });
    }
    return [
      {
        type: 'section',
        text: block.mrkdwn(`*${text}*`),
        accessory: {
          type: 'button',
          text: block.plain('투표 :+1:'),
          value,
          action_id: `vote-${value}`,
        },
      },
      {
        type: 'context',
        elements:
          temp?.length > 0
            ? [
                ...voted.map(({ image, name }, i) => ({
                  type: 'image',
                  image_url: image,
                  alt_text: `${name}_vote_user_${i}`,
                })),
                block.plain(`${voted?.length}명 투표`),
              ]
            : [block.plain('0명 투표')],
      },
    ];
  });

  const resultBlocks = [
    {
      type: 'header',
      text: block.plain('오늘 먹을 점심을 투표해주세요!'),
    },
    {
      type: 'context',
      elements: [block.mrkdwn(`*${dayjs(date).format('LL')}*  |  런치봇`)],
    },
    {
      type: 'divider',
    },
  ];
  for (let i = 0; i < candidateBlocks.length; i++) {
    resultBlocks.push(candidateBlocks[i][0] as any);
    resultBlocks.push(candidateBlocks[i][1] as any);
  }

  if (delegations?.length > 0) {
    resultBlocks.push({
      type: 'divider',
    });
    resultBlocks.push({
      type: 'context',
      elements: [block.mrkdwn('선택 위임 (기권)')],
    });
  }

  const delegationBlock = {
    type: 'context',
    elements: delegations
      .map(({ userImage, userName }) => [
        {
          type: 'image',
          image_url: userImage,
          alt_text: `${userName}_delegation`,
        },
        block.plain(userName),
      ])
      .flat() as any,
  };

  resultBlocks.push(delegationBlock);
  return resultBlocks as any;
}

export const getBodyInfo = async (body) => {
  const userId: string = body.user.id;
  const channel: string = body.channel.id;
  const userValues = body?.state?.values;
  const restaurants: IVoteList[] =
    userValues?.restaurant_block?.restaurant_action?.selected_options?.map(
      (v) => ({ text: v.text, value: v.value, voted: [], userId }),
    );
  const input: string =
    userValues?.restaurant_input_block?.restaurant_input_action?.value;
  const option: string =
    userValues?.lunch_option_block[
      Object.keys(userValues?.lunch_option_block)[0]
    ]?.selected_option?.value;

  return {
    userId,
    channel,
    restaurants,
    input,
    option,
  };
};

export const getUserProfile = async (userId: string) => {
  const { userImage, userName } = await api.users.profile
    .get({
      token,
      user: userId,
    })
    .then((res) => ({
      userImage: res.profile.image_32,
      userName: res.profile.real_name,
    }));
  return { userImage, userName };
};
