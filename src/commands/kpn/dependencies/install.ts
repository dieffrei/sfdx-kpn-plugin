import {flags, SfdxCommand} from '@salesforce/command';
import {Messages} from '@salesforce/core';
import {AnyJson} from '@salesforce/ts-types';
import {Connection} from 'jsforce';
// tslint:disable-next-line:no-var-requires
const spawn = require('child-process-promise').spawn;

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('sfdx-kpn-plugin', 'install');

export default class Install extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
    '$ sfdx kpn:dependencies:install --username myOrg@example.com --password pass123 --loginurl https://test.salesforce.com'
  ];

  protected static flagsConfig = {
    username: flags.string({char: 'u', description: 'username'}),
    password: flags.string({char: 'p', description: 'password'}),
    loginurl: flags.string({char: 'l', description: 'm'})
  };

  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {

    let loginUrl = (this.flags.loginurl == null)
      ? 'https://login.salesforce.com'
      : this.flags.loginurl;

    const conn = new Connection({
      loginUrl: loginUrl
    });

    await conn.loginBySoap(this.flags.username, this.flags.password);
    await spawn('sfdx', ['force:config:set', `instanceUrl=${conn.instanceUrl}`], { stdio: 'inherit' });
    await spawn('sfdx', ['texei:package:dependencies:install', `--targetusername='${conn.accessToken}'`], { stdio: 'inherit' });

    return {
      instanceUrl: conn.instanceUrl,
      accessToken: conn.accessToken
    };

  }
}
