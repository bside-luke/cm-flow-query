const prompts = require('prompts');
const chalk = require('chalk');
const {
  getNFTs,
  getCollections,
  getBalance
} = require('./queries');
const readline = require('readline');

const pause = () => {
  const wait = readline.createInterface({
    input: process.stdin
  });
  return new Promise(resolve => wait.question("", () => resolve(wait.close())));
}

const main = async () => {
  const response = await prompts([{
      type: 'select',
      name: 'query',
      message: 'What are we attempting to query?',
      choices: [{
          title: 'NFTs',
          description: 'Returns all NFTs for the given address/addresses',
          value: getNFTs,
        }, {
          title: 'Collections',
          description: 'Returns all collections for the given address/addresses (broken)',
          value: getCollections,
          disabled: true,
        }, {
          title: 'Balance',
          description: 'Returns the account balance of the given address/addresses',
          value: getBalance,
        },
      ],
    },
    {
      type: 'select',
      name: 'output',
      message: 'What format would you like the output to be in?',
      choices: [{
          title: 'human',
          description: 'Output data in a human readable way to stdout',
          value: 'human',
        },
        {
          title: 'JSON',
          description: 'Output data in JSON format on stdout',
          value: 'json',
        },
      ],
    },
    {
      type: 'text',
      name: 'addresses',
      message: 'Enter flow addresses (singular, space, or comma seporated)',
    },
  ]);

  const addresses = response.addresses.match(/(0x[a-zA-Z0-9]{16})/g);

  if (addresses === null) {
    console.error(chalk.red('No addresses were received'));
  } else {
    if ([getCollections, getNFTs].includes(response.query)) {
      const NFTs = await Promise.all(addresses.map(response.query));
      if (response.output === 'json') {
        console.log(JSON.stringify(NFTs, null, 2));
      } else {
        console.log(NFTs.map((n) => `${chalk.yellow(n.address)} (${n.result.length}):\n${
        n.result.map((m, d, a) => `\t${chalk.cyan(m)}${(d !== 0 && (d + 1) % 5 === 0)
          ? ((d + 1) === a.length ? '.' : ',\n')
          : ', '}`).join('')}`).join('\n'));
      }
    } else {
      const res = await Promise.all(addresses.map(response.query));
      if (response.output === 'json') {
        console.log(JSON.stringify(res, null, 2));
      } else {
        console.log(res.map(account => `\tAddress: ${account.address}
        Flow: ${account.flow}
        FUSD: ${account.fusd}\n`).join('\n'));
      }
    }
  }

  await pause()

};

main();
