const { App, AwsLambdaReceiver } = require('@slack/bolt');

// yyyy-mm-dd 形式を作成する関数
function formatDate(dt) {
  var y = dt.getFullYear();
  var m = ('00' + (dt.getMonth() + 1)).slice(-2);
  var d = ('00' + dt.getDate()).slice(-2);
  return y + '-' + m + '-' + d;
}

// hh:mm を作成する関数
function formatTime(dt) {
  const h = ('00' + dt.getHours()).slice(-2);
  const m = ('00' + dt.getMinutes()).slice(-2);
  return h + ':' + m;
}

// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  usr_token: process.env.SLACK_USER_TOKEN,
  receiver: awsLambdaReceiver,
});

// リマインダーセット用のモーダルを開く
app.shortcut('socket-mode-shortcut', async ({ shortcut, ack, context, logger }) => {
  // グローバルショートカットリクエストの確認
  ack();

  try {
    // 組み込みの WebClient を使って views.open API メソッドを呼び出す
    const result = await app.client.views.open({
      // `context` オブジェクトに保持されたトークンを使用
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'modal-id',
        title: {
          type: 'plain_text',
          text: 'リマインダー設定画面',
          emoji: true,
        },
        submit: {
          type: 'plain_text',
          text: '設定',
          emoji: true,
        },
        close: {
          type: 'plain_text',
          text: '中断',
          emoji: true,
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '各項目を書いてください',
            },
          },
          {
            type: 'divider',
          },
          // TODO: デフォルト値を設定する
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*宛先*',
            },
            accessory: {
              type: 'static_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select an item',
                emoji: true,
              },
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: '自分自身',
                    emoji: true,
                  },
                  value: 'toMe',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'チャンネル',
                    emoji: true,
                  },
                  value: 'toChannel',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'ユーザ',
                    emoji: true,
                  },
                  value: 'toUser',
                },
              ],
              action_id: 'actionId-3',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '>自分自身',
            },
          },
          {
            type: 'input',
            block_id: 'block_3',
            element: {
              type: 'plain_text_input',
              action_id: 'whatRemind',
            },
            label: {
              type: 'plain_text',
              text: 'メッセージ',
              emoji: true,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            block_id: 'frequency',
            text: {
              type: 'mrkdwn',
              text: '*リマインド*',
            },
            accessory: {
              type: 'radio_buttons',
              initial_option: {
                text: {
                  type: 'plain_text',
                  text: '1回のみ',
                  emoji: true,
                },
                value: 'Date',
              },
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: '1回のみ',
                    emoji: true,
                  },
                  value: 'Date',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '繰り返し',
                    emoji: true,
                  },
                  value: 'Cycle',
                },
              ],
              action_id: 'actionId-2',
            },
          },
          {
            type: 'input',
            block_id: 'block_1',
            element: {
              type: 'timepicker',
              initial_time: formatTime(new Date()),
              placeholder: {
                type: 'plain_text',
                text: 'Select time',
              },
              action_id: 'whenTime',
            },
            label: {
              type: 'plain_text',
              text: '時間',
              emoji: true,
            },
          },
          {
            type: 'input',
            block_id: 'block_2',
            element: {
              type: 'datepicker',
              initial_date: formatDate(new Date()),
              placeholder: {
                type: 'plain_text',
                text: 'Select a date',
                emoji: true,
              },
              action_id: 'whenDate',
            },
            label: {
              type: 'plain_text',
              text: '日付',
              emoji: true,
            },
          },
        ],
      },
    });

    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

// 送信先を選択した時の更新関数
app.action('actionId-3', async ({ ack, context, logger, body, payload }) => {
  await ack();

  let toParam = {};
  let blocks = body.view.blocks;

  switch (payload.selected_option.value) {
    case 'toMe':
      toParam = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '>自分自身',
        },
      };
      break;
    case 'toUser':
      toParam = {
        type: 'input',
        block_id: 'user_select',
        element: {
          type: 'users_select',
          placeholder: {
            type: 'plain_text',
            text: ' ',
            emoji: true,
          },
          action_id: 'static_select-action',
        },
        label: {
          type: 'plain_text',
          text: ' ',
          emoji: true,
        },
      };
      break;
    case 'toChannel':
      toParam = {
        type: 'input',
        block_id: 'channel_select',
        element: {
          type: 'plain_text_input',
          placeholder: {
            type: 'plain_text',
            text: '#チャンネル名',
            emoji: true,
          },
          action_id: 'static_select-action',
        },
        label: {
          type: 'plain_text',
          text: ' ',
          emoji: true,
        },
      };
      break;
    default:
      console.error('else block');
      break;
  }

  blocks.splice(3, 1, toParam);

  try {
    // 組み込みの WebClient を使って views.open API メソッドを呼び出す
    const result = await app.client.views.update({
      // `context` オブジェクトに保持されたトークンを使用
      token: context.botToken,
      view_id: body.view.id,
      view: {
        type: 'modal',
        callback_id: 'modal-id',
        title: {
          type: 'plain_text',
          text: 'リマインダー設定画面',
          emoji: true,
        },
        submit: {
          type: 'plain_text',
          text: '設定',
          emoji: true,
        },
        close: {
          type: 'plain_text',
          text: '中断',
          emoji: true,
        },
        blocks: body.view.blocks,
      },
    });
    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

// 日付指定を変えたときのmodal更新
app.action('actionId-2', async ({ ack, context, logger, body, payload }) => {
  await ack();

  let toParam = {};
  let blocks = body.view.blocks;
  logger.info(blocks);

  switch (payload.selected_option.value) {
    // TODO:要素数が10以上あった場合、要素数が9個になるようにしてからblockを更新する
    case 'Date':
      toParam = {
        type: 'input',
        block_id: 'block_2',
        element: {
          type: 'datepicker',
          initial_date: formatDate(new Date()),
          placeholder: {
            type: 'plain_text',
            text: 'Select a date',
            emoji: true,
          },
          action_id: 'whenDate',
        },
        label: {
          type: 'plain_text',
          text: '日付',
          emoji: true,
        },
      };
      break;
    case 'Cycle':
      toParam = {
        type: 'section',
        block_id: 'intervalBlock',
        text: {
          type: 'mrkdwn',
          text: '*間隔*',
        },
        accessory: {
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select an item',
            emoji: true,
          },
          options: [
            {
              text: {
                type: 'plain_text',
                text: '毎日',
                emoji: true,
              },
              value: 'everyDay',
            },
            {
              text: {
                type: 'plain_text',
                text: '毎週',
                emoji: true,
              },
              value: 'everyWeek',
            },
            {
              text: {
                type: 'plain_text',
                text: '毎月',
                emoji: true,
              },
              value: 'everyMonth',
            },
            {
              text: {
                type: 'plain_text',
                text: '毎年',
                emoji: true,
              },
              value: 'everyYear',
            },
          ],
          action_id: 'actionId-1',
        },
      };
      break;
    default:
      console.error('else block');
      break;
  }

  blocks.splice(8, 1, toParam);

  try {
    // 組み込みの WebClient を使って views.open API メソッドを呼び出す
    const result = await app.client.views.update({
      // `context` オブジェクトに保持されたトークンを使用
      token: context.botToken,
      view_id: body.view.id,
      view: {
        type: 'modal',
        callback_id: 'modal-id',
        title: {
          type: 'plain_text',
          text: 'リマインダー設定画面',
          emoji: true,
        },
        submit: {
          type: 'plain_text',
          text: '設定',
          emoji: true,
        },
        close: {
          type: 'plain_text',
          text: '中断',
          emoji: true,
        },
        blocks: blocks,
      },
    });

    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

// リマインド頻度を選択したときの更新関数
app.action('actionId-1', async ({ ack, context, logger, body, payload }) => {
  await ack();

  let toParam = {};
  let blocks = body.view.blocks;

  switch (payload.selected_option.value) {
    case 'everyDay':
      toParam = {
        type: 'section',
        text: {
          type: 'plain_text',
          text: ' ',
          emoji: true,
        },
      };
      break;
    case 'everyWeek':
      toParam = {
        type: 'input',
        block_id: 'everyWeekDate',
        element: {
          type: 'checkboxes',
          options: [
            {
              text: {
                type: 'plain_text',
                text: '月曜日',
                emoji: true,
              },
              value: 'Monday',
            },
            {
              text: {
                type: 'plain_text',
                text: '火曜日',
                emoji: true,
              },
              value: 'Tuesday',
            },
            {
              text: {
                type: 'plain_text',
                text: '水曜日',
                emoji: true,
              },
              value: 'Wednesday',
            },
            {
              text: {
                type: 'plain_text',
                text: '木曜日',
                emoji: true,
              },
              value: 'Thursday',
            },
            {
              text: {
                type: 'plain_text',
                text: '金曜日',
                emoji: true,
              },
              value: 'Friday',
            },
            {
              text: {
                type: 'plain_text',
                text: '土曜日',
                emoji: true,
              },
              value: 'Saturday',
            },
            {
              text: {
                type: 'plain_text',
                text: '日曜日',
                emoji: true,
              },
              value: 'Sunday',
            },
          ],
          action_id: 'checkboxes-action',
        },
        label: {
          type: 'plain_text',
          text: '曜日',
          emoji: true,
        },
      };
      break;
    case 'everyMonth':
      toParam = {
        type: 'input',
        block_id: 'everyMonthDate',
        element: {
          type: 'plain_text_input',
          action_id: 'plain_text_input-action',
        },
        label: {
          type: 'plain_text',
          text: '日付',
          emoji: true,
        },
      };
      break;
    case 'everyYear':
      toParam = {
        type: 'input',
        block_id: 'everyYearDate',
        element: {
          type: 'datepicker',
          initial_date: formatDate(new Date()),
          placeholder: {
            type: 'plain_text',
            text: 'Select a date',
            emoji: true,
          },
          action_id: 'whenDate',
        },
        label: {
          type: 'plain_text',
          text: '日付',
          emoji: true,
        },
      };
      break;
    default:
      console.error('else block');
      break;
  }

  logger.info(blocks.length);

  if (blocks.length <= 9) {
    blocks.push(toParam);
  } else {
    blocks.splice(9, 1, toParam);
  }

  try {
    // 組み込みの WebClient を使って views.open API メソッドを呼び出す
    const result = await app.client.views.update({
      // `context` オブジェクトに保持されたトークンを使用
      token: context.botToken,
      view_id: body.view.id,
      view: {
        type: 'modal',
        callback_id: 'modal-id',
        title: {
          type: 'plain_text',
          text: 'リマインダー設定画面',
          emoji: true,
        },
        submit: {
          type: 'plain_text',
          text: '設定',
          emoji: true,
        },
        close: {
          type: 'plain_text',
          text: '中断',
          emoji: true,
        },
        blocks: blocks,
      },
    });

    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

// モーダルでのデータ送信リクエストを処理します
app.view('modal-id', async ({ ack, body, view, client, logger, payload, context }) => {
  // モーダルでのデータ送信リクエストを確認
  await ack();

  logger.info(payload);
  logger.info(view);
  logger.info(body);

  // block_id: block_1 という input ブロック内で action_id: input_a の場合の入力
  const remindMessage = view['state']['values']['block_3']['whatRemind']['value'];
  const time = view['state']['values']['block_1']['whenTime']['selected_time'];
  const frequency = view.state.values.frequency['actionId-2']['selected_option']['value'];

  let remindDate = '';
  let interval = '';
  let val = '';

  if (frequency === 'Date') {
    remindDate = view['state']['values']['block_2']['whenDate']['selected_date'];
    val = remindDate + time;
    logger.info(val);
  } else if (frequency === 'Cycle') {
    interval = view['state']['values']['intervalBlock']['actionId-1']['selected_option']['value'];
    switch (interval) {
      case 'everyDay':
        val = 'every day ' + time;
        break;
      case 'everyWeek':
        logger.info(
          view['state']['values']['everyWeekDate']['checkboxes-action']['selected_options']
        );
        let dayOfWeek = view['state']['values']['everyWeekDate']['checkboxes-action'][
          'selected_options'
        ].map((element) => element.value);
        const dayOfWeekStr = dayOfWeek.join(',');
        val = 'at ' + time + ' on every ' + dayOfWeekStr;
        break;
      case 'everyMonth':
        val =
          'at ' +
          time +
          ' on ' +
          view['state']['values']['everyMonthDate']['plain_text_input-action']['value'] +
          ' every month';
        break;
      case 'everyYear':
        val =
          'at ' +
          time +
          ' on ' +
          view['state']['values']['everyYearDate']['whenDate']['selected_date'].slice(-5) +
          ' every month';
        break;
      default:
        console.error('else block');
        break;
    }
    logger.info(interval);
  } else {
    logger.error('Other parameter:' + frequency);
  }

  const user = body['user']['id'];

  // ユーザーに対して送信するメッセージ
  let msg = '/remind ';

  if (view.state.values.hasOwnProperty('channel_select')) {
    msg += view['state']['values']['channel_select']['static_select-action']['value'] + ' ';
  } else if (view.state.values.hasOwnProperty('user_select')) {
    msg += view['state']['values']['user_select']['static_select-action']['value'] + ' ';
  } else {
    msg += ' ';
  }
  msg += remindMessage + ' ' + val;

  // ユーザーにメッセージを送信
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg,
    });
  } catch (error) {
    logger.error(error);
  }
});

// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
