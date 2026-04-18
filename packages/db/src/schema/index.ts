import { apikey, jwks } from "./api-keys";
import {
  account,
  passkey,
  session,
  twoFactor,
  user,
  verification,
} from "./auth";
import { integrationAccount } from "./integrations/base";
import { ircAccount } from "./irc";
import { mailcowAccount } from "./mailcow";
import {
  mlBookmark,
  mlMessage,
  mlPatchMeta,
  mlSource,
  mlThread,
  mlUserFollowSource,
  mlUserFollowThread,
  mlUserReadState,
} from "./mailing-lists";
import { mediawikiAccount } from "./mediawiki";
import {
  oauthAccessToken,
  oauthClient,
  oauthConsent,
  oauthRefreshToken,
} from "./oauth";
import { xmppAccount } from "./xmpp";
export const schema = {
  account,
  apikey,
  integrationAccount,
  ircAccount,
  jwks,
  mailcowAccount,
  mediawikiAccount,
  mlBookmark,
  mlMessage,
  mlPatchMeta,
  mlSource,
  mlThread,
  mlUserFollowSource,
  mlUserFollowThread,
  mlUserReadState,
  oauthAccessToken,
  oauthClient,
  oauthConsent,
  oauthRefreshToken,
  passkey,
  session,
  twoFactor,
  user,
  verification,
  xmppAccount,
};
